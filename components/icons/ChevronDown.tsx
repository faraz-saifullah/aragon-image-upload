import React from 'react';

interface ChevronDownProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export function ChevronDown({ size = 24, className, strokeWidth = 2 }: ChevronDownProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
