import React from 'react';

interface CheckCircleProps {
  size?: number;
  className?: string;
}

export function CheckCircle({ size = 32, className }: CheckCircleProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      height={size}
      width={size}
      className={className}
    >
      <g stroke="#01AC5E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
        <path d="M25.5 16a9.5 9.5 0 1 1-19 0 9.5 9.5 0 0 1 19 0Z" />
        <path d="m12 16 3 3.5 5.222-6.666" />
      </g>
    </svg>
  );
}
