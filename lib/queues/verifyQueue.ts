/**
 * Verification Queue - Lightweight job to verify if image exists in R2
 * High concurrency (20 workers) since this is just network I/O
 */
import { Queue, Worker, Job } from 'bullmq';
import { redisConnection } from '@/lib/config/redis';
import { prisma } from '@/lib/services/db';
import { verifyWithRetry } from '@/lib/services/r2Storage';
import { createServiceLogger } from '@/lib/utils/logger';
import { NotFoundError, toAppError } from '@/lib/errors/AppError';

const logger = createServiceLogger('verifyQueue');

// Job data interface
export interface VerifyUploadJobData {
  imageId: string;
  r2Key: string;
}

// Create the queue
export const verifyQueue = new Queue<VerifyUploadJobData>('verify-upload', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 3600, // Keep completed jobs for 1 hour
      count: 1000,
    },
    removeOnFail: {
      age: 86400, // Keep failed jobs for 24 hours
    },
  },
});

// Worker function
async function processVerifyUpload(job: Job<VerifyUploadJobData>) {
  const { imageId, r2Key } = job.data;
  const jobLogger = logger.child({ imageId, r2Key, jobId: job.id });

  jobLogger.info('Starting upload verification');

  try {
    // Update status to VERIFYING (idempotent)
    const updated = await prisma.image.updateMany({
      where: { id: imageId, status: 'AWAITING_UPLOAD' },
      data: {
        status: 'VERIFYING',
        uploadCompletedAt: new Date(),
      },
    });

    if (updated.count === 0) {
      const current = await prisma.image.findUnique({
        where: { id: imageId },
        select: { status: true },
      });
      jobLogger.info('Already in progress or completed', { currentStatus: current?.status });

      // Not an error - job is idempotent
      if (current?.status === 'VERIFYING' || current?.status === 'PROCESSING') {
        return { status: current.status, alreadyProcessing: true };
      }
      return { status: current?.status, skipped: true };
    }

    // Get expected file size from database
    const imageData = await prisma.image.findUnique({
      where: { id: imageId },
      select: { fileSize: true },
    });

    const expectedSize = imageData?.fileSize;

    // Verify upload exists in R2 with retries
    jobLogger.info('Verifying object existence and size in R2', { expectedSize });
    const metadata = await verifyWithRetry(r2Key);

    // Update verification attempts
    await prisma.image.update({
      where: { id: imageId },
      data: {
        verificationAttempts: { increment: 1 },
        lastVerificationAt: new Date(),
      },
    });

    if (!metadata.exists) {
      jobLogger.error('Upload verification failed after retries - object not found');

      // Mark as UPLOAD_FAILED (idempotent)
      const failedUpdate = await prisma.image.updateMany({
        where: { id: imageId, status: 'VERIFYING' },
        data: {
          status: 'UPLOAD_FAILED',
          rejectionReasons: ['UPLOAD_VERIFICATION_FAILED'],
        },
      });

      if (failedUpdate.count === 0) {
        jobLogger.warn('Already processed before marking as failed');
      }

      throw new Error('Upload verification failed - object not found in R2');
    }

    // Verify file size matches (allow 2% tolerance for metadata overhead)
    if (expectedSize && metadata.contentLength) {
      const actualSize = metadata.contentLength;
      const sizeDifference = Math.abs(actualSize - expectedSize);
      const percentDifference = (sizeDifference / expectedSize) * 100;

      jobLogger.info('Comparing file sizes', {
        expectedSize,
        actualSize,
        difference: sizeDifference,
        percentDifference: percentDifference.toFixed(2),
      });

      // Allow 2% tolerance for small metadata differences
      if (percentDifference > 2) {
        jobLogger.error('File size mismatch detected', {
          expectedSize,
          actualSize,
          percentDifference: percentDifference.toFixed(2),
        });

        // Mark as UPLOAD_FAILED due to size mismatch
        const failedUpdate = await prisma.image.updateMany({
          where: { id: imageId, status: 'VERIFYING' },
          data: {
            status: 'UPLOAD_FAILED',
            rejectionReasons: ['FILE_SIZE_MISMATCH'],
          },
        });

        if (failedUpdate.count === 0) {
          jobLogger.warn('Already processed before marking as failed');
        }

        throw new Error(
          `File size mismatch - expected ${expectedSize} bytes, got ${actualSize} bytes (${percentDifference.toFixed(2)}% difference)`
        );
      }
    }

    jobLogger.info('Upload verified successfully (existence + size), queueing validation');

    // Transition to PROCESSING and get image data for validation
    const processingUpdate = await prisma.image.updateMany({
      where: { id: imageId, status: 'VERIFYING' },
      data: { status: 'PROCESSING' },
    });

    if (processingUpdate.count === 0) {
      jobLogger.warn('Already transitioned to PROCESSING by another job');
      return { status: 'PROCESSING', alreadyQueued: true };
    }

    // Get image data for validation queue
    const image = await prisma.image.findUnique({
      where: { id: imageId },
      select: {
        id: true,
        r2Key: true,
        mimeType: true,
        fileSize: true,
      },
    });

    if (!image) {
      throw new NotFoundError('Image not found after verification', { imageId });
    }

    // Queue the validation job
    const { validateQueue } = await import('./validateQueue');
    await validateQueue.add('validate-image', {
      imageId: image.id,
      r2Key: image.r2Key,
      mimeType: image.mimeType,
      fileSize: image.fileSize || 0,
    });

    jobLogger.info('Validation job queued successfully');

    return { status: 'PROCESSING', validationQueued: true };
  } catch (error) {
    const appError = toAppError(error);
    jobLogger.error('Verification job failed', {}, appError);

    // Update to UPLOAD_FAILED if still in VERIFYING state
    await prisma.image.updateMany({
      where: { id: imageId, status: 'VERIFYING' },
      data: {
        status: 'UPLOAD_FAILED',
        rejectionReasons: ['VERIFICATION_ERROR'],
      },
    });

    throw error; // Re-throw for BullMQ retry logic
  }
}

// Create worker (will be started in worker process)
export function createVerifyWorker() {
  const worker = new Worker<VerifyUploadJobData>('verify-upload', processVerifyUpload, {
    connection: redisConnection,
    concurrency: 20, // High concurrency - lightweight network operations
  });

  worker.on('completed', (job) => {
    logger.info('Verification job completed', {
      jobId: job.id,
      imageId: job.data.imageId,
    });
  });

  worker.on('failed', (job, err) => {
    logger.error('Verification job failed', {
      jobId: job?.id,
      imageId: job?.data.imageId,
      error: err.message,
    });
  });

  worker.on('error', (err) => {
    logger.error('Verification worker error', {}, err);
  });

  logger.info('Verification worker created with concurrency 20');

  return worker;
}
