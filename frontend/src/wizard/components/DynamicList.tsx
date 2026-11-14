import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { FunctionalRequirement } from '../../api/types';

interface DynamicListProps {
  fieldId: string;
  label: string;
  helperText?: string;
  value: FunctionalRequirement[];
  onChange: (value: FunctionalRequirement[]) => void;
  error?: string;
}

const createRequirement = (text = '', category = 'feature'): FunctionalRequirement => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  text,
  category,
  priority: 'must_have',
});

const priorityOptions: Array<{ value: FunctionalRequirement['priority']; label: string }> = [
  { value: 'must_have', label: 'Must Have' },
  { value: 'should_have', label: 'Should Have' },
  { value: 'could_have', label: 'Could Have' },
  { value: 'wont_have', label: "Won't Have" },
];

export const DynamicList: React.FC<DynamicListProps> = ({
  fieldId,
  label,
  helperText,
  value,
  onChange,
  error,
}) => {
  const [draft, setDraft] = useState('');

  const addEntry = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;

    onChange([
      ...value,
      {
        ...createRequirement(trimmed, 'feature'),
      },
    ]);
    setDraft('');
  };

  const updateEntry = (id: string, key: keyof FunctionalRequirement, nextValue: string) => {
    onChange(value.map((entry) => (entry.id === id ? { ...entry, [key]: nextValue } : entry)));
  };

  const removeEntry = (id: string) => {
    onChange(value.filter((entry) => entry.id !== id));
  };

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor={fieldId} className="block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
          {label}
        </label>
        {helperText && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{helperText}</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          id={fieldId}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addEntry();
            }
          }}
          placeholder="e.g. User authentication with JWT and refresh tokens"
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
        />
        <button
          type="button"
          onClick={addEntry}
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Requirement
        </button>
      </div>

      <div className="space-y-2">
        {value.map((entry, index) => (
          <div key={entry.id} className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Requirement #{index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeEntry(entry.id)}
                className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="Remove item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <input
              value={entry.text}
              onChange={(e) => updateEntry(entry.id, 'text', e.target.value)}
              placeholder="Requirement description"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-1.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={entry.priority}
                onChange={(e) => updateEntry(entry.id, 'priority', e.target.value as any)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <input
                value={entry.category}
                onChange={(e) => updateEntry(entry.id, 'category', e.target.value)}
                placeholder="Category (e.g. Auth, Data, API)"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
};
