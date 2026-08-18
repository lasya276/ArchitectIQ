/**
 * Workspace Mapper Utility
 *
 * Strictly maps WizardAnswers into Workspace specification fields.
 * Only includes actual user-provided inputs without generating unprovided assumptions.
 * Reuses existing TypeScript types from types.ts.
 */
import { WizardAnswers, Workspace, WorkspaceUpdate, FunctionalRequirement } from '../api/types';
import { WIZARD_STEPS } from '../wizard/wizardConfig';

const MOSCOW_LABELS: Record<string, string> = {
  must_have: 'Must Have',
  should_have: 'Should Have',
  could_have: 'Could Have',
  wont_have: "Won't Have",
};

/**
 * Look up human-readable label for a single-choice or multi-choice option value.
 */
export function getOptionLabel(fieldId: string, value: string): string {
  if (!value) return '';
  for (const step of WIZARD_STEPS) {
    const field = step.fields.find((f) => f.id === fieldId);
    if (field && field.options) {
      const opt = field.options.find((o) => o.value === value);
      if (opt) return opt.label;
    }
  }
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format a list of option values into human-readable labels.
 */
export function getOptionLabels(fieldId: string, values?: string[]): string[] {
  if (!Array.isArray(values) || values.length === 0) return [];
  return values
    .map((v) => getOptionLabel(fieldId, v))
    .filter((v) => Boolean(v && v.trim()));
}

/**
 * Format Functional Requirements (MoSCoW prioritized list)
 */
function formatFunctionalRequirements(reqs?: FunctionalRequirement[]): string {
  if (!Array.isArray(reqs) || reqs.length === 0) return '';
  const lines: string[] = ['### Functional Requirements:'];
  reqs.forEach((req) => {
    if (!req.text?.trim()) return;
    const priorityLabel = MOSCOW_LABELS[req.priority] || req.priority;
    const categoryInfo = req.category?.trim() ? ` [${req.category.trim()}]` : '';
    lines.push(`• [${priorityLabel}] ${req.text.trim()}${categoryInfo}`);
  });
  return lines.length > 1 ? lines.join('\n') : '';
}

/**
 * Build Vision section from actual wizard inputs.
 */
export function buildVisionFromAnswers(answers: WizardAnswers): string {
  const parts: string[] = [];

  const metaLines: string[] = [];
  if (answers.project_category) {
    metaLines.push(`Project Category: ${getOptionLabel('project_category', answers.project_category)}`);
  }
  if (answers.industry) {
    metaLines.push(`Industry Domain: ${getOptionLabel('industry', answers.industry)}`);
  }
  if (answers.priority) {
    metaLines.push(`Top Priority: ${getOptionLabel('priority', answers.priority)}`);
  }
  if (answers.business_size) {
    metaLines.push(`Organisation Size: ${getOptionLabel('business_size', answers.business_size)}`);
  }

  if (metaLines.length > 0) {
    parts.push(metaLines.join('\n'));
  }

  if (answers.project_description?.trim()) {
    parts.push(`Project Overview:\n${answers.project_description.trim()}`);
  }

  if (answers.notes?.trim()) {
    parts.push(`Additional Notes:\n${answers.notes.trim()}`);
  }

  return parts.join('\n\n');
}

/**
 * Build Problem Statement section from actual wizard inputs.
 */
export function buildProblemStatementFromAnswers(answers: WizardAnswers): string {
  const parts: string[] = [];

  if (answers.industry) {
    parts.push(`Industry Context: ${getOptionLabel('industry', answers.industry)}`);
  }

  const objectives = getOptionLabels('business_objectives', answers.business_objectives);
  if (objectives.length > 0) {
    parts.push(`Target Objectives to Address:\n${objectives.map((obj) => `• ${obj}`).join('\n')}`);
  }

  return parts.join('\n\n');
}

/**
 * Build Requirements section from actual wizard inputs.
 */
export function buildRequirementsFromAnswers(answers: WizardAnswers): string {
  const parts: string[] = [];

  const functionalBlock = formatFunctionalRequirements(answers.functional_requirements);
  if (functionalBlock) {
    parts.push(functionalBlock);
  }

  const platforms = getOptionLabels('platforms', answers.platforms);
  if (platforms.length > 0) {
    parts.push(`### Target Deployment Platforms:\n${platforms.map((p) => `• ${p}`).join('\n')}`);
  }

  const nfrs = getOptionLabels('non_functional_requirements', answers.non_functional_requirements);
  if (nfrs.length > 0) {
    parts.push(`### Non-Functional Requirements:\n${nfrs.map((n) => `• ${n}`).join('\n')}`);
  }

  const integrations = getOptionLabels('integrations', answers.integrations).filter(
    (label) => label.toLowerCase() !== 'no integrations required'
  );
  if (integrations.length > 0) {
    parts.push(`### External Integrations:\n${integrations.map((i) => `• ${i}`).join('\n')}`);
  }

  if (answers.special_requirements?.trim()) {
    parts.push(`### Special Requirements:\n${answers.special_requirements.trim()}`);
  }

  return parts.join('\n\n');
}

/**
 * Build Constraints section from actual wizard inputs.
 */
export function buildConstraintsFromAnswers(answers: WizardAnswers): string {
  const lines: string[] = [];

  if (answers.timeline) {
    lines.push(`Delivery Timeline: ${getOptionLabel('timeline', answers.timeline)}`);
  }
  if (answers.budget && answers.budget !== 'not_disclosed') {
    lines.push(`Budget Range: ${getOptionLabel('budget', answers.budget)}`);
  }
  if (answers.team_size) {
    lines.push(`Engineering Team Size: ${getOptionLabel('team_size', answers.team_size)}`);
  }
  if (answers.expected_users) {
    lines.push(`Expected Users / Concurrency: ${getOptionLabel('expected_users', answers.expected_users)}`);
  }

  const parts: string[] = [];
  if (lines.length > 0) {
    parts.push(lines.join('\n'));
  }

  if (answers.constraints?.trim()) {
    parts.push(`Architectural & Technical Constraints:\n${answers.constraints.trim()}`);
  }

  return parts.join('\n\n');
}

/**
 * Build Business Goals section from actual wizard inputs.
 */
export function buildBusinessGoalsFromAnswers(answers: WizardAnswers): string {
  const parts: string[] = [];

  const objectives = getOptionLabels('business_objectives', answers.business_objectives);
  if (objectives.length > 0) {
    parts.push(`Primary Business Objectives:\n${objectives.map((o) => `• ${o}`).join('\n')}`);
  }

  if (answers.business_goals?.trim()) {
    parts.push(`Measurable Business Goals & KPIs:\n${answers.business_goals.trim()}`);
  }

  if (answers.priority) {
    parts.push(`Primary Focus Priority: ${getOptionLabel('priority', answers.priority)}`);
  }

  return parts.join('\n\n');
}

/**
 * Build Stakeholders section from actual wizard inputs.
 */
export function buildStakeholdersFromAnswers(answers: WizardAnswers): string {
  const lines: string[] = [];

  if (answers.business_size) {
    lines.push(`Organisation Scale: ${getOptionLabel('business_size', answers.business_size)}`);
  }
  if (answers.team_size) {
    lines.push(`Development Team Size: ${getOptionLabel('team_size', answers.team_size)}`);
  }

  const parts: string[] = [];
  if (lines.length > 0) {
    parts.push(lines.join('\n'));
  }

  const userRoles = getOptionLabels('target_users', answers.target_users);
  if (userRoles.length > 0) {
    parts.push(`Stakeholder & User Roles:\n${userRoles.map((role) => `• ${role}`).join('\n')}`);
  }

  return parts.join('\n\n');
}

/**
 * Build Target Users section from actual wizard inputs.
 */
export function buildTargetUsersFromAnswers(answers: WizardAnswers): string {
  const parts: string[] = [];

  const userRoles = getOptionLabels('target_users', answers.target_users);
  if (userRoles.length > 0) {
    parts.push(`Target User Roles:\n${userRoles.map((role) => `• ${role}`).join('\n')}`);
  }

  if (answers.expected_users) {
    parts.push(`Estimated User Base: ${getOptionLabel('expected_users', answers.expected_users)}`);
  }

  return parts.join('\n\n');
}

/**
 * Maps WizardAnswers to 7 Workspace fields, strictly preserving non-empty existing workspace values.
 */
export function mapQuestionnaireToWorkspace(
  answers: WizardAnswers,
  existingWorkspace?: Workspace | null
): WorkspaceUpdate {
  const isNotEmpty = (val?: string | null) => Boolean(val && val.trim().length > 0);

  return {
    vision: isNotEmpty(existingWorkspace?.vision)
      ? existingWorkspace!.vision
      : buildVisionFromAnswers(answers),

    problem_statement: isNotEmpty(existingWorkspace?.problem_statement)
      ? existingWorkspace!.problem_statement
      : buildProblemStatementFromAnswers(answers),

    requirements: isNotEmpty(existingWorkspace?.requirements)
      ? existingWorkspace!.requirements
      : buildRequirementsFromAnswers(answers),

    constraints: isNotEmpty(existingWorkspace?.constraints)
      ? existingWorkspace!.constraints
      : buildConstraintsFromAnswers(answers),

    business_goals: isNotEmpty(existingWorkspace?.business_goals)
      ? existingWorkspace!.business_goals
      : buildBusinessGoalsFromAnswers(answers),

    stakeholders: isNotEmpty(existingWorkspace?.stakeholders)
      ? existingWorkspace!.stakeholders
      : buildStakeholdersFromAnswers(answers),

    target_users: isNotEmpty(existingWorkspace?.target_users)
      ? existingWorkspace!.target_users
      : buildTargetUsersFromAnswers(answers),
  };
}
