// API Route: POST /api/uploads/complete
// Verifies upload to R2 and triggers validation pipeline
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/services/db';
import { initiateUploadVerification } from '@/lib/services/uploadProcessor';
import { toAppError } from '@/lib/errors/AppError';
import { logger } from '@/lib/utils/logger';

// Request validation schema
const CompleteRequestSchema = z.object({
  imageId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  let imageId: string | undefined;
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = CompleteRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    imageId = validation.data.imageId;

    // Verify image exists
    const image = await prisma.image.findUnique({
      where: { id: imageId },
      select: { id: true, status: true },
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Initiate upload verification with idempotent state transition
    // This function uses atomic updateMany to ensure idempotency
    const result = await initiateUploadVerification(imageId);

    // Return appropriate response based on whether processing was started
    if (result.started) {
      return NextResponse.json({
        imageId,
        status: result.currentStatus,
        message: 'Upload verification started',
      });
    } else {
      // Idempotent response: already processing or completed
      return NextResponse.json({
        imageId,
        status: result.currentStatus,
        message: 'Upload already processing or completed',
      });
    }
  } catch (error) {
    const appError = toAppError(error);
    logger.error('Error completing upload', { imageId }, appError);

    return NextResponse.json(
      {
        error: appError.code,
        message: appError.message,
        retryable: appError.retryable,
      },
      { status: appError.statusCode }
    );
  }
}
