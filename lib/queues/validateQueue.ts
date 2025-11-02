/**
 * Validation Queue - Heavyweight job to download and validate images
 * Low concurrency (5 workers) since this is CPU and memory intensive
 */
import { Queue, Worker, Job } from 'bullmq';
import { redisConnection } from '@/lib/config/redis';
import { prisma } from '@/lib/services/db';
import { validateImage } from '@/lib/services/imageValidation';
import { createServiceLogger } from '@/lib/utils/logger';
import { StateTransitionError, toAppError } from '@/lib/errors/AppError';

const logger = createServiceLogger('validateQueue');

// Job data interface
export interface ValidateImageJobData {
  imageId: string;
  r2Key: string;
  mimeType: string;
  fileSize: number;
}

// Create the queue
export const validateQueue = new Queue<ValidateImageJobData>('validate-image', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 5000,
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
async function processValidateImage(job: Job<ValidateImageJobData>) {
  const { imageId, r2Key, mimeType, fileSize } = job.data;
  const jobLogger = logger.child({ imageId, r2Key, jobId: job.id });

  jobLogger.info('Starting image validation', { mimeType, fileSize });

  try {
    // Ensure we're in PROCESSING state
    const image = await prisma.image.findUnique({
      where: { id: imageId },
      select: { status: true },
    });

    if (!image) {
      jobLogger.error('Image not found');
      throw new Error('Image not found');
    }

    if (image.status !== 'PROCESSING') {
      jobLogger.warn('Image not in PROCESSING state', { currentStatus: image.status });
      // If already in final state, this is idempotent - just skip
      if (image.status === 'ACCEPTED' || image.status === 'REJECTED') {
        return { status: image.status, skipped: true };
      }
      throw new StateTransitionError('Invalid state for validation', {
        currentStatus: image.status,
      });
    }

    // Run validation pipeline (heavy CPU + memory work)
    jobLogger.info('Running validation pipeline');
    const validationResult = await validateImage(r2Key, mimeType, fileSize);

    const finalStatus = validationResult.isValid ? 'ACCEPTED' : 'REJECTED';
    jobLogger.info('Validation complete', {
      finalStatus,
      rejectionReasons: validationResult.rejectionReasons,
    });

    // Atomic final state update with transaction
    await prisma.$transaction(async (tx) => {
      const currentImage = await tx.image.findUnique({
        where: { id: imageId },
        select: { status: true },
      });

      if (currentImage?.status !== 'PROCESSING') {
        jobLogger.warn('State changed during validation, aborting update', {
          currentStatus: currentImage?.status,
        });
        throw new StateTransitionError('State changed during processing', {
          currentStatus: currentImage?.status,
        });
      }

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

    jobLogger.info('Image processing complete', { finalStatus });

    return { status: finalStatus, validationResult };
  } catch (error) {
    const appError = toAppError(error);
    jobLogger.error('Validation job failed', {}, appError);

    // Update to REJECTED with error on final attempt
    if (job.attemptsMade >= (job.opts.attempts || 1)) {
      jobLogger.error('Final attempt failed, marking as REJECTED');

      await prisma.image.updateMany({
        where: { id: imageId, status: { in: ['PROCESSING'] } },
        data: {
          status: 'REJECTED',
          rejectionReasons: ['PROCESSING_ERROR'],
          processedAt: new Date(),
        },
      });
    }

    throw error; // Re-throw for BullMQ retry logic
  }
}

// Create worker (will be started in worker process)
export function createValidateWorker() {
  const worker = new Worker<ValidateImageJobData>('validate-image', processValidateImage, {
    connection: redisConnection,
    concurrency: 5, // Low concurrency - CPU and memory intensive
  });

  worker.on('completed', (job) => {
    logger.info('Validation job completed', {
      jobId: job.id,
      imageId: job.data.imageId,
    });
  });

  worker.on('failed', (job, err) => {
    logger.error('Validation job failed', {
      jobId: job?.id,
      imageId: job?.data.imageId,
      error: err.message,
    });
  });

  worker.on('error', (err) => {
    logger.error('Validation worker error', {}, err);
  });

  logger.info('Validation worker created with concurrency 5');

  return worker;
}
