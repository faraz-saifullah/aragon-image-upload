// Type definitions for image upload and validation

export enum ImageStatus {
  AWAITING_UPLOAD = 'AWAITING_UPLOAD',
  VERIFYING = 'VERIFYING',
  PROCESSING = 'PROCESSING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
}

export enum RejectionReason {
  INVALID_FORMAT = 'INVALID_FORMAT',
  FILE_TOO_SMALL = 'FILE_TOO_SMALL',
  RESOLUTION_TOO_LOW = 'RESOLUTION_TOO_LOW',
  DUPLICATE_IMAGE = 'DUPLICATE_IMAGE',
  IMAGE_TOO_BLURRY = 'IMAGE_TOO_BLURRY',
  FACE_TOO_SMALL = 'FACE_TOO_SMALL',
  MULTIPLE_FACES = 'MULTIPLE_FACES',
  UPLOAD_VERIFICATION_FAILED = 'UPLOAD_VERIFICATION_FAILED',
}

export interface ImageMetadata {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize?: number;
  width?: number;
  height?: number;
  r2Key: string;
  r2Url?: string;
  status: ImageStatus;
  rejectionReasons: string[];
  phash?: string;
  blurScore?: number;
  faceCount?: number;
  faceSize?: number;
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
}

export interface PresignedUploadData {
  imageId: string;
  uploadUrl: string;
  r2Key: string;
  expiresAt: string;
}

export interface ValidationResult {
  isValid: boolean;
  rejectionReasons: RejectionReason[];
  metadata: {
    width?: number;
    height?: number;
    fileSize?: number;
    phash?: string;
    blurScore?: number;
    faceCount?: number;
    faceSize?: number;
  };
}
