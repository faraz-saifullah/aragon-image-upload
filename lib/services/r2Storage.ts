// Cloudflare R2 storage service using AWS SDK v3
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '@/lib/utils/env';

// Initialize S3 client for Cloudflare R2
export const r2Client = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Generate a presigned PUT URL for direct upload to R2
 */
export async function generatePresignedUploadUrl(
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const signedUrl = await getSignedUrl(r2Client, command, {
    expiresIn: env.PRESIGNED_URL_EXPIRY_SECONDS,
  });

  return signedUrl;
}

/**
 * Object metadata returned from R2
 */
export interface R2ObjectMetadata {
  exists: boolean;
  contentLength?: number;
  contentType?: string;
  lastModified?: Date;
  etag?: string;
}

/**
 * Verify that an object exists in R2 using HeadObject
 * Returns metadata including file size
 */
export async function verifyObjectExists(key: string): Promise<R2ObjectMetadata> {
  try {
    const command = new HeadObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
    });

    const response = await r2Client.send(command);

    return {
      exists: true,
      contentLength: response.ContentLength,
      contentType: response.ContentType,
      lastModified: response.LastModified,
      etag: response.ETag,
    };
  } catch (error: unknown) {
    // If error has a name property and it's NotFound, return false
    if (error && typeof error === 'object' && 'name' in error) {
      if (error.name === 'NotFound' || error.name === 'NoSuchKey') {
        return { exists: false };
      }
    }
    // Re-throw other errors
    throw error;
  }
}

/**
 * Retry verification with exponential backoff
 * This handles R2's eventual consistency
 * Returns metadata including file size, or exists: false if not found
 */
export async function verifyWithRetry(
  key: string,
  maxAttempts: number = env.MAX_VERIFICATION_ATTEMPTS,
  delayMs: number = env.VERIFICATION_RETRY_DELAY_MS
): Promise<R2ObjectMetadata> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const metadata = await verifyObjectExists(key);

    if (metadata.exists) {
      return metadata;
    }

    // Don't delay after the last attempt
    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return { exists: false };
}
