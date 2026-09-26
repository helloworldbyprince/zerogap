'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StepItem {
  id: string;
  label: string;
  sublabel?: string;
}

interface StepperProps {
  steps: StepItem[];
  currentStepIndex: number;
  onStepClick?: (index: number) => void;
  className?: string;
}

export function Stepper({
  steps,
  currentStepIndex,
  onStepClick,
  className,
}: StepperProps) {
  return (
    <div className={cn('w-full py-4', className)}>
      <nav aria-label="Progress">
        <ol className="flex items-center justify-between">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const isUpcoming = idx > currentStepIndex;

            return (
              <li key={step.id} className="relative flex-1 flex items-center">
                <button
                  type="button"
                  onClick={() => onStepClick?.(idx)}
                  disabled={!onStepClick || isUpcoming}
                  className={cn(
                    'group flex items-center gap-3 text-left focus:outline-none transition-colors',
                    onStepClick && !isUpcoming ? 'cursor-pointer' : 'cursor-default'
                  )}
                >
                  {/* Step indicator circle */}
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all select-none',
                      isCompleted && 'bg-[#17C964] text-black font-bold shadow-sm',
                      isCurrent && 'bg-[#F5A524] text-black font-bold ring-4 ring-[#F5A524]/20 shadow-md',
                      isUpcoming && 'border border-[#232B36] bg-[#161B22] text-[#9BA1A6]'
                    )}
                  >
                    {isCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : idx + 1}
                  </span>

                  {/* Step labels */}
                  <div className="flex flex-col">
                    <span
                      className={cn(
                        'text-sm font-medium transition-colors',
                        isCurrent && 'text-[#ECEDEE] font-semibold',
                        isCompleted && 'text-[#ECEDEE]',
                        isUpcoming && 'text-[#9BA1A6]'
                      )}
                    >
                      {step.label}
                    </span>
                    {step.sublabel && (
                      <span className="text-[11px] text-[#9BA1A6] hidden sm:block">
                        {step.sublabel}
                      </span>
                    )}
                  </div>
                </button>

                {/* Connector line between steps */}
                {idx < steps.length - 1 && (
                  <div
                    className={cn(
                      'hidden sm:block h-[2px] flex-1 mx-4 transition-colors',
                      idx < currentStepIndex ? 'bg-[#17C964]' : 'bg-[#232B36]'
                    )}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
