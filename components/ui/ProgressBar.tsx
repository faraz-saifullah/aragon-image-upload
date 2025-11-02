'use client';

import React, { useState } from 'react';
import { theme } from '@/lib/theme';
import { InfoIcon } from '@/components/icons';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  height?: string;
  showLabel?: boolean;
  className?: string;
  checkpoint?: {
    value: number;
    label?: string;
    tooltip?: {
      title: string;
      message: string;
    };
  };
}

export function ProgressBar({
  value,
  max = 100,
  color = theme.colors.primary.gradient,
  height = 'h-3',
  showLabel = false,
  className = '',
  checkpoint,
}: ProgressBarProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const percentage = Math.min((value / max) * 100, 100);
  const checkpointPercentage = checkpoint ? (checkpoint.value / max) * 100 : 0;

  return (
    <div className={`w-full relative ${className}`}>
      {/* Progress Bar Track Container */}
      <div className={`relative ${height} w-full rounded-full bg-slate-200`}>
        {/* Progress Fill */}
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            background: color,
          }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />

        {/* Checkpoint Line - positioned within progress bar */}
        {checkpoint && (
          <div
            className="absolute top-0 h-full w-[1.5px] bg-slate-400"
            style={{ left: `${checkpointPercentage}%`, transform: 'translateX(-50%)' }}
          />
        )}
      </div>

      {/* Checkpoint Label Container - positioned above progress bar, aligned with checkpoint */}
      {checkpoint && (
        <div
          className="absolute bottom-full left-0 flex flex-col items-center mb-1"
          style={{ left: `${checkpointPercentage}%`, transform: 'translateX(-50%)' }}
        >
          {/* Info Icon with Tooltip */}
          {checkpoint.tooltip && (
            <div className="relative">
              {/* Tooltip - appears above info icon when hovered (topmost element) */}
              {showTooltip && (
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-50">
                  <div className="bg-[#334155] text-white rounded-lg px-3 py-2 shadow-lg min-w-[240px]">
                    {/* Arrow pointing down to info icon */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                      <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#334155]" />
                    </div>

                    {/* Content */}
                    <div className="flex items-start gap-2">
                      {/* Warning Icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="w-5 h-5 shrink-0 mt-0.5 text-yellow-400"
                      >
                        <path
                          d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      <div className="flex-1">
                        <div className="font-semibold text-sm mb-1">{checkpoint.tooltip.title}</div>
                        <div className="text-xs text-gray-200 leading-relaxed">
                          {checkpoint.tooltip.message}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-400 hover:bg-blue-500 transition-colors cursor-pointer"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                aria-label="Minimum requirement information"
              >
                <InfoIcon size={12} strokeColor="white" />
              </button>
            </div>
          )}

          {/* Checkpoint Number */}
          <div className="text-xs font-medium text-slate-600 mt-0.5">{checkpoint.value}</div>

          {/* Small Checkpoint Vertical Line */}
          <div className="h-2 w-[1px] bg-slate-400 mt-0.5" />
        </div>
      )}

      {showLabel && (
        <div className="mt-1 text-xs text-neutral-600">
          {value} / {max}
        </div>
      )}
    </div>
  );
}
