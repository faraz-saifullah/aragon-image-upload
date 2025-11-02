'use client';

import { ImageMetadata } from '@/lib/types/image';
import { PhotoRequirements } from './PhotoRequirements';
import { PhotoRestrictions } from './PhotoRestrictions';

interface UploadedImagesPanelProps {
  images: ImageMetadata[];
  onStatusUpdate: (image: ImageMetadata) => void;
  onRemoveImage: (imageId: string) => void;
}

export function UploadedImagesPanel({
  images,
  onStatusUpdate,
  onRemoveImage,
}: UploadedImagesPanelProps) {
  const uploadedCount = images.length;
  const targetCount = 10;
  const progress = Math.min((uploadedCount / targetCount) * 100, 100);

  return (
    <div className="relative flex w-full flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 flex w-full flex-col bg-white pb-8">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex font-semibold text-black">Uploaded Images</div>
          <span className="flex shrink-0 gap-1 text-sm tabular-nums text-neutral-700">
            <p className="font-semibold text-black">{uploadedCount}</p>
            of <p className="font-semibold text-black">{targetCount}</p>
          </span>
        </div>

        {/* Progress Bar */}
        <div className="flex flex-row items-center justify-center gap-3">
          <div className="relative h-[6px] w-full rounded-full bg-slate-200">
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all duration-150"
              style={{
                width: `${progress}%`,
                background: 'rgb(1, 172, 94)',
              }}
            ></div>

            {/* Marker at required count (6) */}
            {uploadedCount >= 6 && (
              <div
                className="absolute -top-4 ml-[2px] flex h-full flex-col items-end border-r-2 border-solid border-gray-700 bg-transparent"
                style={{ width: '60%', left: 0 }}
              >
                <div className="absolute bottom-0 left-[50%] flex h-auto w-full flex-col items-center justify-start gap-1 pb-1 text-sm font-semibold text-neutral-700">
                  <svg width="20px" height="20px" viewBox="0 0 16 16" fill="none">
                    <g clipPath="url(#clip0_2295_2797)">
                      <path
                        d="M6.0587 5.9987C6.21543 5.55314 6.5248 5.17744 6.932 4.93812C7.3392 4.6988 7.81796 4.61132 8.28348 4.69117C8.749 4.77102 9.17124 5.01305 9.47542 5.37438C9.77959 5.73572 9.94607 6.19305 9.94536 6.66536C9.94536 7.9987 7.94536 8.66536 7.94536 8.66536M7.9987 11.332H8.00536M14.6654 7.9987C14.6654 11.6806 11.6806 14.6654 7.9987 14.6654C4.3168 14.6654 1.33203 11.6806 1.33203 7.9987C1.33203 4.3168 4.3168 1.33203 7.9987 1.33203C11.6806 1.33203 14.6654 4.3168 14.6654 7.9987Z"
                        stroke="#98A2B3"
                        strokeWidth="1.33333"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </g>
                  </svg>
                  <div>{uploadedCount}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex w-full flex-col gap-10 pb-48 md:pr-2">
        {/* Uploaded Photos Section */}
        <div className="rounded-2xl px-6 bg-slate-50 py-1">
          <div className="border-b">
            <button className="flex flex-1 items-center justify-between py-4 w-full text-left hover:no-underline text-black">
              <div className="text-xl font-semibold leading-relaxed text-black">
                Uploaded photos
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

          <div className="pb-8 pt-4">
            {images.length === 0 ? (
              <div className="text-center py-12 text-slate-500">No images uploaded yet</div>
            ) : (
              <div className="grid w-full grid-cols-2 gap-3 lg:grid-cols-4 xl:gap-6">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="flex aspect-[2048/2560] h-auto w-full flex-col gap-2 rounded-2xl pr-4 pt-3"
                  >
                    <div className="relative flex h-full w-full grow rounded-lg shadow-lg">
                      {image.r2Url ? (
                        <img
                          src={image.r2Url}
                          alt={image.originalName}
                          className="aspect-[2048/2560] cursor-pointer rounded-lg w-full h-full object-cover"
                          draggable="false"
                        />
                      ) : (
                        <div className="aspect-[2048/2560] rounded-lg bg-slate-200 flex items-center justify-center">
                          <div className="text-slate-500 text-sm">Processing...</div>
                        </div>
                      )}

                      {/* Delete Button */}
                      <div className="absolute right-2 top-2 flex flex-row-reverse justify-between rounded-full bg-white p-2 shadow-md">
                        <button onClick={() => onRemoveImage(image.id)} className="cursor-pointer">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            fill="none"
                          >
                            <g strokeLinecap="round" strokeWidth="1.4">
                              <path
                                stroke="#1D1D1E"
                                d="m4.166 5.833 1.37 9.87A2.083 2.083 0 0 0 7.6 17.5h4.798c1.04 0 1.92-.767 2.064-1.797l1.37-9.87"
                              ></path>
                              <path
                                stroke="#282930"
                                d="M6.918 3.547c.246-.614.715-1.047 1.417-1.047h3.333c.702 0 1.22.433 1.467 1.047M2.916 5.417h14.167M8.334 8.75l.417 4.583M11.667 8.75l-.417 4.583"
                              ></path>
                            </g>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Photo Requirements */}
        <PhotoRequirements />

        {/* Photo Restrictions */}
        <PhotoRestrictions />
      </div>
    </div>
  );
}
