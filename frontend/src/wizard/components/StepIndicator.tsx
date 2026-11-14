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
  target_users: 'Target Users',
  business_objectives: 'Business Goals',
  platforms: 'Platform Target',
  project_scale: 'Project Scale',
  functional_requirements: 'Functional Requirements',
  non_functional_requirements: 'Non-Functional Requirements',
  integrations: 'Integrations',
  review: 'Review & Confirm',
};

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps = TOTAL_STEPS, onStepClick }) => {
  const progress = totalSteps <= 1 ? 0 : Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div>
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-700 dark:text-slate-300">Configuration Progress</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{progress}%</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-300 ease-out dark:bg-brand-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      <div className="space-y-1">
        {WIZARD_STEPS.map((step, index) => {
          const isActive = index === currentStep;
          const isComplete = index < currentStep;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepClick?.(index)}
              aria-label={`Go to ${stepTitles[step.id] ?? step.title} step`}
              className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
                  : isComplete
                    ? 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800/30 dark:hover:text-slate-400'
              }`}
            >
              <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center">
                {isComplete ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                ) : isActive ? (
                  <CircleDot className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" strokeWidth={2.5} />
                ) : (
                  <Circle className="h-3 w-3 text-slate-300 dark:text-slate-600" strokeWidth={2} />
                )}
              </span>

              <span className="min-w-0 flex-1 truncate">
                {stepTitles[step.id] ?? step.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

