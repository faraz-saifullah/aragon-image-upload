// API Route: POST /api/uploads/complete
// Queues upload verification job (instant response)
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/services/db';
import { verifyQueue } from '@/lib/queues/verifyQueue';
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

    // Verify image exists and get r2Key
    const image = await prisma.image.findUnique({
      where: { id: imageId },
      select: { id: true, r2Key: true, status: true },
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Idempotent: Only queue if in AWAITING_UPLOAD state
    if (image.status === 'AWAITING_UPLOAD') {
      // Queue the verification job (instant return)
      await verifyQueue.add('verify-upload', {
        imageId: image.id,
        r2Key: image.r2Key,
      });

      logger.info('Verification job queued', { imageId });

      return NextResponse.json({
        imageId,
        status: 'VERIFYING',
        message: 'Verification queued',
      });
    } else {
      // Already queued or processing
      logger.info('Upload already processing', { imageId, currentStatus: image.status });

      return NextResponse.json({
        imageId,
        status: image.status,
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
