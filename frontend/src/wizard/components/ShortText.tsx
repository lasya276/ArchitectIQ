import React from 'react';

interface ShortTextProps {
  fieldId: string;
  label: string;
  placeholder?: string;
  helperText?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export const ShortText: React.FC<ShortTextProps> = ({
  fieldId,
  label,
  placeholder,
  helperText,
  value,
  onChange,
  error,
  required,
}) => {
  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="block text-sm font-medium text-slate-800 dark:text-slate-200">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>
      {helperText && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
      <input
        id={fieldId}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-md border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:outline-none dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 ${
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-rose-700'
            : 'border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-800'
        }`}
      />
      {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
    </div>
  );
};

