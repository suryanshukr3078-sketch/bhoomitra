'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console or error monitor
    console.error('Unhandled LandGov runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-inner">
          <AlertOctagon className="w-8 h-8" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-rose-700 bg-rose-50 px-3 py-1 rounded-full">
            System Error
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Something went wrong
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            An unexpected error occurred while processing this request. Our telemetry has logged the issue.
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-slate-400">
              Error Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-xl shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Try Again
          </button>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-xl shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
