import React from 'react';
import { Check, Circle, CircleDot } from 'lucide-react';
import { WIZARD_STEPS, TOTAL_STEPS } from '../wizardConfig';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
  onStepClick?: (stepIndex: number) => void;
}

const stepTitles: Record<string, string> = {
  project_info: 'Project Information',
  industry: 'Industry',
  target_users: 'Users',
  business_objectives: 'Business Goals',
  platforms: 'Platform',
  project_scale: 'Project Size',
  functional_requirements: 'Functional Requirements',
  non_functional_requirements: 'Non Functional Requirements',
  integrations: 'Integrations',
  review: 'Review',
};

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps = TOTAL_STEPS, onStepClick }) => {
  const progress = totalSteps <= 1 ? 0 : Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200/80 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/80 backdrop-blur sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-indigo-600 dark:text-indigo-300">
            Progress Percentage
          </p>
          <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{progress}% Complete</p>
        </div>
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-violet-500 to-fuchsia-500 transition-all duration-500 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      <div className="space-y-1.5">
        {WIZARD_STEPS.map((step, index) => {
          const isActive = index === currentStep;
          const isComplete = index < currentStep;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepClick?.(index)}
              aria-label={`Go to ${stepTitles[step.id] ?? step.title} step`}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-all duration-200 ${
                isActive
                  ? 'border-indigo-500/60 bg-indigo-500/10 text-indigo-700 dark:text-indigo-200'
                  : isComplete
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200'
                    : 'border-slate-200 bg-transparent text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-950/40'
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center">
                {isComplete ? (
                  <Check className="h-4 w-4 text-emerald-500" strokeWidth={2.5} />
                ) : isActive ? (
                  <CircleDot className="h-4 w-4 text-indigo-500" strokeWidth={2.5} />
                ) : (
                  <Circle className="h-4 w-4 text-slate-400 dark:text-slate-500" strokeWidth={2} />
                )}
              </span>

              <span className="min-w-0 flex-1 text-sm font-medium">
                <span className="block truncate">{stepTitles[step.id] ?? step.title}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
