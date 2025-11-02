import Image from 'next/image';
import { CheckCircle } from '@/components/icons';
import { CollapsibleCard } from '@/components/ui';
import { aspectRatios } from '@/lib/theme';
import { photoRequirements } from '@/lib/data';

export function PhotoRequirements() {
  return (
    <CollapsibleCard
      title="Photo Requirements"
      icon={<CheckCircle size={32} />}
      backgroundColor="bg-[#E8F5F0]"
      borderColor="border-[#B8E6D5]"
    >
      <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-6">
        {photoRequirements.map((req, index) => (
          <div key={index} className="flex h-max w-full flex-col gap-3 rounded-2xl">
            <div
              className="size-full relative flex grow overflow-hidden rounded-lg shadow-lg"
              style={{ aspectRatio: aspectRatios.thumbnail }}
            >
              <Image src={req.image} alt={req.title} fill className="object-cover rounded-lg" />
            </div>
            <span className="text-left text-sm font-medium text-black">
              <div>
                <div className="flex items-center gap-1 font-semibold">
                  {req.icon}
                  {req.title}
                </div>
                <p className="mt-1">{req.description}</p>
              </div>
            </span>
          </div>
        ))}
      </div>
    </CollapsibleCard>
  );
}
