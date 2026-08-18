import React from 'react';
import * as LucideIcons from 'lucide-react';
import { StepConfig, WIZARD_STEPS } from '../wizardConfig';
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

const IconMap = {
  Layers: LucideIcons.Layers,
  Building2: LucideIcons.Building2,
  Users: LucideIcons.Users,
  Target: LucideIcons.Target,
  Monitor: LucideIcons.Monitor,
  BarChart3: LucideIcons.BarChart3,
  ListChecks: LucideIcons.ListChecks,
  ShieldCheck: LucideIcons.ShieldCheck,
  Plug: LucideIcons.Plug,
  NotebookPen: LucideIcons.NotebookPen,
};

export const WizardStep: React.FC<WizardStepProps> = ({ step, answers, onChange, validation }) => {
  const StepIcon = IconMap[step.icon as keyof typeof IconMap] ?? LucideIcons.Layers;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/40 sm:px-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
            <StepIcon className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-indigo-600 dark:text-indigo-300">
              Step {step.stepNumber} of {WIZARD_STEPS.length}
            </p>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{step.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{step.subtitle}</p>
          </div>
        </div>
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
