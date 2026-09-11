'use client';

import React from 'react';
import { useToast, ToastItem } from '@/hooks/use-toast';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <aside
      aria-label="Notifications"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full px-4 sm:px-0 pointer-events-none"
    >
      {toasts.map((item) => (
        <ToastCard key={item.id} item={item} onDismiss={() => dismiss(item.id)} />
      ))}
    </aside>
  );
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const icons = {
    default: <Info className="w-5 h-5 text-slate-500 shrink-0" aria-hidden="true" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" aria-hidden="true" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" aria-hidden="true" />,
  };

  const borders = {
    default: 'border-slate-200 bg-white text-slate-900 shadow-lg',
    success: 'border-emerald-200 bg-emerald-50/90 text-emerald-950 shadow-emerald-500/10 shadow-lg',
    warning: 'border-amber-200 bg-amber-50/90 text-amber-950 shadow-amber-500/10 shadow-lg',
    error: 'border-rose-200 bg-rose-50/90 text-rose-950 shadow-rose-500/10 shadow-lg',
  };

  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-5',
        borders[item.variant || 'default']
      )}
    >
      {icons[item.variant || 'default']}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold leading-none">{item.title}</h4>
        {item.description && (
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="text-slate-400 hover:text-slate-700 rounded-lg p-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}
