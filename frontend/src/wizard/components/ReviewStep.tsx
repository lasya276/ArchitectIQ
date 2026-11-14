import React from 'react';
import { WIZARD_STEPS } from '../wizardConfig';
import { WizardAnswers, FunctionalRequirement } from '../../api/types';
import { Button } from '../../components/ui/Button';

interface ReviewStepProps {
  answers: WizardAnswers;
  onEdit: (stepIndex: number) => void;
  validation?: Record<string, string>;
}

const formatValue = (value: unknown) => {
  if (Array.isArray(value)) {
    if (value.length === 0) return '—';
    if (typeof value[0] === 'string') {
      return value.join(', ');
    }
    if (typeof value[0] === 'object' && value[0] !== null) {
      const reqs = value as FunctionalRequirement[];
      return reqs.map((entry) => `${entry.text} (${entry.priority})`).join(' • ');
    }
  }
  if (typeof value === 'string') {
    return value.trim() || '—';
  }
  return '—';
};

export const ReviewStep: React.FC<ReviewStepProps> = ({ answers, onEdit, validation = {} }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Review & Confirm</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Verify your project specifications before generating the architecture blueprint.
        </p>
      </div>

      <div className="divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
        {WIZARD_STEPS.map((step, index) => {
          const missing = step.fields.some((field) => {
            if (!field.required) return false;
            const value = answers[field.id as keyof WizardAnswers];
            if (field.type === 'short-text' || field.type === 'long-text' || field.type === 'single-choice') {
              return !String(value || '').trim();
            }
            if (field.type === 'multi-choice' || field.type === 'tag-input' || field.type === 'dynamic-list') {
              return !Array.isArray(value) || value.length === 0;
            }
            return false;
          });

          return (
            <div key={step.id} className="py-4">
              <div className="flex items-center justify-between pb-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{step.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{step.subtitle}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(index)}
                  className="h-7 px-2.5 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  Edit
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {step.fields.map((field) => {
                  const value = answers[field.id as keyof WizardAnswers];
                  const error = validation[field.id];
                  return (
                    <div
                      key={field.id}
                      className="rounded-md border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-900/40"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{field.label}</span>
                        {error && <span className="text-[10px] font-medium text-rose-500">Required</span>}
                      </div>
                      <p className="mt-1 text-xs font-medium text-slate-900 break-words dark:text-slate-200">
                        {formatValue(value)}
                      </p>
                    </div>
                  );
                })}
              </div>

              {missing && (
                <p className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">
                  One or more required fields in this section need attention.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

