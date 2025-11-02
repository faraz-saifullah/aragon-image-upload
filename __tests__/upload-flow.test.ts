/**
 * Integration test for image upload and verification flow
 * Tests the complete flow from presigned URL generation to validation
 */
import { prisma } from '@/lib/services/db';
import { generatePresignedUploadUrl, verifyObjectExists } from '@/lib/services/r2Storage';

describe('Image Upload Flow Integration Test', () => {
  beforeAll(() => {
    // Ensure environment variables are set
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL must be set for integration tests');
    }
  });

  afterAll(async () => {
    // Cleanup: delete test images from database
    await prisma.image.deleteMany({
      where: {
        originalName: {
          startsWith: 'test-',
        },
      },
    });

    await prisma.$disconnect();
  });

  describe('Presigned URL Generation', () => {
    it('should generate a valid presigned URL', async () => {
      const testKey = 'test/test-image.jpg';
      const contentType = 'image/jpeg';

      const presignedUrl = await generatePresignedUploadUrl(testKey, contentType);

      expect(presignedUrl).toBeDefined();
      expect(typeof presignedUrl).toBe('string');
      expect(presignedUrl).toContain(testKey);
    });

    it('should create a database record with AWAITING_UPLOAD status', async () => {
      const testImage = await prisma.image.create({
        data: {
          filename: 'test-image.jpg',
          originalName: 'test-upload.jpg',
          mimeType: 'image/jpeg',
          fileSize: 1024000,
          r2Key: 'test/test-upload-123.jpg',
          status: 'AWAITING_UPLOAD',
        },
      });

      expect(testImage.id).toBeDefined();
      expect(testImage.status).toBe('AWAITING_UPLOAD');

      // Cleanup
      await prisma.image.delete({
        where: { id: testImage.id },
      });
    });
  });

  describe('State Machine Transitions', () => {
    it('should transition from AWAITING_UPLOAD to VERIFYING', async () => {
      const testImage = await prisma.image.create({
        data: {
          filename: 'test-state-transition.jpg',
          originalName: 'test-state-transition.jpg',
          mimeType: 'image/jpeg',
          fileSize: 1024000,
          r2Key: 'test/test-state-transition.jpg',
          status: 'AWAITING_UPLOAD',
        },
      });

      const updatedImage = await prisma.image.update({
        where: { id: testImage.id },
        data: {
          status: 'VERIFYING',
          uploadCompletedAt: new Date(),
        },
      });

      expect(updatedImage.status).toBe('VERIFYING');
      expect(updatedImage.uploadCompletedAt).toBeDefined();

      // Cleanup
      await prisma.image.delete({
        where: { id: testImage.id },
      });
    });

    it('should transition from PROCESSING to ACCEPTED', async () => {
      const testImage = await prisma.image.create({
        data: {
          filename: 'test-accepted.jpg',
          originalName: 'test-accepted.jpg',
          mimeType: 'image/jpeg',
          fileSize: 1024000,
          r2Key: 'test/test-accepted.jpg',
          status: 'PROCESSING',
          width: 800,
          height: 600,
          phash: 'abc123',
        },
      });

      const updatedImage = await prisma.image.update({
        where: { id: testImage.id },
        data: {
          status: 'ACCEPTED',
          processedAt: new Date(),
        },
      });

      expect(updatedImage.status).toBe('ACCEPTED');
      expect(updatedImage.processedAt).toBeDefined();

      // Cleanup
      await prisma.image.delete({
        where: { id: testImage.id },
      });
    });

    it('should transition from PROCESSING to REJECTED with reasons', async () => {
      const testImage = await prisma.image.create({
        data: {
          filename: 'test-rejected.jpg',
          originalName: 'test-rejected.jpg',
          mimeType: 'image/jpeg',
          fileSize: 1024000,
          r2Key: 'test/test-rejected.jpg',
          status: 'PROCESSING',
        },
      });

      const updatedImage = await prisma.image.update({
        where: { id: testImage.id },
        data: {
          status: 'REJECTED',
          rejectionReasons: ['RESOLUTION_TOO_LOW', 'IMAGE_TOO_BLURRY'],
          processedAt: new Date(),
        },
      });

      expect(updatedImage.status).toBe('REJECTED');
      expect(updatedImage.rejectionReasons).toHaveLength(2);
      expect(updatedImage.rejectionReasons).toContain('RESOLUTION_TOO_LOW');
      expect(updatedImage.rejectionReasons).toContain('IMAGE_TOO_BLURRY');

      // Cleanup
      await prisma.image.delete({
        where: { id: testImage.id },
      });
    });
  });

  describe('R2 Verification', () => {
    it('should return false for non-existent object', async () => {
      const nonExistentKey = 'test/non-existent-file-12345.jpg';

      const exists = await verifyObjectExists(nonExistentKey);

      expect(exists).toBe(false);
    }, 10000); // Longer timeout for network call
  });

  describe('Image Metadata Storage', () => {
    it('should store complete validation metadata', async () => {
      const testImage = await prisma.image.create({
        data: {
          filename: 'test-metadata.jpg',
          originalName: 'test-metadata.jpg',
          mimeType: 'image/jpeg',
          fileSize: 1024000,
          r2Key: 'test/test-metadata.jpg',
          status: 'ACCEPTED',
          width: 1920,
          height: 1080,
          phash: 'abc123def456',
          blurScore: 45.6,
          faceCount: 1,
          faceSize: 0.25,
          processedAt: new Date(),
        },
      });

      expect(testImage.width).toBe(1920);
      expect(testImage.height).toBe(1080);
      expect(testImage.phash).toBe('abc123def456');
      expect(testImage.blurScore).toBe(45.6);
      expect(testImage.faceCount).toBe(1);
      expect(testImage.faceSize).toBe(0.25);

      // Cleanup
      await prisma.image.delete({
        where: { id: testImage.id },
      });
    });
  });
});
