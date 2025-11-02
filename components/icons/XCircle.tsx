import React from 'react';

interface XCircleProps {
  size?: number;
  className?: string;
}

export function XCircle({ size = 32, className }: XCircleProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      height={size}
      width={size}
      className={className}
    >
      <path
        stroke="#FF4E64"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M22.577 9.469 9.423 22.622M25.5 16a9.5 9.5 0 1 1-19 0 9.5 9.5 0 0 1 19 0Z"
      />
    </svg>
  );
}
