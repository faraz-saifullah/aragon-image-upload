'use client';

import { useState, useCallback, useRef } from 'react';
import { uploadImageToR2, pollImageStatus } from '@/lib/utils/uploadClient';
import { ImageMetadata } from '@/lib/types/image';

interface UploadSectionProps {
  onUploadComplete: (image: ImageMetadata) => void;
  onStatusUpdate: (image: ImageMetadata) => void;
}

interface UploadingFile {
  file: File;
  preview: string;
  progress: number;
  error?: string;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/heic'];
const MAX_FILE_SIZE = 120 * 1024 * 1024; // 120MB

export function UploadSection({ onUploadComplete, onStatusUpdate }: UploadSectionProps) {
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, UploadingFile>>(new Map());
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Invalid file type. Allowed: JPEG, PNG, HEIC`;
    }

    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Max size: 120MB`;
    }

    return null;
  };

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      const filesToUpload = Array.from(files);

      for (const file of filesToUpload) {
        const error = validateFile(file);
        const preview = URL.createObjectURL(file);

        if (error) {
          const key = `${file.name}-${Date.now()}`;
          setUploadingFiles((prev) =>
            new Map(prev).set(key, { file, preview, progress: 0, error })
          );
          continue;
        }

        const key = `${file.name}-${Date.now()}`;
        setUploadingFiles((prev) => new Map(prev).set(key, { file, preview, progress: 0 }));

        try {
          const imageId = await uploadImageToR2(file, (progress) => {
            setUploadingFiles((prev) => {
              const updated = new Map(prev);
              const current = updated.get(key);
              if (current) {
                updated.set(key, { ...current, progress });
              }
              return updated;
            });
          });

          setUploadingFiles((prev) => {
            const updated = new Map(prev);
            updated.delete(key);
            return updated;
          });

          pollImageStatus(imageId, onUploadComplete, onStatusUpdate);
        } catch (error) {
          setUploadingFiles((prev) => {
            const updated = new Map(prev);
            const current = updated.get(key);
            if (current) {
              updated.set(key, {
                ...current,
                error: error instanceof Error ? error.message : 'Upload failed',
              });
            }
            return updated;
          });
        }
      }
    },
    [onUploadComplete, onStatusUpdate]
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
      <div className="flex w-auto max-w-[416px] flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2 text-left">
          <div className="flex flex-col gap-2">
            <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none">
              <g clipPath="url(#clip0_2174_21193)">
                <path
                  d="M23 16C22.7348 16 22.4804 16.1054 22.2929 16.2929C22.1054 16.4804 22 16.7348 22 17V19C22 19.7956 21.6839 20.5587 21.1213 21.1213C20.5587 21.6839 19.7956 22 19 22H17C16.7348 22 16.4804 22.1054 16.2929 22.2929C16.1054 22.4804 16 22.7348 16 23C16 23.2652 16.1054 23.5196 16.2929 23.7071C16.4804 23.8946 16.7348 24 17 24H19C20.3256 23.9984 21.5964 23.4711 22.5338 22.5338C23.4711 21.5964 23.9984 20.3256 24 19V17C24 16.7348 23.8946 16.4804 23.7071 16.2929C23.5196 16.1054 23.2652 16 23 16Z"
                  fill="#F97315"
                ></path>
                <path
                  d="M1 8C1.26522 8 1.51957 7.89464 1.70711 7.70711C1.89464 7.51957 2 7.26522 2 7V5C2 4.20435 2.31607 3.44129 2.87868 2.87868C3.44129 2.31607 4.20435 2 5 2H7C7.26522 2 7.51957 1.89464 7.70711 1.70711C7.89464 1.51957 8 1.26522 8 1C8 0.734784 7.89464 0.48043 7.70711 0.292893C7.51957 0.105357 7.26522 0 7 0L5 0C3.67441 0.00158786 2.40356 0.528882 1.46622 1.46622C0.528882 2.40356 0.00158786 3.67441 0 5L0 7C0 7.26522 0.105357 7.51957 0.292893 7.70711C0.48043 7.89464 0.734784 8 1 8Z"
                  fill="#F97315"
                ></path>
                <path
                  d="M7 22H5C4.20435 22 3.44129 21.6839 2.87868 21.1213C2.31607 20.5587 2 19.7956 2 19V17C2 16.7348 1.89464 16.4804 1.70711 16.2929C1.51957 16.1054 1.26522 16 1 16C0.734784 16 0.48043 16.1054 0.292893 16.2929C0.105357 16.4804 0 16.7348 0 17L0 19C0.00158786 20.3256 0.528882 21.5964 1.46622 22.5338C2.40356 23.4711 3.67441 23.9984 5 24H7C7.26522 24 7.51957 23.8946 7.70711 23.7071C7.89464 23.5196 8 23.2652 8 23C8 22.7348 7.89464 22.4804 7.70711 22.2929C7.51957 22.1054 7.26522 22 7 22Z"
                  fill="#F97315"
                ></path>
                <path
                  d="M19 0H17C16.7348 0 16.4804 0.105357 16.2929 0.292893C16.1054 0.48043 16 0.734784 16 1C16 1.26522 16.1054 1.51957 16.2929 1.70711C16.4804 1.89464 16.7348 2 17 2H19C19.7956 2 20.5587 2.31607 21.1213 2.87868C21.6839 3.44129 22 4.20435 22 5V7C22 7.26522 22.1054 7.51957 22.2929 7.70711C22.4804 7.89464 22.7348 8 23 8C23.2652 8 23.5196 7.89464 23.7071 7.70711C23.8946 7.51957 24 7.26522 24 7V5C23.9984 3.67441 23.4711 2.40356 22.5338 1.46622C21.5964 0.528882 20.3256 0.00158786 19 0Z"
                  fill="#F97315"
                ></path>
                <path
                  d="M12 11C12.7911 11 13.5645 10.7654 14.2223 10.3259C14.8801 9.88635 15.3928 9.26164 15.6955 8.53074C15.9983 7.79983 16.0775 6.99556 15.9231 6.21964C15.7688 5.44372 15.3878 4.73098 14.8284 4.17157C14.269 3.61216 13.5563 3.2312 12.7804 3.07686C12.0044 2.92252 11.2002 3.00173 10.4693 3.30448C9.73836 3.60723 9.11365 4.11992 8.67412 4.77772C8.2346 5.43552 8 6.20888 8 7C8 8.06087 8.42143 9.07828 9.17157 9.82843C9.92172 10.5786 10.9391 11 12 11ZM12 5C12.3956 5 12.7822 5.1173 13.1111 5.33706C13.44 5.55683 13.6964 5.86918 13.8478 6.23463C13.9991 6.60009 14.0387 7.00222 13.9616 7.39018C13.8844 7.77814 13.6939 8.13451 13.4142 8.41422C13.1345 8.69392 12.7781 8.8844 12.3902 8.96157C12.0022 9.03874 11.6001 8.99914 11.2346 8.84776C10.8692 8.69639 10.5568 8.44004 10.3371 8.11114C10.1173 7.78224 10 7.39556 10 7C10 6.46957 10.2107 5.96086 10.5858 5.58579C10.9609 5.21072 11.4696 5 12 5Z"
                  fill="#F97315"
                ></path>
                <path
                  d="M18 20C18.2652 20 18.5196 19.8946 18.7071 19.7071C18.8946 19.5196 19 19.2652 19 19C18.9984 17.4092 18.3658 15.884 17.2409 14.7591C16.116 13.6342 14.5908 13.0016 13 13H11C9.40919 13.0016 7.88399 13.6342 6.75911 14.7591C5.63424 15.884 5.00159 17.4092 5 19C5 19.2652 5.10536 19.5196 5.29289 19.7071C5.48043 19.8946 5.73478 20 6 20C6.26522 20 6.51957 19.8946 6.70711 19.7071C6.89464 19.5196 7 19.2652 7 19C7 17.9391 7.42143 16.9217 8.17157 16.1716C8.92172 15.4214 9.93913 15 11 15H13C14.0609 15 15.0783 15.4214 15.8284 16.1716C16.5786 16.9217 17 17.9391 17 19C17 19.2652 17.1054 19.5196 17.2929 19.7071C17.4804 19.8946 17.7348 20 18 20Z"
                  fill="#F97315"
                ></path>
              </g>
              <defs>
                <clipPath id="clip0_2174_21193">
                  <rect width="24" height="24" fill="white"></rect>
                </clipPath>
              </defs>
            </svg>
            <span className="text-2xl font-semibold text-black">Upload photos</span>
          </div>
          <div className="text-base text-neutral-700">
            Now the fun begins! Select at least{' '}
            <span className="font-bold">6 of your best photos.</span> Uploading{' '}
            <b>a mix of close-ups, selfies and mid-range shots</b> can help the AI better capture
            your face and body type.
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
              className={`flex h-40 w-full cursor-pointer flex-col items-center justify-center gap-5 rounded-xl bg-clip-padding bg-center bg-no-repeat transition-all duration-300 ${
                isDragging ? 'border-orange-500 bg-orange-50' : 'hover:border-orange-500'
              }`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='none' rx='12' ry='12' stroke='%23A6A6A6' stroke-width='2' stroke-dasharray='6' stroke-dashoffset='70' stroke-linecap='square'/%3E%3C/svg%3E")`,
                height: '180px',
              }}
            >
              <div
                className="flex items-center justify-center px-4 py-2 rounded-lg text-white font-semibold text-sm"
                style={{ background: 'linear-gradient(90deg, #EB6002 0%, #FFB253 100%)' }}
              >
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
                  ></path>
                </svg>
              </div>

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
                accept="image/jpeg,image/png,image/heic"
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
              />
            </div>
          </label>
        </div>

        {/* Upload from Mobile */}
        <div className="flex w-full flex-col items-center text-sm text-black">
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
        </div>
      </div>
    </div>
  );
}
