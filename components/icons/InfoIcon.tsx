import React from 'react';

interface InfoIconProps {
  size?: number;
  className?: string;
  strokeColor?: string;
}

export function InfoIcon({ size = 20, className, strokeColor = '#98A2B3' }: InfoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_2295_2797)">
        <path
          d="M6.0587 5.9987C6.21543 5.55314 6.5248 5.17744 6.932 4.93812C7.3392 4.6988 7.81796 4.61132 8.28348 4.69117C8.749 4.77102 9.17124 5.01305 9.47542 5.37438C9.77959 5.73572 9.94607 6.19305 9.94536 6.66536C9.94536 7.9987 7.94536 8.66536 7.94536 8.66536M7.9987 11.332H8.00536M14.6654 7.9987C14.6654 11.6806 11.6806 14.6654 7.9987 14.6654C4.3168 14.6654 1.33203 11.6806 1.33203 7.9987C1.33203 4.3168 4.3168 1.33203 7.9987 1.33203C11.6806 1.33203 14.6654 4.3168 14.6654 7.9987Z"
          stroke={strokeColor}
          strokeWidth="1.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_2295_2797">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
