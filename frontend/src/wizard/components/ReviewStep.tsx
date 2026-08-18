import React from 'react';
import { WIZARD_STEPS } from '../wizardConfig';
import { WizardAnswers, FunctionalRequirement } from '../../api/types';

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
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Review & Confirm</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Check every section before creating the project.</p>
        </div>
      </div>

      <div className="space-y-4">
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
            <section key={step.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{step.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{step.subtitle}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onEdit(index)}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Edit
                </button>
              </div>

              <div className="space-y-3">
                {step.fields.map((field) => {
                  const value = answers[field.id as keyof WizardAnswers];
                  const error = validation[field.id];
                  return (
                    <div key={field.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{field.label}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 break-words">{formatValue(value)}</p>
                        </div>
                        {error && <span className="text-[10px] font-medium text-rose-500">Missing</span>}
                      </div>
                    </div>
                  );
                })}

                {missing && (
                  <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                    One or more required fields in this section are still missing.
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
