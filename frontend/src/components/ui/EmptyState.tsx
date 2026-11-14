import React from 'react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  label?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  label,
  description,
  action,
  className = '',
}) => {
  const displayTitle = title || label;
  return (
    <div
      className={`py-12 px-6 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/20 ${className}`}
    >
      {icon && (
        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-3">
          {icon}
        </div>
      )}
      {displayTitle && (
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {displayTitle}
        </h4>
      )}
      {description && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;
