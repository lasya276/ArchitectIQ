import React from 'react';
import { StepConfig } from '../wizardConfig';
import { WizardAnswers, FunctionalRequirement } from '../../api/types';
import { ShortText } from './ShortText';
import { LongText } from './LongText';
import { SingleChoice } from './SingleChoice';
import { MultiChoice } from './MultiChoice';
import { TagInput } from './TagInput';
import { DynamicList } from './DynamicList';

interface WizardStepProps {
  step: StepConfig;
  answers: WizardAnswers;
  onChange: (fieldId: string, value: unknown) => void;
  validation: Record<string, string>;
}

export const WizardStep: React.FC<WizardStepProps> = ({ step, answers, onChange, validation }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-1 pb-4 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {step.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {step.subtitle}
        </p>
      </div>

      <div className="space-y-5">
        {step.fields.map((field) => {
          const value = answers[field.id as keyof WizardAnswers] ?? '';
          const error = validation[field.id];

          switch (field.type) {
            case 'short-text':
              return (
                <ShortText
                  key={field.id}
                  fieldId={field.id}
                  label={field.label}
                  placeholder={field.placeholder}
                  helperText={field.helperText}
                  value={String(value || '')}
                  onChange={(nextValue) => onChange(field.id, nextValue)}
                  error={error}
                  required={field.required}
                />
              );
            case 'long-text':
              return (
                <LongText
                  key={field.id}
                  fieldId={field.id}
                  label={field.label}
                  placeholder={field.placeholder}
                  helperText={field.helperText}
                  value={String(value || '')}
                  onChange={(nextValue) => onChange(field.id, nextValue)}
                  error={error}
                  required={field.required}
                />
              );
            case 'single-choice':
              return (
                <SingleChoice
                  key={field.id}
                  fieldId={field.id}
                  label={field.label}
                  helperText={field.helperText}
                  options={field.options ?? []}
                  value={String(value || '')}
                  onChange={(nextValue) => onChange(field.id, nextValue)}
                  error={error}
                />
              );
            case 'multi-choice':
              return (
                <MultiChoice
                  key={field.id}
                  fieldId={field.id}
                  label={field.label}
                  helperText={field.helperText}
                  options={field.options ?? []}
                  value={Array.isArray(value) && value.every((entry) => typeof entry === 'string') ? value as string[] : []}
                  onChange={(nextValue) => onChange(field.id, nextValue)}
                  error={error}
                />
              );
            case 'tag-input':
              return (
                <TagInput
                  key={field.id}
                  fieldId={field.id}
                  label={field.label}
                  helperText={field.helperText}
                  placeholder={field.placeholder}
                  value={Array.isArray(value) && value.every((entry) => typeof entry === 'string') ? value as string[] : []}
                  onChange={(nextValue) => onChange(field.id, nextValue)}
                  error={error}
                />
              );
            case 'dynamic-list':
              return (
                <DynamicList
                  key={field.id}
                  fieldId={field.id}
                  label={field.label}
                  helperText={field.helperText}
                  value={Array.isArray(value) ? (value as FunctionalRequirement[]) : []}
                  onChange={(nextValue) => onChange(field.id, nextValue)}
                  error={error}
                />
              );
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
};
