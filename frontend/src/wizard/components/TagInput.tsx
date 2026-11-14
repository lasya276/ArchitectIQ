import React, { useState } from 'react';
import { X } from 'lucide-react';

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
      <label htmlFor={fieldId} className="block text-sm font-medium text-slate-800 dark:text-slate-200">
        {label}
      </label>
      {helperText && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
      <div
        className={`rounded-md border bg-white px-3 py-2 transition-colors dark:bg-slate-900 ${
          error
            ? 'border-rose-300 dark:border-rose-700'
            : 'border-slate-200 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 dark:border-slate-800'
        }`}
      >
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400"
                aria-label={`Remove ${tag}`}
              >
                <X className="h-3 w-3" />
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
          placeholder={placeholder || 'Type and press Enter or comma'}
          className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder-slate-500"
        />
      </div>
      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
};

