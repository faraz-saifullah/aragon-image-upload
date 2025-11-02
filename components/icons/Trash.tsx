import React from 'react';

interface TrashProps {
  size?: number;
  className?: string;
}

export function Trash({ size = 20, className }: TrashProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      className={className}
    >
      <g strokeLinecap="round" strokeWidth="1.4">
        <path
          stroke="#1D1D1E"
          d="m4.166 5.833 1.37 9.87A2.083 2.083 0 0 0 7.6 17.5h4.798c1.04 0 1.92-.767 2.064-1.797l1.37-9.87"
        />
        <path
          stroke="#282930"
          d="M6.918 3.547c.246-.614.715-1.047 1.417-1.047h3.333c.702 0 1.22.433 1.467 1.047M2.916 5.417h14.167M8.334 8.75l.417 4.583M11.667 8.75l-.417 4.583"
        />
      </g>
    </svg>
  );
}
