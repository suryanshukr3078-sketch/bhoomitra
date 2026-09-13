import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { PageTransition } from '@/components/layout/page-transition';
import { Toaster } from '@/components/ui/toast';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-heading',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#047857',
};

export const metadata: Metadata = {
  title: {
    default: 'Land Governance & Cadastral Platform',
    template: '%s | Land Governance Platform',
  },
  description:
    'Enterprise Land Rights, Boundary Verification, GIS Cadastral Administration, and Evidence-based Land Policy Infrastructure.',
  keywords: [
    'land governance',
    'cadastral administration',
    'GIS boundaries',
    'land tenure',
    'policy research',
    'PostGIS',
    'spatial features',
  ],
  authors: [{ name: 'Land Governance Initiative' }],
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://landgov.platform',
    title: 'Land Governance & Cadastral Platform',
    description:
      'Enterprise Land Rights, GIS Parcel Verification, and Evidence-based Land Policy Administration.',
    siteName: 'Land Governance Platform',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Land Governance & Cadastral Platform',
    description:
      'Enterprise Land Rights, GIS Parcel Verification, and Evidence-based Land Policy Administration.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${inter.variable} h-full scroll-smooth overflow-x-hidden`}>
      <body className="min-h-full flex flex-col bg-slate-50/50 text-slate-900 font-sans antialiased overflow-x-hidden w-full max-w-full">
        <Header />
        <main className="flex-1 w-full max-w-full overflow-x-hidden flex flex-col">
          <PageTransition>{children}</PageTransition>
        </main>
        <footer className="border-t border-slate-200 bg-white pt-12 pb-8 text-xs text-slate-500 w-full max-w-full overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-left">
              {/* Col 1 */}
              <div className="space-y-3">
                <div className="font-bold text-slate-900 text-sm">Platform</div>
                <ul className="space-y-2">
                  <li><a href="/" className="hover:text-emerald-700">Home</a></li>
                  <li><a href="/maps" className="hover:text-emerald-700">Cadastral Maps</a></li>
                  <li><a href="/policies" className="hover:text-emerald-700">Policies Registry</a></li>
                  <li><a href="/research" className="hover:text-emerald-700">Research Papers</a></li>
                  <li><a href="/datasets" className="hover:text-emerald-700">Open GIS Datasets</a></li>
                </ul>
              </div>

              {/* Col 2 */}
              <div className="space-y-3">
                <div className="font-bold text-slate-900 text-sm">Trust & Provenance</div>
                <ul className="space-y-2">
                  <li><a href="/evidence" className="hover:text-emerald-700">Evidence & DAG Trail</a></li>
                  <li><a href="/contribute" className="hover:text-emerald-700">Contribute Record</a></li>
                  <li><a href="/assistant" className="hover:text-emerald-700">AI Policy Assistant</a></li>
                  <li><a href="/dashboard" className="hover:text-emerald-700">Governance Dashboard</a></li>
                </ul>
              </div>

              {/* Col 3 */}
              <div className="space-y-3">
                <div className="font-bold text-slate-900 text-sm">Information</div>
                <ul className="space-y-2">
                  <li><a href="/about" className="hover:text-emerald-700">About Platform</a></li>
                  <li><a href="/faq" className="hover:text-emerald-700">Frequently Asked Questions</a></li>
                  <li><a href="/contact" className="hover:text-emerald-700">Contact & Partnerships</a></li>
                </ul>
              </div>

              {/* Col 4 */}
              <div className="space-y-3">
                <div className="font-bold text-slate-900 text-sm">Account & Access</div>
                <ul className="space-y-2">
                  <li><a href="/login" className="hover:text-emerald-700">Sign In</a></li>
                  <li><a href="/register" className="hover:text-emerald-700">Surveyor Registration</a></li>
                </ul>
              </div>
            </div>

            {/* Disclaimer Banner */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-[11px] leading-relaxed text-left">
              <strong>Notice of Non-Official Synthetic Demonstration Data:</strong> This platform demonstrates open cadastral technology and automated PostGIS topological validation. All sample parcels, boundary polygons, policy drafts, and mutation entries are synthetic test records. Official statutory land rights are governed exclusively by jurisdictional state revenue departments.
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400 text-center sm:text-left">
              <p>© {new Date().getFullYear()} LandGov Cadastral Administration. All rights reserved.</p>
              <p>PostGIS 3.6 & Append-Only Cryptographic Ledger</p>
            </div>
          </div>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
