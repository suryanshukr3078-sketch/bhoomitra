import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Failed to load data',
  description = 'An unexpected error occurred while communicating with the server. Please try again.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-xl border border-rose-200 bg-rose-50/50',
        className
      )}
    >
      <div className="w-12 h-12 mb-3 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
        <AlertTriangle className="w-6 h-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-rose-900 mb-1">{title}</h3>
      <p className="text-sm text-rose-700 max-w-sm mb-4">{description}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          Retry Request
        </button>
      )}
    </div>
  );
}
