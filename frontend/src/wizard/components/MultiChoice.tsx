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
    <div className="space-y-2.5">
      <div>
        <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</p>
        {helperText && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{helperText}</p>
        )}
        {value.length > 0 && (
          <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5 font-medium">
            {value.length} selected
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {options.map((opt) => {
          const selected = value.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              id={`${fieldId}-${opt.value}`}
              onClick={() => toggle(opt.value)}
              className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-md border text-left text-xs sm:text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-blue-600 ${
                selected
                  ? 'border-blue-600 bg-blue-50/50 text-blue-950 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-700 font-medium'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <span
                className={`shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  selected
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                }`}
              >
                {selected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
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
