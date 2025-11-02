import React from 'react';

interface VarietyIconProps {
  size?: number;
  className?: string;
}

export function VarietyIcon({ size = 20, className = 'shrink-0' }: VarietyIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      className={className}
    >
      <g stroke="#282930">
        <path
          strokeWidth="1.6"
          d="M5.417 17.5A2.917 2.917 0 0 1 2.5 14.583v-10c0-1.15.933-2.083 2.083-2.083H6.25c1.15 0 2.083.933 2.083 2.083v4.085M5.417 17.5a2.917 2.917 0 0 0 2.916-2.917v-2.916M5.417 17.5h10c1.15 0 2.083-.933 2.083-2.083V13.75c0-1.15-.933-2.083-2.083-2.083h-1.41M3.103 16.359a2.917 2.917 0 0 0 4.09.538m1.14-8.23 3.24-2.486c.913-.7 2.221-.529 2.922.384l1.014 1.322c.701.913.53 2.22-.384 2.921l-1.118.859m-5.674-3v3m5.674 0H8.333"
        />
        <path strokeLinecap="round" strokeWidth="2.083" d="M5.416 14.167h-.008" />
      </g>
    </svg>
  );
}
