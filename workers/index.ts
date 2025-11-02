/**
 * BullMQ Worker Process
 * Runs both verification and validation workers
 * Start with: npm run worker
 */
import { createVerifyWorker } from '../lib/queues/verifyQueue';
import { createValidateWorker } from '../lib/queues/validateQueue';
import { logger } from '../lib/utils/logger';

// Graceful shutdown handler
let isShuttingDown = false;

async function startWorkers() {
  logger.info('Starting BullMQ workers...');

  try {
    // Create both workers
    const verifyWorker = createVerifyWorker();
    const validateWorker = createValidateWorker();

    logger.info('✅ All workers started successfully', {
      verifyWorker: 'concurrency 20',
      validateWorker: 'concurrency 5',
    });

    // Graceful shutdown handler
    const shutdown = async (signal: string) => {
      if (isShuttingDown) return;
      isShuttingDown = true;

      logger.info(`Received ${signal}, shutting down gracefully...`);

      try {
        // Close workers
        await Promise.all([verifyWorker.close(), validateWorker.close()]);

        logger.info('Workers closed successfully');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown', {}, error as Error);
        process.exit(1);
      }
    };

    // Handle termination signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', {}, error);
      shutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection', { promise }, reason as Error);
      shutdown('unhandledRejection');
    });
  } catch (error) {
    logger.error('Failed to start workers', {}, error as Error);
    process.exit(1);
  }
}

// Start the workers
startWorkers();
