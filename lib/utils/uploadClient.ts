// Client-side upload utilities for presigned URL flow
import { ImageMetadata, PresignedUploadData } from '@/lib/types/image';

/**
 * Upload an image file to R2 using presigned URL flow
 */
export async function uploadImageToR2(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  // Step 1: Request presigned URL from backend
  const signResponse = await fetch('/api/uploads/sign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      fileSize: file.size,
    }),
  });

  if (!signResponse.ok) {
    const error = await signResponse.json();
    throw new Error(error.error || 'Failed to get presigned URL');
  }

  const presignedData: PresignedUploadData = await signResponse.json();

  // Step 2: Upload directly to R2 using presigned URL
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = (e.loaded / e.total) * 100;
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.open('PUT', presignedData.uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });

  // Step 3: Notify backend that upload is complete
  const completeResponse = await fetch('/api/uploads/complete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imageId: presignedData.imageId,
    }),
  });

  if (!completeResponse.ok) {
    const error = await completeResponse.json();
    throw new Error(error.error || 'Failed to complete upload');
  }

  return presignedData.imageId;
}

/**
 * Poll for image status updates
 */
export function pollImageStatus(
  imageId: string,
  onInitial: (image: ImageMetadata) => void,
  onUpdate: (image: ImageMetadata) => void
): void {
  let previousStatus: string | null = null;

  const poll = async () => {
    try {
      const response = await fetch(`/api/images/${imageId}`);
      if (response.ok) {
        const image: ImageMetadata = await response.json();

        // First time we see this image
        if (previousStatus === null) {
          onInitial(image);
        }

        // Status has changed
        if (previousStatus !== null && image.status !== previousStatus) {
          onUpdate(image);
        }

        previousStatus = image.status;

        // Stop polling if we've reached a final state
        if (['ACCEPTED', 'REJECTED', 'UPLOAD_FAILED'].includes(image.status)) {
          return;
        }

        // Continue polling
        setTimeout(poll, 2000); // Poll every 2 seconds
      }
    } catch (error) {
      console.error('Error polling image status:', error);
      // Retry after a delay
      setTimeout(poll, 5000);
    }
  };

  // Start polling
  poll();
}

/**
 * Fetch all images from the backend
 */
export async function fetchAllImages(status?: string): Promise<ImageMetadata[]> {
  const url = status ? `/api/images?status=${status}` : '/api/images';

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch images');
  }

  return response.json();
}
