import React from 'react';
import { Check } from 'lucide-react';
import { ChoiceOption } from '../../wizard/wizardConfig';

interface SingleChoiceProps {
  fieldId: string;
  label: string;
  helperText?: string;
  options: ChoiceOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const SingleChoice: React.FC<SingleChoiceProps> = ({
  fieldId,
  label,
  helperText,
  options,
  value,
  onChange,
  error,
}) => {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</p>
        {helperText && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{helperText}</p>
        )}
      </div>

      <div
        className="space-y-1.5"
        role="radiogroup"
        aria-label={label}
      >
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              id={`${fieldId}-${opt.value}`}
              onClick={() => onChange(opt.value)}
              aria-checked={selected}
              aria-label={opt.label}
              className={`group flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 ${
                selected
                  ? 'border-indigo-500/70 bg-indigo-500/10 text-indigo-700 dark:text-indigo-200 shadow-sm shadow-indigo-500/10'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-950/30'
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                  selected
                    ? 'border-indigo-500 bg-indigo-500'
                    : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800'
                }`}
              >
                {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium leading-snug">{opt.label}</span>
                {opt.icon && (
                  <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-slate-400">{opt.icon}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
    </div>
  );
};
