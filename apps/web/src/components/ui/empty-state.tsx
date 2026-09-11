import React from 'react';
import { Search, FolderOpen, Database, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: 'search' | 'folder' | 'database' | 'file';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon = 'search',
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  const icons = {
    search: <Search className="w-10 h-10 text-slate-400" aria-hidden="true" />,
    folder: <FolderOpen className="w-10 h-10 text-slate-400" aria-hidden="true" />,
    database: <Database className="w-10 h-10 text-slate-400" aria-hidden="true" />,
    file: <FileText className="w-10 h-10 text-slate-400" aria-hidden="true" />,
  };

  return (
    <div
      role="status"
      aria-label={title}
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50',
        className
      )}
    >
      <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 flex items-center justify-center">
        {icons[icon]}
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
