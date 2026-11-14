import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Button } from '../components/ui/Button';
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { projectService } from '../services/projectService';
import { questionnaireService } from '../services/questionnaireService';
import { WIZARD_STEPS, TOTAL_STEPS } from '../wizard/wizardConfig';
import { WizardProvider, useWizard } from '../wizard/context/WizardContext';
import { WizardStep } from '../wizard/components/WizardStep';
import { ReviewStep } from '../wizard/components/ReviewStep';

const WizardContent: React.FC = () => {
  const navigate = useNavigate();
  const { currentStep, answers, validation, previousStep, nextStep, goToStep, resetWizard, updateAnswer, validateStep, validateAllSteps } = useWizard();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const currentConfig = WIZARD_STEPS[currentStep];
  const isReviewStep = currentStep === WIZARD_STEPS.length;

  const completionPercent = useMemo(() => {
    return Math.round(((currentStep + 1) / TOTAL_STEPS) * 100);
  }, [currentStep]);

  const handleNext = () => {
    setSubmitError(null);
    const errors = validateStep(currentStep);
    if (Object.keys(errors).length > 0) {
      setSubmitError('Please complete all required fields before continuing.');
      return;
    }

    if (currentStep < WIZARD_STEPS.length - 1) {
      nextStep();
      return;
    }

    if (currentStep === WIZARD_STEPS.length - 1) {
      goToStep(WIZARD_STEPS.length);
    }
  };

  const handleBack = () => {
    setSubmitError(null);
    if (isReviewStep) {
      goToStep(WIZARD_STEPS.length - 1);
      return;
    }
    previousStep();
  };

  const handleCancel = () => {
    resetWizard();
    navigate('/dashboard');
  };

  const handleFinish = async () => {
    setSubmitError(null);
    const errors = validateAllSteps();
    if (Object.keys(errors).length > 0) {
      setSubmitError('Please review the required fields before finishing.');
      goToStep(0);
      return;
    }

    const projectName = String(answers.project_name || '').trim();
    if (!projectName) {
      setSubmitError('Project name is required before finishing.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await projectService.createProject({
        title: projectName,
        description: String(answers.project_description || '').trim() || undefined,
      });

      await questionnaireService.saveAnswers(created.id, {
        answers,
        status: 'completed',
      });

      resetWizard();
      navigate(`/workspace/${created.id}`);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to finish the wizard.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto py-4 space-y-6">
        {/* Wizard Header with Progress */}
        <div className="space-y-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-blue-600 dark:text-blue-400">
              Project Setup
            </span>
            <span>
              {isReviewStep ? 'Review & Confirm' : `Step ${currentStep + 1} of ${TOTAL_STEPS}`}
            </span>
          </div>

          {/* Clean Thin Progress Bar */}
          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        {/* Step Body */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 sm:p-8 shadow-xs">
          {isReviewStep ? (
            <ReviewStep answers={answers} onEdit={goToStep} validation={validation} />
          ) : (
            <WizardStep step={currentConfig} answers={answers} onChange={updateAnswer} validation={validation} />
          )}

          {submitError && (
            <div className="mt-6 p-3 rounded-md bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              leftIcon={<X className="w-3.5 h-3.5" />}
            >
              Cancel
            </Button>

            <div className="flex items-center gap-2.5 justify-end">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBack}
                  leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                >
                  Back
                </Button>
              )}

              {isReviewStep ? (
                <Button
                  size="sm"
                  isLoading={isSubmitting}
                  onClick={handleFinish}
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                >
                  Finish & Create Workspace
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleNext}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Continue
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export const WizardPage: React.FC = () => {
  return (
    <WizardProvider>
      <WizardContent />
    </WizardProvider>
  );
};
