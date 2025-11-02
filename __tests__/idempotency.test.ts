/**
 * Idempotency Tests
 * Ensures that DB operations are safe to retry and don't cause race conditions
 */

import { prisma } from '@/lib/services/db';
import {
  initiateUploadVerification,
  processUploadVerification,
} from '@/lib/services/uploadProcessor';

// Mock the external dependencies
jest.mock('@/lib/services/r2Storage', () => ({
  verifyWithRetry: jest.fn().mockResolvedValue(true),
}));

jest.mock('@/lib/services/imageValidation', () => ({
  validateImage: jest.fn().mockResolvedValue({
    isValid: true,
    rejectionReasons: [],
    metadata: {
      width: 1920,
      height: 1080,
      fileSize: 1024000,
      phash: 'abc123',
      blurScore: 50,
      faceCount: 1,
      faceSize: 0.3,
    },
  }),
}));

describe('Upload Processing Idempotency', () => {
  const testImageId = 'test-image-123';
  const testR2Key = 'uploads/test-image-123.jpg';

  beforeEach(async () => {
    // Clean up test data
    await prisma.image.deleteMany({
      where: { id: testImageId },
    });

    // Create a test image in AWAITING_UPLOAD state
    await prisma.image.create({
      data: {
        id: testImageId,
        filename: 'test-image-123.jpg',
        originalName: 'test.jpg',
        mimeType: 'image/jpeg',
        r2Key: testR2Key,
        status: 'AWAITING_UPLOAD',
        fileSize: 1024000,
      },
    });
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.image.deleteMany({
      where: { id: testImageId },
    });
  });

  describe('initiateUploadVerification', () => {
    it('should transition from AWAITING_UPLOAD to VERIFYING', async () => {
      const result = await initiateUploadVerification(testImageId);

      expect(result.started).toBe(true);
      expect(result.currentStatus).toBe('VERIFYING');

      const image = await prisma.image.findUnique({
        where: { id: testImageId },
      });

      expect(image?.status).toBe('VERIFYING');
      expect(image?.uploadCompletedAt).toBeDefined();
    });

    it('should be idempotent when called twice (second call returns existing state)', async () => {
      // First call - should start processing
      const result1 = await initiateUploadVerification(testImageId);
      expect(result1.started).toBe(true);
      expect(result1.currentStatus).toBe('VERIFYING');

      // Second call - should return idempotent response
      const result2 = await initiateUploadVerification(testImageId);
      expect(result2.started).toBe(false);
      expect(result2.currentStatus).toBe('VERIFYING');

      // Verify only one transition happened
      const image = await prisma.image.findUnique({
        where: { id: testImageId },
      });
      expect(image?.status).toBe('VERIFYING');
    });

    it('should handle concurrent calls safely (race condition test)', async () => {
      // Simulate concurrent API calls from client
      const [result1, result2, result3] = await Promise.all([
        initiateUploadVerification(testImageId),
        initiateUploadVerification(testImageId),
        initiateUploadVerification(testImageId),
      ]);

      // Only ONE should have started processing
      const startedCount = [result1, result2, result3].filter((r) => r.started).length;
      expect(startedCount).toBe(1);

      // All should return VERIFYING status
      expect(result1.currentStatus).toBe('VERIFYING');
      expect(result2.currentStatus).toBe('VERIFYING');
      expect(result3.currentStatus).toBe('VERIFYING');

      const image = await prisma.image.findUnique({
        where: { id: testImageId },
      });
      expect(image?.status).toBe('VERIFYING');
    });

    it('should return current status if already in final state', async () => {
      // Manually set to final state
      await prisma.image.update({
        where: { id: testImageId },
        data: { status: 'ACCEPTED' },
      });

      const result = await initiateUploadVerification(testImageId);

      expect(result.started).toBe(false);
      expect(result.currentStatus).toBe('ACCEPTED');
    });
  });

  describe('processUploadVerification', () => {
    beforeEach(async () => {
      // Set image to VERIFYING state (as if initiateUploadVerification was called)
      await prisma.image.update({
        where: { id: testImageId },
        data: { status: 'VERIFYING' },
      });
    });

    it('should process image and transition through states correctly', async () => {
      const result = await processUploadVerification(testImageId, testR2Key, 'image/jpeg', 1024000);

      expect(result.success).toBe(true);
      expect(result.status).toBe('ACCEPTED');

      const image = await prisma.image.findUnique({
        where: { id: testImageId },
      });

      expect(image?.status).toBe('ACCEPTED');
      expect(image?.processedAt).toBeDefined();
      expect(image?.width).toBe(1920);
      expect(image?.height).toBe(1080);
    });

    it('should be idempotent when called twice (second call skips processing)', async () => {
      // First call - should process
      const result1 = await processUploadVerification(
        testImageId,
        testR2Key,
        'image/jpeg',
        1024000
      );
      expect(result1.success).toBe(true);
      expect(result1.status).toBe('ACCEPTED');

      // Second call - should detect already processed and skip
      const result2 = await processUploadVerification(
        testImageId,
        testR2Key,
        'image/jpeg',
        1024000
      );
      expect(result2.success).toBe(false); // Didn't process
      expect(result2.status).toBe('ACCEPTED'); // Still in final state

      const image = await prisma.image.findUnique({
        where: { id: testImageId },
      });
      expect(image?.status).toBe('ACCEPTED');
    });

    it('should handle concurrent processing calls (race condition test)', async () => {
      // Simulate duplicate background job executions
      const results = await Promise.allSettled([
        processUploadVerification(testImageId, testR2Key, 'image/jpeg', 1024000),
        processUploadVerification(testImageId, testR2Key, 'image/jpeg', 1024000),
        processUploadVerification(testImageId, testR2Key, 'image/jpeg', 1024000),
      ]);

      // All should complete without errors
      results.forEach((result) => {
        expect(result.status).toBe('fulfilled');
      });

      // Only ONE should have actually processed
      const successCount = results.filter(
        (r) => r.status === 'fulfilled' && r.value.success
      ).length;
      expect(successCount).toBeLessThanOrEqual(1);

      // Final state should be correct
      const image = await prisma.image.findUnique({
        where: { id: testImageId },
      });
      expect(image?.status).toBe('ACCEPTED');
    });

    it('should not process if already in PROCESSING state', async () => {
      // Manually set to PROCESSING (as if another instance is processing)
      await prisma.image.update({
        where: { id: testImageId },
        data: { status: 'PROCESSING' },
      });

      const result = await processUploadVerification(testImageId, testR2Key, 'image/jpeg', 1024000);

      expect(result.success).toBe(false);
      expect(result.status).toBe('PROCESSING');
    });

    it('should not overwrite final state', async () => {
      // Manually set to final ACCEPTED state
      await prisma.image.update({
        where: { id: testImageId },
        data: {
          status: 'ACCEPTED',
          width: 1000,
          height: 1000,
          processedAt: new Date(),
        },
      });

      const result = await processUploadVerification(testImageId, testR2Key, 'image/jpeg', 1024000);

      expect(result.success).toBe(false);
      expect(result.status).toBe('ACCEPTED');

      // Verify original data wasn't overwritten
      const image = await prisma.image.findUnique({
        where: { id: testImageId },
      });
      expect(image?.width).toBe(1000); // Original value preserved
      expect(image?.height).toBe(1000); // Original value preserved
    });
  });
});
