import React, { useState } from 'react';

interface TagInputProps {
  fieldId: string;
  label: string;
  helperText?: string;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  placeholder?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
  fieldId,
  label,
  helperText,
  value,
  onChange,
  error,
  placeholder,
}) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = (rawValue: string) => {
    const trimmed = rawValue.trim();
    if (!trimmed) return;
    if (!value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInputValue('');
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((entry) => entry !== tag));
  };

  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
        {label}
      </label>
      {helperText && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
      <div className={`rounded-xl border bg-slate-50 dark:bg-slate-950 px-3 py-2 ${error ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700'}`}>
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-1 text-[11px] font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-500/20"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-indigo-600 dark:text-indigo-300 hover:text-rose-500"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          id={fieldId}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              addTag(inputValue);
            }
          }}
          placeholder={placeholder || 'Type a value and press Enter'}
          className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
        />
      </div>
      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
};
