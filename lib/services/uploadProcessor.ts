// Upload processing service - handles verification and validation pipeline
// Implements idempotent state transitions with atomic DB operations

import { prisma } from '@/lib/services/db';
import { verifyWithRetry } from '@/lib/services/r2Storage';
import { validateImage } from '@/lib/services/imageValidation';
import { createServiceLogger } from '@/lib/utils/logger';
import { StateTransitionError, NotFoundError, toAppError } from '@/lib/errors/AppError';

const logger = createServiceLogger('uploadProcessor');

/**
 * Process upload verification and validation pipeline
 * This function is idempotent - safe to call multiple times
 *
 * @returns true if processing completed, false if already processed
 */
export async function processUploadVerification(
  imageId: string,
  r2Key: string,
  mimeType: string,
  fileSize: number
): Promise<{ success: boolean; status: string }> {
  const requestLogger = logger.child({ imageId, r2Key });
  requestLogger.info('Starting upload verification pipeline', { mimeType, fileSize });

  try {
    // STEP 1: Verify upload exists in R2 with retry mechanism
    requestLogger.info('Verifying upload to R2');

    const uploadExists = await verifyWithRetry(r2Key);

    // Update verification attempt counter (idempotent - just increments)
    await prisma.image.update({
      where: { id: imageId },
      data: {
        verificationAttempts: { increment: 1 },
        lastVerificationAt: new Date(),
      },
    });

    if (!uploadExists) {
      requestLogger.error('Upload verification failed after retries');

      // Atomic state transition: only update if in VERIFYING state
      const updated = await prisma.image.updateMany({
        where: {
          id: imageId,
          status: 'VERIFYING', // Only transition from VERIFYING
        },
        data: {
          status: 'UPLOAD_FAILED',
          rejectionReasons: ['UPLOAD_VERIFICATION_FAILED'],
        },
      });

      if (updated.count === 0) {
        requestLogger.warn('Already processed (not in VERIFYING state)');
        const current = await prisma.image.findUnique({
          where: { id: imageId },
          select: { status: true },
        });
        return { success: false, status: current?.status || 'UNKNOWN' };
      }

      return { success: true, status: 'UPLOAD_FAILED' };
    }

    requestLogger.info('Upload verified successfully');

    // STEP 2: Atomic transition to PROCESSING state
    // Uses updateMany with WHERE clause to ensure state guard
    const processingUpdate = await prisma.image.updateMany({
      where: {
        id: imageId,
        status: 'VERIFYING', // Only transition from VERIFYING
      },
      data: {
        status: 'PROCESSING',
      },
    });

    if (processingUpdate.count === 0) {
      // Image already processed or in wrong state (idempotent exit)
      requestLogger.warn('Already processing or processed, skipping validation');
      const current = await prisma.image.findUnique({
        where: { id: imageId },
        select: { status: true },
      });
      return { success: false, status: current?.status || 'UNKNOWN' };
    }

    // STEP 3: Run validation pipeline
    requestLogger.info('Running validation pipeline');

    const validationResult = await validateImage(r2Key, mimeType, fileSize);

    // STEP 4: Atomic final state update with transaction
    // This ensures that the final state is written atomically
    const finalStatus = validationResult.isValid ? 'ACCEPTED' : 'REJECTED';

    await prisma.$transaction(async (tx) => {
      // Double-check we're still in PROCESSING (guard against race conditions)
      const currentImage = await tx.image.findUnique({
        where: { id: imageId },
        select: { status: true },
      });

      if (currentImage?.status !== 'PROCESSING') {
        requestLogger.warn('State changed during validation, aborting update');
        throw new StateTransitionError('State changed during processing', {
          currentStatus: currentImage?.status,
        });
      }

      // Update to final state
      await tx.image.update({
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
    });

    requestLogger.info('Processing complete', { finalStatus });
    return { success: true, status: finalStatus };
  } catch (error) {
    const appError = toAppError(error);
    requestLogger.error('Error during verification/validation', {}, appError);

    // Atomic transition to REJECTED on error
    // Only update if still in PROCESSING or VERIFYING
    const errorUpdate = await prisma.image.updateMany({
      where: {
        id: imageId,
        status: { in: ['VERIFYING', 'PROCESSING'] },
      },
      data: {
        status: 'REJECTED',
        rejectionReasons: ['PROCESSING_ERROR'],
        processedAt: new Date(),
      },
    });

    if (errorUpdate.count === 0) {
      requestLogger.warn('Already in final state, not updating error');
      const current = await prisma.image.findUnique({
        where: { id: imageId },
        select: { status: true },
      });
      return { success: false, status: current?.status || 'UNKNOWN' };
    }

    return { success: true, status: 'REJECTED' };
  }
}

/**
 * Initiate upload verification process
 * This is the entry point called by the API route
 * Returns immediately after starting async processing
 */
export async function initiateUploadVerification(imageId: string): Promise<{
  started: boolean;
  currentStatus: string;
}> {
  const requestLogger = logger.child({ imageId });
  requestLogger.info('Initiating upload verification');

  // Atomic state transition from AWAITING_UPLOAD to VERIFYING
  const updated = await prisma.image.updateMany({
    where: {
      id: imageId,
      status: 'AWAITING_UPLOAD', // Only transition from AWAITING_UPLOAD
    },
    data: {
      status: 'VERIFYING',
      uploadCompletedAt: new Date(),
    },
  });

  if (updated.count === 0) {
    // Already processed or in wrong state (idempotent response)
    const current = await prisma.image.findUnique({
      where: { id: imageId },
      select: { status: true, r2Key: true, mimeType: true, fileSize: true },
    });

    if (!current) {
      throw new NotFoundError('Image not found', { imageId });
    }

    // If already VERIFYING or PROCESSING, return success (idempotent)
    if (current.status === 'VERIFYING' || current.status === 'PROCESSING') {
      requestLogger.info('Already in progress, returning idempotent response', {
        currentStatus: current.status,
      });
      return { started: false, currentStatus: current.status };
    }

    // If already in final state, return that state
    requestLogger.info('Already in final state', { currentStatus: current.status });
    return { started: false, currentStatus: current.status };
  }

  // State transition successful, fetch image data for processing
  const image = await prisma.image.findUnique({
    where: { id: imageId },
    select: { r2Key: true, mimeType: true, fileSize: true },
  });

  if (!image) {
    throw new NotFoundError('Image not found after state update', { imageId });
  }

  requestLogger.info('State transition successful, starting background processing');

  // Start background processing (fire-and-forget)
  // The function itself is idempotent, so multiple calls are safe
  processUploadVerification(imageId, image.r2Key, image.mimeType, image.fileSize || 0).catch(
    (error) => {
      const appError = toAppError(error);
      requestLogger.error('Background processing error', {}, appError);
    }
  );

  return { started: true, currentStatus: 'VERIFYING' };
}
