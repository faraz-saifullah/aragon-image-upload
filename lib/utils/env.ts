// Environment variable utilities with validation

export const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',

  // R2/S3 Configuration
  S3_ENDPOINT: process.env.S3_ENDPOINT || '',
  S3_BUCKET: process.env.S3_BUCKET || 'aragon-uploads',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
  S3_REGION: process.env.S3_REGION || 'auto',

  // Validation Settings
  MAX_UPLOAD_SIZE_BYTES: parseInt(process.env.MAX_UPLOAD_SIZE_BYTES || '8000000', 10),
  MIN_WIDTH: parseInt(process.env.MIN_WIDTH || '400', 10),
  MIN_HEIGHT: parseInt(process.env.MIN_HEIGHT || '400', 10),
  MIN_FILE_SIZE_BYTES: parseInt(process.env.MIN_FILE_SIZE_BYTES || '51200', 10),
  PHASH_THRESHOLD: parseInt(process.env.PHASH_THRESHOLD || '10', 10),

  // Upload Verification
  MAX_VERIFICATION_ATTEMPTS: parseInt(process.env.MAX_VERIFICATION_ATTEMPTS || '3', 10),
  VERIFICATION_RETRY_DELAY_MS: parseInt(process.env.VERIFICATION_RETRY_DELAY_MS || '5000', 10),

  // Presigned URL
  PRESIGNED_URL_EXPIRY_SECONDS: parseInt(process.env.PRESIGNED_URL_EXPIRY_SECONDS || '300', 10),
} as const;

// Validate critical environment variables
export function validateEnv(): void {
  const required = [
    'DATABASE_URL',
    'S3_ENDPOINT',
    'S3_BUCKET',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please check your .env file and ensure all required variables are set.'
    );
  }
}
