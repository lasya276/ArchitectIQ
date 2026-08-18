import React, { createContext, useContext, useMemo, useState } from 'react';
import { WIZARD_STEPS, FieldConfig } from '../wizardConfig';
import { WizardAnswers, FunctionalRequirement } from '../../api/types';

interface WizardContextValue {
  currentStep: number;
  answers: WizardAnswers;
  validation: Record<string, string>;
  previousStep: () => void;
  nextStep: () => void;
  goToStep: (stepIndex: number) => void;
  resetWizard: () => void;
  updateAnswer: (fieldId: string, value: unknown) => void;
  validateStep: (stepIndex: number) => Record<string, string>;
  validateAllSteps: () => Record<string, string>;
  getFieldValue: (fieldId: string) => unknown;
}

const WizardContext = createContext<WizardContextValue | undefined>(undefined);

const defaultAnswers: WizardAnswers = {};

const getDefaultValue = (field: FieldConfig) => {
  if (field.type === 'multi-choice' || field.type === 'tag-input') {
    return [];
  }

  if (field.type === 'dynamic-list') {
    return [] as FunctionalRequirement[];
  }

  return '';
};

const validateField = (field: FieldConfig, answers: WizardAnswers) => {
  const value = answers[field.id as keyof WizardAnswers];

  if (!field.required) return '';

  if (field.type === 'short-text' || field.type === 'long-text' || field.type === 'single-choice') {
    const textValue = String(value ?? '').trim();
    return textValue.length > 0 ? '' : 'This field is required.';
  }

  if (field.type === 'multi-choice' || field.type === 'tag-input') {
    const listValue = Array.isArray(value) ? value : [];
    return listValue.length > 0 ? '' : 'Select at least one option.';
  }

  if (field.type === 'dynamic-list') {
    const listValue = Array.isArray(value) ? value : [];
    return listValue.length > 0 ? '' : 'Add at least one requirement.';
  }

  return '';
};

export const WizardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<WizardAnswers>(defaultAnswers);
  const [validation, setValidation] = useState<Record<string, string>>({});

  const getFieldValue = (fieldId: string) => {
    const answer = answers[fieldId as keyof WizardAnswers];
    return answer ?? getDefaultValue(
      WIZARD_STEPS.flatMap((step) => step.fields).find((field) => field.id === fieldId) as FieldConfig
    );
  };

  const updateAnswer = (fieldId: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    setValidation((prev) => ({ ...prev, [fieldId]: '' }));
  };

  const validateStep = (stepIndex: number) => {
    const step = WIZARD_STEPS[stepIndex];
    if (!step) return {};

    const errors: Record<string, string> = {};
    step.fields.forEach((field) => {
      const error = validateField(field, answers);
      if (error) {
        errors[field.id] = error;
      }
    });

    setValidation((prev) => ({ ...prev, ...errors }));
    return errors;
  };

  const validateAllSteps = () => {
    const mergedErrors: Record<string, string> = {};
    WIZARD_STEPS.forEach((step) => {
      step.fields.forEach((field) => {
        const error = validateField(field, answers);
        if (error) {
          mergedErrors[field.id] = error;
        }
      });
    });

    setValidation((prev) => ({ ...prev, ...mergedErrors }));
    return mergedErrors;
  };

  const previousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const nextStep = () => {
    const errors = validateStep(currentStep);
    if (Object.keys(errors).length > 0) return;
    setCurrentStep((prev) => Math.min(prev + 1, WIZARD_STEPS.length));
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex < 0 || stepIndex > WIZARD_STEPS.length) return;
    setCurrentStep(stepIndex);
  };

  const resetWizard = () => {
    setCurrentStep(0);
    setAnswers(defaultAnswers);
    setValidation({});
  };

  const value = useMemo<WizardContextValue>(() => ({
    currentStep,
    answers,
    validation,
    previousStep,
    nextStep,
    goToStep,
    resetWizard,
    updateAnswer,
    validateStep,
    validateAllSteps,
    getFieldValue,
  }), [answers, currentStep, validation]);

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
};

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }

  return context;
};
