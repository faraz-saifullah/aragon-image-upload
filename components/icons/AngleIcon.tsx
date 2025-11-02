import React from 'react';

interface AngleIconProps {
  size?: number;
  className?: string;
}

export function AngleIcon({ size = 20, className = 'shrink-0' }: AngleIconProps) {
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
        strokeWidth="1.6"
        d="M9 17.434c0-3.434 2.41-4.373 4.12-4.48.807-.05 1.575-.05 2.38 0 .447.027.868.136 1.254.311m0 0a7.5 7.5 0 1 0-13.508-6.53 7.5 7.5 0 0 0 13.508 6.53ZM17 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"
      />
    </svg>
  );
}
