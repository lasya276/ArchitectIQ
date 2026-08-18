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
      <label htmlFor={fieldId} className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
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
        className={`w-full bg-slate-50 dark:bg-slate-950 border rounded-lg px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 transition-colors ${
          error
            ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
            : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500'
        }`}
      />
      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
};
