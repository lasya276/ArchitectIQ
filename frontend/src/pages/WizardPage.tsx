import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Sparkles, X } from 'lucide-react';
import { projectService } from '../services/projectService';
import { questionnaireService } from '../services/questionnaireService';
import { WIZARD_STEPS, TOTAL_STEPS } from '../wizard/wizardConfig';
import { WizardProvider, useWizard } from '../wizard/context/WizardContext';
import { WizardStep } from '../wizard/components/WizardStep';
import { StepIndicator } from '../wizard/components/StepIndicator';
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
      <div className="mx-auto max-w-5xl space-y-6 py-2">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              Requirement Discovery Wizard
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Project Requirements Intake
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Use the guided workflow to define the project, constraints, and priorities.
            </p>
          </div>
        </div>

        <Card className="overflow-hidden border-slate-200/80 bg-white/80 p-0 shadow-[0_8px_40px_-20px_rgba(99,102,241,0.45)] dark:border-slate-800 dark:bg-slate-900/70">
          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="p-4 sm:p-6 lg:p-7">
              {isReviewStep ? (
                <ReviewStep answers={answers} onEdit={goToStep} validation={validation} />
              ) : (
                <WizardStep step={currentConfig} answers={answers} onChange={updateAnswer} validation={validation} />
              )}
            </div>

            <aside className="border-t border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/40 sm:p-5 lg:border-l lg:border-t-0">
              <div className="sticky top-4 space-y-4">
                <StepIndicator
                  currentStep={isReviewStep ? WIZARD_STEPS.length - 1 : currentStep}
                  totalSteps={TOTAL_STEPS}
                  onStepClick={(stepIndex) => goToStep(stepIndex)}
                />

                <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Completion Snapshot</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{completionPercent}% of the intake flow is now completed.</p>
                </div>
              </div>
            </aside>
          </div>

          <div className="sticky bottom-0 border-t border-slate-200 bg-slate-50/90 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/80 sm:px-6">
            <div className="mx-auto flex max-w-5xl flex-col gap-3">
              {submitError && (
                <div className="flex items-center gap-2 text-xs font-medium text-rose-600 dark:text-rose-400">
                  <AlertCircle className="h-4 w-4" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleCancel} leftIcon={<X className="h-4 w-4" />}>
                    Cancel
                  </Button>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={handleBack} leftIcon={<ArrowLeft className="h-4 w-4" />}>
                    Previous
                  </Button>

                  {isReviewStep ? (
                    <Button size="sm" isLoading={isSubmitting} onClick={handleFinish} leftIcon={<CheckCircle2 className="h-4 w-4" />}>
                      Finish
                    </Button>
                  ) : (
                    <Button size="sm" onClick={handleNext} rightIcon={<ArrowRight className="h-4 w-4" />}>
                      Next
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
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
