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
    <div className="space-y-2.5">
      <div>
        <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</p>
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
              className={`group flex w-full items-center gap-3 rounded-md border px-3.5 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 ${
                selected
                  ? 'border-blue-600 bg-blue-50/50 text-blue-950 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-700 font-medium'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800/40'
              }`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  selected
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800'
                }`}
              >
                {selected && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-xs sm:text-sm">{opt.label}</span>
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
