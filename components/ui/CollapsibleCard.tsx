import React, { useState } from 'react';
import { ChevronDown } from '@/components/icons';

interface CollapsibleCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  className?: string;
}

export function CollapsibleCard({
  title,
  icon,
  children,
  defaultOpen = true,
  backgroundColor = 'bg-slate-50',
  borderColor = 'border-slate-200',
  className = '',
}: CollapsibleCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={`rounded-2xl px-6 py-1 border border-solid ${backgroundColor} ${borderColor} ${className}`}
    >
      {/* Header */}
      <div className="border-b">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex flex-1 items-center justify-between py-4 w-full text-left hover:no-underline"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-0.5">
            {icon}
            <p className="text-lg font-bold text-black">{title}</p>
          </div>
          <ChevronDown
            className={`h-6 w-6 shrink-0 stroke-black transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {/* Content */}
      {isOpen && <div className="pb-8 pt-6">{children}</div>}
    </div>
  );
}
