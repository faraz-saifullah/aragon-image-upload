'use client';

import { ImageMetadata } from '@/lib/types/image';
import { PhotoRequirements } from './PhotoRequirements';
import { PhotoRestrictions } from './PhotoRestrictions';
import { CollapsibleCard, ProgressBar } from '@/components/ui';
import { Trash } from '@/components/icons';
import { upload, aspectRatios } from '@/lib/theme';

interface UploadedImagesPanelProps {
  images: ImageMetadata[];
  onStatusUpdate: (image: ImageMetadata) => void;
  onRemoveImage: (imageId: string) => void;
}

export function UploadedImagesPanel({ images, onRemoveImage }: UploadedImagesPanelProps) {
  const uploadedCount = images.length;
  const targetCount = upload.targetCount;

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
        <div className="relative w-full">
          <ProgressBar
            value={uploadedCount}
            max={targetCount}
            color="#01AC5E"
            height="h-[6px]"
            checkpoint={{
              value: upload.minRequiredCount,
              tooltip: {
                title: 'Minimum',
                message: 'You must upload at least 6 photos to create your headshots',
              },
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex w-full flex-col gap-10 pb-48 md:pr-2">
        {/* Uploaded Photos Section - Only show if there are images */}
        {images.length > 0 && (
          <CollapsibleCard
            title="Uploaded photos"
            backgroundColor="bg-slate-50"
            borderColor="border-slate-200"
          >
            <div className="grid w-full grid-cols-2 gap-3 lg:grid-cols-4 xl:gap-6">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="flex h-auto w-full flex-col gap-2 rounded-2xl pr-4 pt-3"
                  style={{ aspectRatio: aspectRatios.photo }}
                >
                  <div className="relative flex h-full w-full grow rounded-lg shadow-lg">
                    {image.r2Url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image.r2Url}
                        alt={image.originalName}
                        className="cursor-pointer rounded-lg w-full h-full object-cover"
                        style={{ aspectRatio: aspectRatios.photo }}
                        draggable="false"
                      />
                    ) : (
                      <div
                        className="rounded-lg bg-slate-200 flex items-center justify-center"
                        style={{ aspectRatio: aspectRatios.photo }}
                      >
                        <div className="text-slate-500 text-sm">Processing...</div>
                      </div>
                    )}

                    {/* Delete Button */}
                    <div className="absolute right-2 top-2 flex flex-row-reverse justify-between rounded-full bg-white p-2 shadow-md">
                      <button
                        onClick={() => onRemoveImage(image.id)}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        aria-label={`Delete ${image.originalName}`}
                      >
                        <Trash size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleCard>
        )}

        {/* Photo Requirements */}
        <PhotoRequirements />

        {/* Photo Restrictions */}
        <PhotoRestrictions />
      </div>
    </div>
  );
}
