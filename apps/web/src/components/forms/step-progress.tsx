'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export interface Step {
  label: string;
}

export function StepProgress({ steps, currentStep }: { steps: Step[]; currentStep: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center">
        {steps.map((step, idx) => {
          const isComplete = idx < currentStep;
          const isCurrent = idx === currentStep;
          return (
            <div key={step.label} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <motion.div
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                    backgroundColor: isComplete || isCurrent ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground"
                >
                  {isComplete ? <Check className="h-4 w-4" /> : <span className={isCurrent ? '' : 'text-muted-foreground'}>{idx + 1}</span>}
                </motion.div>
                <span className={`hidden text-xs font-medium sm:block ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className="mx-2 h-0.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full bg-primary"
                    initial={false}
                    animate={{ width: isComplete ? '100%' : '0%' }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
