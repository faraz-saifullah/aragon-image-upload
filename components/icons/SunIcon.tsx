import React from 'react';

interface SunIconProps {
  size?: number;
  className?: string;
}

export function SunIcon({ size = 20, className = 'shrink-0' }: SunIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      className={className}
    >
      <path
        stroke="#282930"
        strokeLinecap="round"
        strokeWidth="1.6"
        d="M10 2.5v1.875M15 5l-.934.934M15 15l-.934-.934M5 15l.934-.934M5 5l.934.934M10 15.625V17.5M4.375 10H2.5m15 0h-1.875m-2.292 0a3.333 3.333 0 1 1-6.666 0 3.333 3.333 0 0 1 6.666 0Z"
      />
    </svg>
  );
}
