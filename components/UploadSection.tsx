'use client';

import { useState, useCallback, useRef } from 'react';
import { uploadImageToR2, pollImageStatus } from '@/lib/utils/uploadClient';
import { ImageMetadata } from '@/lib/types/image';
import { UploadIcon } from '@/components/icons';
import { Button } from '@/components/ui';
import { theme, upload } from '@/lib/theme';

interface UploadSectionProps {
  onUploadComplete: (image: ImageMetadata) => void;
  onStatusUpdate: (image: ImageMetadata) => void;
}

interface UploadingFile {
  file: File;
  preview: string;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
  imageId?: string;
}

const ALLOWED_TYPES = upload.allowedTypes;
const MAX_FILE_SIZE = upload.maxFileSize;

export function UploadSection({ onUploadComplete, onStatusUpdate }: UploadSectionProps) {
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, UploadingFile>>(new Map());
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
      return `Invalid file type. Allowed: JPEG, PNG, HEIC`;
    }

    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Max size: 120MB`;
    }

    return null;
  };

  // Concurrency control
  const activeUploadsRef = useRef<number>(0);
  const MAX_CONCURRENT_UPLOADS = 10;

  const uploadFile = useCallback(
    async (file: File, key: string) => {
      const error = validateFile(file);

      if (error) {
        setUploadingFiles((prev) =>
          new Map(prev).set(key, {
            file,
            preview: URL.createObjectURL(file),
            status: 'error',
            error,
          })
        );
        return;
      }

      try {
        activeUploadsRef.current += 1;

        // Upload to R2
        const imageId = await uploadImageToR2(file, () => {
          // Progress callback - not displayed in UI
        });

        // Upload complete, now processing
        setUploadingFiles((prev) => {
          const current = prev.get(key);
          if (current) {
            return new Map(prev).set(key, {
              ...current,
              status: 'processing',
              imageId,
            });
          }
          return prev;
        });

        // Poll for status
        pollImageStatus(
          imageId,
          (image) => {
            // Complete - remove from uploading list
            setUploadingFiles((prev) => {
              const newMap = new Map(prev);
              newMap.delete(key);
              return newMap;
            });
            onUploadComplete(image);
          },
          (image) => {
            onStatusUpdate(image);
            if (image.status === 'REJECTED' || image.status === 'UPLOAD_FAILED') {
              setUploadingFiles((prev) => {
                const newMap = new Map(prev);
                newMap.delete(key);
                return newMap;
              });
            }
          }
        );
      } catch (error) {
        console.error(`Upload error for ${file.name}:`, error);
        setUploadingFiles((prev) => {
          const current = prev.get(key);
          if (current) {
            return new Map(prev).set(key, {
              ...current,
              status: 'error',
              error: error instanceof Error ? error.message : 'Upload failed',
            });
          }
          return prev;
        });
      } finally {
        activeUploadsRef.current -= 1;
      }
    },
    [onUploadComplete, onStatusUpdate]
  );

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      const filesToUpload = Array.from(files);
      const queue: Array<{ file: File; key: string }> = [];

      // Add all files to UI immediately
      filesToUpload.forEach((file) => {
        const key = `${file.name}-${Date.now()}-${Math.random()}`;
        const preview = URL.createObjectURL(file);
        queue.push({ file, key });

        // Show pending state
        setUploadingFiles((prev) =>
          new Map(prev).set(key, {
            file,
            preview,
            status: 'uploading',
          })
        );
      });

      // Process queue with concurrency control
      const processQueue = async () => {
        while (queue.length > 0) {
          if (activeUploadsRef.current < MAX_CONCURRENT_UPLOADS) {
            const item = queue.shift();
            if (item) {
              uploadFile(item.file, item.key);
            }
          } else {
            // Wait a bit before checking again
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }
      };

      processQueue();
    },
    [uploadFile]
  );

  const handleRemove = useCallback((key: string) => {
    setUploadingFiles((prev) => {
      const newMap = new Map(prev);
      const file = newMap.get(key);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      newMap.delete(key);
      return newMap;
    });
  }, []);

  const handleRetry = useCallback(
    (key: string, file: File) => {
      // Remove old entry and upload again with new key
      setUploadingFiles((prev) => {
        const newMap = new Map(prev);
        const oldFile = newMap.get(key);
        if (oldFile?.preview) {
          URL.revokeObjectURL(oldFile.preview);
        }
        newMap.delete(key);
        return newMap;
      });

      // Create new key and retry
      const newKey = `${file.name}-${Date.now()}-${Math.random()}`;
      const preview = URL.createObjectURL(file);

      setUploadingFiles((prev) =>
        new Map(prev).set(newKey, {
          file,
          preview,
          status: 'uploading',
        })
      );

      uploadFile(file, newKey);
    },
    [uploadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="flex w-full justify-center md:mb-60 md:w-auto md:justify-start">
      <div
        className="flex w-auto flex-col gap-6"
        style={{ maxWidth: theme.layout.maxWidth.content }}
      >
        {/* Header */}
        <div className="flex flex-col gap-2 text-left">
          <div className="flex flex-col gap-2">
            <UploadIcon size={24} />
            <span className="text-2xl font-semibold text-black">Upload photos</span>
          </div>
          <div className="text-base text-neutral-700">
            Now the fun begins! Select at least{' '}
            <span className="font-bold">{upload.minRequiredCount} of your best photos.</span>{' '}
            Uploading <b>a mix of close-ups, selfies and mid-range shots</b> can help the AI better
            capture your face and body type.
          </div>
        </div>

        {/* Upload from Computer */}
        <div className="flex w-full flex-col items-center text-sm text-black">
          <div className="mb-4 hidden w-full items-center gap-2 text-left text-base font-bold md:flex">
            <svg
              width="24px"
              height="24px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 21V19H10V17H4C3.45 17 2.97917 16.8042 2.5875 16.4125C2.19583 16.0208 2 15.55 2 15V5C2 4.45 2.19583 3.97917 2.5875 3.5875C2.97917 3.19583 3.45 3 4 3H20C20.55 3 21.0208 3.19583 21.4125 3.5875C21.8042 3.97917 22 4.45 22 5V15C22 15.55 21.8042 16.0208 21.4125 16.4125C21.0208 16.8042 20.55 17 20 17H14V19H16V21H8ZM4 15H20V5H4V15Z"
                fill="#1D1D1E"
              ></path>
            </svg>
            Upload from your computer
          </div>

          <label className="w-full">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={handleClick}
              className={`flex h-40 w-full cursor-pointer flex-col items-center justify-center gap-5 rounded-xl bg-clip-padding bg-center bg-no-repeat transition-all ${
                isDragging ? 'border-orange-500 bg-orange-50' : 'hover:border-orange-500'
              }`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='none' rx='12' ry='12' stroke='%23A6A6A6' stroke-width='2' stroke-dasharray='6' stroke-dashoffset='70' stroke-linecap='square'/%3E%3C/svg%3E")`,
                height: '180px',
                transitionDuration: theme.transitions.normal,
              }}
            >
              <Button variant="gradient-primary" size="md">
                <span>Upload files</span>
                <svg
                  width="16px"
                  height="16px"
                  viewBox="0 0 17 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-2"
                >
                  <path
                    d="M7.5 12V3.85L4.9 6.45L3.5 5L8.5 0L13.5 5L12.1 6.45L9.5 3.85V12H7.5ZM2.5 16C1.95 16 1.47917 15.8042 1.0875 15.4125C0.695833 15.0208 0.5 14.55 0.5 14V11H2.5V14H14.5V11H16.5V14C16.5 14.55 16.3042 15.0208 15.9125 15.4125C15.5208 15.8042 15.05 16 14.5 16H2.5Z"
                    fill="currentColor"
                  />
                </svg>
              </Button>

              <div className="px-5 text-center">
                <p className="text-[13px] font-semibold text-neutral-700">
                  or<span className="text-orange-500"> drag and drop </span>your photos
                </p>
                <span className="text-xs text-neutral-600">PNG, JPG, HEIC, WEBP up to 120MB</span>
              </div>

              <input
                ref={fileInputRef}
                id="fileInput"
                type="file"
                multiple
                accept={ALLOWED_TYPES.join(',')}
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
                aria-label="Upload files"
              />
            </div>
          </label>
        </div>

        {/* Uploading Files Progress */}
        {uploadingFiles.size > 0 && (
          <div className="mt-4 w-full rounded-lg border border-solid border-gray-300 !pb-0">
            {/* Accordion Header */}
            <div className="border-b">
              <button
                type="button"
                className="flex w-full flex-1 items-center justify-between px-4 pb-2 pt-3 font-medium transition-all hover:no-underline"
              >
                <div className="flex w-full items-center gap-2 tabular-nums">
                  <span className="font-bold text-black">
                    Uploading {uploadingFiles.size} {uploadingFiles.size === 1 ? 'photo' : 'photos'}
                  </span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 shrink-0 stroke-black"
                >
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
              </button>
            </div>

            {/* Subtext */}
            <div className="flex w-full items-center justify-between px-5 py-2 tabular-nums">
              <span className="text-sm text-gray-600">It can take up to 1 minute to upload</span>
            </div>

            {/* Uploading Items */}
            <div className="p-2">
              <div className="flex w-full flex-col items-center gap-0 rounded-lg border border-solid border-gray-300 !pb-0">
                {Array.from(uploadingFiles.entries()).map(([key, uploadFile]) => (
                  <div
                    key={key}
                    className="flex h-fit max-h-28 w-full flex-row items-center justify-center gap-2 bg-stone-50 p-2 shadow-sm"
                  >
                    {/* Left side: Preview + Filename */}
                    <div className="relative flex h-full min-w-0 flex-1 items-center justify-start gap-2">
                      {/* Image Preview */}
                      <div className="relative flex aspect-square h-10 items-center">
                        <div className="h-10 w-10 overflow-hidden rounded-md border border-solid border-gray-300">
                          <img
                            src={uploadFile.preview}
                            alt={uploadFile.file.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Filename */}
                      <div className="flex flex-col gap-0.5 pr-0.5 text-left text-sm md:w-36">
                        <div className="truncate text-gray-900">{uploadFile.file.name}</div>
                        {/* Error Status */}
                        {uploadFile.status === 'error' && (
                          <div className="text-xs text-red-600">{uploadFile.error}</div>
                        )}
                      </div>
                    </div>

                    {/* Right side: Spinner / Error Actions */}
                    <div className="flex flex-row items-center justify-center gap-2">
                      {(uploadFile.status === 'uploading' ||
                        uploadFile.status === 'processing') && (
                          <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-solid border-l-stone-200 border-r-orange-500 border-t-orange-500 border-b-orange-500" />
                        )}
                      {uploadFile.status === 'error' && (
                        <>
                          {/* Retry Icon */}
                          <button
                            onClick={() => handleRetry(key, uploadFile.file)}
                            className="transition-colors hover:text-orange-600"
                            title="Retry upload"
                          >
                            <svg
                              className="h-5 w-5 text-orange-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                          </button>

                          {/* Remove Icon */}
                          <button
                            onClick={() => handleRemove(key)}
                            className="transition-colors hover:text-red-700"
                            title="Remove"
                          >
                            <svg
                              className="h-5 w-5 text-red-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Upload from Mobile - Commented out for now */}
        {/* <div className="flex w-full flex-col items-center text-sm text-black">
          <div className="mb-4 hidden w-full items-center gap-2 text-left text-base font-bold md:flex">
            <svg
              width="24px"
              height="24px"
              viewBox="0 0 20 21"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.83268 19.6663C5.37435 19.6663 4.98199 19.5031 4.6556 19.1768C4.32921 18.8504 4.16602 18.458 4.16602 17.9997V2.99967C4.16602 2.54134 4.32921 2.14898 4.6556 1.82259C4.98199 1.4962 5.37435 1.33301 5.83268 1.33301H14.166C14.6243 1.33301 15.0167 1.4962 15.3431 1.82259C15.6695 2.14898 15.8327 2.54134 15.8327 2.99967V5.58301C16.0827 5.68023 16.2841 5.83301 16.4368 6.04134C16.5896 6.24967 16.666 6.48579 16.666 6.74967V8.41634C16.666 8.68023 16.5896 8.91634 16.4368 9.12467C16.2841 9.33301 16.0827 9.48579 15.8327 9.58301V17.9997C15.8327 18.458 15.6695 18.8504 15.3431 19.1768C15.0167 19.5031 14.6243 19.6663 14.166 19.6663H5.83268ZM5.83268 17.9997H14.166V2.99967H5.83268V17.9997ZM8.33268 17.1663H11.666C11.9021 17.1663 12.1 17.0865 12.2598 16.9268C12.4195 16.767 12.4993 16.5691 12.4993 16.333C12.4993 16.0969 12.4195 15.899 12.2598 15.7393C12.1 15.5795 11.9021 15.4997 11.666 15.4997H8.33268C8.09657 15.4997 7.89865 15.5795 7.73893 15.7393C7.57921 15.899 7.49935 16.0969 7.49935 16.333C7.49935 16.5691 7.57921 16.767 7.73893 16.9268C7.89865 17.0865 8.09657 17.1663 8.33268 17.1663Z"
                fill="#1D1D1E"
              ></path>
            </svg>
            Or upload from your mobile
          </div>

          <label className="w-full">
            <div
              className="flex h-40 w-full cursor-pointer flex-col items-center justify-center gap-5 rounded-xl bg-clip-padding bg-center bg-no-repeat transition-all duration-300"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='none' rx='12' ry='12' stroke='%23A6A6A6' stroke-width='2' stroke-dasharray='6' stroke-dashoffset='70' stroke-linecap='square'/%3E%3C/svg%3E")`,
                height: '280px',
              }}
            >
              <div className="my-8 flex flex-col items-center justify-center gap-3">
                <p className="text-base font-bold text-black">Scan the QR code</p>
                <div className="rounded-md border border-solid border-slate-300 p-1">
                  <div className="w-[140px] h-[140px] bg-slate-100 flex items-center justify-center text-xs text-slate-500">
                    QR Code
                  </div>
                </div>
                <p className="cursor-pointer text-sm font-medium text-neutral-700 underline hover:text-orange-500">
                  How do I upload from my phone?
                </p>
              </div>
            </div>
          </label>
        </div> */}
      </div>
    </div>
  );
}
