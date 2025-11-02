import React from 'react';

interface LeafIconProps {
  size?: number;
  className?: string;
}

export function LeafIcon({ size = 20, className = 'shrink-0' }: LeafIconProps) {
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
        strokeWidth="1.333"
        d="M10 17.5c-3.452 0-6.25-2.67-6.25-5.964 0-2.26 2.944-6.134 4.791-8.342A1.895 1.895 0 0 1 10 2.5m0 15V15m0 2.5c2.098 0 3.955-.986 5.088-2.5M10 2.5c.536 0 1.071.231 1.459.694.437.523.936 1.14 1.443 1.806M10 2.5V5m0 5h5.925M10 10v2.5m0-2.5V7.5m5.925 2.5c.206.56.325 1.08.325 1.536 0 .328-.028.65-.081.964m-.245-2.5c-.287-.782-.744-1.64-1.28-2.5M10 12.5h6.169M10 12.5V15m6.169-2.5a5.789 5.789 0 0 1-1.08 2.5M10 7.5h4.644M10 7.5V5m4.644 2.5A33.155 33.155 0 0 0 12.902 5M10 5h2.902"
      />
    </svg>
  );
}
