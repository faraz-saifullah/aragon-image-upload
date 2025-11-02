import Image from 'next/image';
import { XCircle } from '@/components/icons';
import { CollapsibleCard } from '@/components/ui';
import { aspectRatios } from '@/lib/theme';
import { photoRestrictions } from '@/lib/data';

export function PhotoRestrictions() {
  return (
    <CollapsibleCard
      title="Photo Restrictions"
      icon={<XCircle size={32} />}
      backgroundColor="bg-[#FFF2F0]"
      borderColor="border-[#FFD4CC]"
    >
      <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-6">
        {photoRestrictions.map((restriction, index) => (
          <div key={index} className="flex h-max w-full flex-col gap-3 rounded-2xl">
            <div
              className="size-full relative flex grow overflow-hidden rounded-lg shadow-lg"
              style={{ aspectRatio: aspectRatios.thumbnail }}
            >
              <Image
                src={restriction.image}
                alt={restriction.title}
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <span className="text-left text-sm font-medium text-black">
              <div>
                <div className="flex items-center gap-1 font-semibold">
                  {restriction.icon}
                  {restriction.title}
                </div>
                <p className="mt-1">{restriction.description}</p>
              </div>
            </span>
          </div>
        ))}
      </div>
    </CollapsibleCard>
  );
}
