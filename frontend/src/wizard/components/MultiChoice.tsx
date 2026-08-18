import React from 'react';
import { Check } from 'lucide-react';
import { ChoiceOption } from '../../wizard/wizardConfig';

interface MultiChoiceProps {
  fieldId: string;
  label: string;
  helperText?: string;
  options: ChoiceOption[];
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}

export const MultiChoice: React.FC<MultiChoiceProps> = ({
  fieldId,
  label,
  helperText,
  options,
  value,
  onChange,
  error,
}) => {
  const toggle = (optValue: string) => {
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue));
    } else {
      onChange([...value, optValue]);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</p>
        {helperText && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{helperText}</p>
        )}
        {value.length > 0 && (
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1 font-medium">
            {value.length} selected
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {options.map((opt) => {
          const selected = value.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              id={`${fieldId}-${opt.value}`}
              onClick={() => toggle(opt.value)}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
                selected
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30'
              }`}
            >
              <span
                className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                  selected
                    ? 'border-indigo-500 bg-indigo-500'
                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                }`}
              >
                {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </span>
              <span className="flex-1 leading-snug">{opt.label}</span>
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
};
