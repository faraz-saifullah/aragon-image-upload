// API Route: POST /api/uploads/complete
// Verifies upload to R2 and triggers validation pipeline
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/services/db';
import { verifyWithRetry } from '@/lib/services/r2Storage';
import { validateImage } from '@/lib/services/imageValidation';

// Request validation schema
const CompleteRequestSchema = z.object({
  imageId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = CompleteRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { imageId } = validation.data;

    // Fetch image record
    const image = await prisma.image.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Verify current state
    if (image.status !== 'AWAITING_UPLOAD') {
      return NextResponse.json(
        {
          error: 'Invalid state transition',
          currentStatus: image.status,
        },
        { status: 400 }
      );
    }

    // Update to VERIFYING state
    await prisma.image.update({
      where: { id: imageId },
      data: {
        status: 'VERIFYING',
        uploadCompletedAt: new Date(),
      },
    });

    // Verify upload with retry mechanism (async processing)
    // This runs in the background to avoid blocking the response
    processUploadVerification(imageId, image.r2Key, image.mimeType, image.fileSize || 0).catch(
      (error) => {
        console.error(`Error processing upload verification for ${imageId}:`, error);
      }
    );

    return NextResponse.json({
      imageId,
      status: 'VERIFYING',
      message: 'Upload verification started',
    });
  } catch (error) {
    console.error('Error completing upload:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Background process for upload verification and validation
 */
async function processUploadVerification(
  imageId: string,
  r2Key: string,
  mimeType: string,
  fileSize: number
): Promise<void> {
  try {
    // Step 1: Verify upload exists in R2 with retry mechanism
    console.log(`[${imageId}] Verifying upload to R2...`);

    const uploadExists = await verifyWithRetry(r2Key);

    await prisma.image.update({
      where: { id: imageId },
      data: {
        verificationAttempts: { increment: 1 },
        lastVerificationAt: new Date(),
      },
    });

    if (!uploadExists) {
      console.error(`[${imageId}] Upload verification failed after retries`);

      await prisma.image.update({
        where: { id: imageId },
        data: {
          status: 'UPLOAD_FAILED',
          rejectionReasons: ['UPLOAD_VERIFICATION_FAILED'],
        },
      });

      return;
    }

    console.log(`[${imageId}] Upload verified successfully`);

    // Step 2: Update to PROCESSING state
    await prisma.image.update({
      where: { id: imageId },
      data: {
        status: 'PROCESSING',
      },
    });

    // Step 3: Run validation pipeline
    console.log(`[${imageId}] Running validation pipeline...`);

    const validationResult = await validateImage(r2Key, mimeType, fileSize);

    // Step 4: Update final status based on validation
    const finalStatus = validationResult.isValid ? 'ACCEPTED' : 'REJECTED';

    await prisma.image.update({
      where: { id: imageId },
      data: {
        status: finalStatus,
        rejectionReasons: validationResult.rejectionReasons.map((r) => r.toString()),
        width: validationResult.metadata.width,
        height: validationResult.metadata.height,
        phash: validationResult.metadata.phash,
        blurScore: validationResult.metadata.blurScore,
        faceCount: validationResult.metadata.faceCount,
        faceSize: validationResult.metadata.faceSize,
        processedAt: new Date(),
      },
    });

    console.log(`[${imageId}] Processing complete - Status: ${finalStatus}`);
  } catch (error) {
    console.error(`[${imageId}] Error during verification/validation:`, error);

    // Mark as rejected with error
    await prisma.image.update({
      where: { id: imageId },
      data: {
        status: 'REJECTED',
        rejectionReasons: ['PROCESSING_ERROR'],
      },
    });
  }
}
