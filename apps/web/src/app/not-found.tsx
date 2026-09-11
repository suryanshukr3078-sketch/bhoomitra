import Link from 'next/link';
import { Compass, Home, MapPin, BookOpen, FileText } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-inner">
          <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '12s' }} aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            404 Error
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Cadastral Record Not Found
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            The parcel, policy document, or governance page you are looking for has been moved or does not exist.
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 text-left space-y-2 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Suggested Destinations:
          </p>
          <div className="grid grid-cols-1 gap-1.5 text-sm">
            <Link
              href="/maps"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-emerald-700 transition-colors"
            >
              <MapPin className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              Interactive Cadastral Maps
            </Link>
            <Link
              href="/policies"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-emerald-700 transition-colors"
            >
              <FileText className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              Policy Documents Registry
            </Link>
            <Link
              href="/research"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-emerald-700 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              Land Research Papers
            </Link>
          </div>
        </div>

        <div>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-xl shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
