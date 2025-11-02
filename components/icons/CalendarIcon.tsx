import React from 'react';

interface CalendarIconProps {
  size?: number;
  className?: string;
}

export function CalendarIcon({ size = 20, className = 'shrink-0' }: CalendarIconProps) {
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
          d="M3.556 5.819c.08-.87.774-1.554 1.644-1.63 3.573-.307 6.054-.308 9.6-.001a1.809 1.809 0 0 1 1.645 1.641c.312 3.527.283 6.018-.01 9.574a1.818 1.818 0 0 1-1.657 1.663c-3.555.301-6.033.3-9.543.001a1.822 1.822 0 0 1-1.658-1.669c-.287-3.52-.351-6.017-.021-9.579Z"
        />
        <path
          strokeLinecap="round"
          strokeWidth="1.25"
          d="M6.666 2.708v2.917M13.334 2.708v2.917M3.75 8.125h12.5"
        />
        <path
          strokeLinecap="round"
          strokeWidth="1.667"
          d="M6.666 11.042h.008M6.666 13.958h.008M10.008 11.042h.008M10.008 13.958h.008M13.35 11.042h.008M13.35 13.958h.008"
        />
      </g>
    </svg>
  );
}
