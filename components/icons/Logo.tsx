import React from 'react';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export function Logo({ width = 33, height = 32, className }: LogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 33 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="0.300049" width="32" height="32" rx="7.68" fill="url(#paint0_linear_logo)" />
      <g clipPath="url(#clip0_logo)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16.5528 24.7301C16.618 24.9563 16.2951 25.1331 16.1395 24.9483C9.41872 16.9595 18.1263 12.7917 17.8284 6.28018C17.8174 6.03954 18.2421 5.91452 18.3638 6.12767C25.9483 19.4098 14.3959 17.2575 16.5528 24.7301Z"
          fill="white"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M18.9485 25.8852C18.8272 25.9367 18.6797 25.8744 18.6387 25.7572C16.4582 19.5303 22.8965 19.5745 23.0972 13.9906C23.1061 13.7424 23.5659 13.6462 23.6547 13.8806C26.1111 20.364 24.4849 23.5355 18.9485 25.8852Z"
          fill="white"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.2323 25.9802C14.4414 26.0428 14.5964 25.8107 14.4629 25.6497C7.60474 17.3833 15.1511 14.7553 13.2065 10.142C13.119 9.93453 12.7821 10.0098 12.7617 10.2316C12.6107 11.8768 11.7861 13.7327 11.1824 14.9487C9.96121 17.319 9.6149 16.1395 9.78631 14.7353C9.81438 14.5054 9.46606 14.362 9.33443 14.559C6.36675 19.0008 8.36945 24.2217 14.2323 25.9802Z"
          fill="white"
        />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_logo"
          x1="7.10005"
          y1="35.6"
          x2="37.9"
          y2="-20.4"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EB6002" />
          <stop offset="1" stopColor="#FFB253" />
        </linearGradient>
        <clipPath id="clip0_logo">
          <rect width="17" height="20" fill="white" transform="translate(7.80005 6)" />
        </clipPath>
      </defs>
    </svg>
  );
}
