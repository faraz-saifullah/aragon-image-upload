// Image validation service
// Performs comprehensive validation checks on uploaded images
import sharp from 'sharp';
import { blockhashData } from 'blockhash-core';
import { prisma } from '@/lib/services/db';
import { env } from '@/lib/utils/env';
import { RejectionReason, ValidationResult } from '@/lib/types/image';
import { r2Client } from '@/lib/services/r2Storage';
import { GetObjectCommand } from '@aws-sdk/client-s3';

/**
 * Validate image format
 */
function validateFormat(mimeType: string): boolean {
  const allowedFormats = ['image/jpeg', 'image/png', 'image/heic'];
  return allowedFormats.includes(mimeType.toLowerCase());
}

/**
 * Validate image size (file size in bytes)
 */
function validateFileSize(fileSize: number): boolean {
  return fileSize >= env.MIN_FILE_SIZE_BYTES && fileSize <= env.MAX_UPLOAD_SIZE_BYTES;
}

/**
 * Validate image resolution using sharp
 */
async function validateResolution(imageBuffer: Buffer): Promise<{
  isValid: boolean;
  width: number;
  height: number;
}> {
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width || 0;
  const height = metadata.height || 0;

  const isValid = width >= env.MIN_WIDTH && height >= env.MIN_HEIGHT;

  return { isValid, width, height };
}

/**
 * Calculate perceptual hash (pHash) for duplicate detection using blockhash
 */
async function calculatePHash(imageBuffer: Buffer): Promise<string> {
  // Resize image to a standard size for consistent hashing
  const resized = await sharp(imageBuffer)
    .resize(256, 256, { fit: 'fill' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Calculate blockhash with 16 bits (produces 16-character hex string)
  const hash = blockhashData(resized.data, resized.info.width, resized.info.height, 16);

  return hash;
}

/**
 * Check for duplicate images using pHash comparison
 */
async function checkForDuplicates(phash: string): Promise<boolean> {
  // Find all accepted images with phash values
  const existingImages = await prisma.image.findMany({
    where: {
      status: 'ACCEPTED',
      phash: { not: null },
    },
    select: { phash: true },
  });

  // Calculate Hamming distance between hashes
  for (const existing of existingImages) {
    if (!existing.phash) continue;

    const distance = hammingDistance(phash, existing.phash);
    if (distance <= env.PHASH_THRESHOLD) {
      return true; // Duplicate found
    }
  }

  return false;
}

/**
 * Calculate Hamming distance between two hex strings
 */
function hammingDistance(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) return Infinity;

  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    const xor = parseInt(hash1[i], 16) ^ parseInt(hash2[i], 16);
    distance += xor.toString(2).split('1').length - 1;
  }
  return distance;
}

/**
 * Detect blur using Laplacian variance
 * STUB: Simplified implementation for demonstration
 * Production: Use OpenCV or more sophisticated algorithm
 */
async function detectBlur(imageBuffer: Buffer): Promise<{ blurScore: number; isBlurry: boolean }> {
  // STUB: Simple edge detection using sharp
  // In production, implement Laplacian variance or use OpenCV
  try {
    const stats = await sharp(imageBuffer).stats();

    // Use standard deviation as a rough proxy for sharpness
    // Higher values indicate more contrast/edges (sharper image)
    const blurScore =
      stats.channels.reduce((sum, channel) => sum + channel.stdev, 0) / stats.channels.length;

    // Threshold: images with score < 10 are considered blurry
    // STUB: This is a simplified heuristic
    const isBlurry = blurScore < 10;

    return { blurScore, isBlurry };
  } catch (error) {
    console.error('Error detecting blur:', error);
    // Default to not blurry if detection fails
    return { blurScore: 50, isBlurry: false };
  }
}

/**
 * Detect faces in image
 * STUB: Returns simulated results
 * Production: Integrate AWS Rekognition or OpenCV face detection
 */
async function detectFaces(_imageBuffer: Buffer): Promise<{
  faceCount: number;
  faceSize: number;
  hasMultipleFaces: boolean;
  faceTooSmall: boolean;
}> {
  // STUB: Simulated face detection
  // In production, integrate with AWS Rekognition, Google Vision, or OpenCV
  console.log('[STUB] Face detection called - returning simulated results');

  // Simulated results: assume single face of adequate size
  const faceCount = 1;
  const faceSize = 0.3; // 30% of image area (0-1 scale)
  const hasMultipleFaces = faceCount > 1;
  const faceTooSmall = faceSize < 0.1; // Less than 10% of image

  return {
    faceCount,
    faceSize,
    hasMultipleFaces,
    faceTooSmall,
  };
}

/**
 * Download image from R2 for processing
 */
async function downloadImageFromR2(r2Key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: r2Key,
  });

  const response = await r2Client.send(command);

  if (!response.Body) {
    throw new Error('No image data received from R2');
  }

  // Convert stream to buffer
  const chunks: Uint8Array[] = [];
  for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

/**
 * Main validation function that runs all checks
 */
export async function validateImage(
  r2Key: string,
  mimeType: string,
  fileSize: number
): Promise<ValidationResult> {
  const rejectionReasons: RejectionReason[] = [];
  const metadata: ValidationResult['metadata'] = {};

  try {
    // 1. Validate format
    if (!validateFormat(mimeType)) {
      rejectionReasons.push(RejectionReason.INVALID_FORMAT);
    }

    // 2. Validate file size
    if (!validateFileSize(fileSize)) {
      rejectionReasons.push(RejectionReason.FILE_TOO_SMALL);
    }

    // Download image for processing
    const imageBuffer = await downloadImageFromR2(r2Key);

    // Convert HEIC to JPEG if needed
    let processedBuffer = imageBuffer;
    if (mimeType === 'image/heic') {
      processedBuffer = await sharp(imageBuffer).jpeg().toBuffer();
    }

    // 3. Validate resolution
    const { isValid: resolutionValid, width, height } = await validateResolution(processedBuffer);
    metadata.width = width;
    metadata.height = height;
    metadata.fileSize = fileSize;

    if (!resolutionValid) {
      rejectionReasons.push(RejectionReason.RESOLUTION_TOO_LOW);
    }

    // 4. Calculate pHash and check for duplicates
    const phash = await calculatePHash(processedBuffer);
    metadata.phash = phash;

    const isDuplicate = await checkForDuplicates(phash);
    if (isDuplicate) {
      rejectionReasons.push(RejectionReason.DUPLICATE_IMAGE);
    }

    // 5. Detect blur
    const { blurScore, isBlurry } = await detectBlur(processedBuffer);
    metadata.blurScore = blurScore;

    if (isBlurry) {
      rejectionReasons.push(RejectionReason.IMAGE_TOO_BLURRY);
    }

    // 6. Detect faces (STUB)
    const { faceCount, faceSize, hasMultipleFaces, faceTooSmall } =
      await detectFaces(processedBuffer);
    metadata.faceCount = faceCount;
    metadata.faceSize = faceSize;

    if (hasMultipleFaces) {
      rejectionReasons.push(RejectionReason.MULTIPLE_FACES);
    }

    if (faceTooSmall) {
      rejectionReasons.push(RejectionReason.FACE_TOO_SMALL);
    }

    return {
      isValid: rejectionReasons.length === 0,
      rejectionReasons,
      metadata,
    };
  } catch (error) {
    console.error('Error validating image:', error);
    throw error;
  }
}
