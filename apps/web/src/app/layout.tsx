import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { PageTransition } from '@/components/layout/page-transition';
import { Toaster } from '@/components/ui/toast';
import { AuthProvider } from '@/lib/auth-context';

import { GovFooter } from '@/components/layout/gov-footer';

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
  themeColor: '#1a3c6e',
};

export const metadata: Metadata = {
  title: {
    default: 'भू-मित्र BHOOMITRA | National Land Governance & Cadastral Platform | Government of India',
    template: '%s | BHOOMITRA - Government of India',
  },
  description:
    'Government of India citizen engagement & cadastral governance platform. Bhu-Aadhaar (ULPIN), SVAMITVA rural land property cards, and PostGIS spatial boundaries.',
  keywords: [
    'Bhoomitra',
    'MyGov',
    'land governance',
    'cadastral administration',
    'SVAMITVA',
    'Bhu-Aadhaar',
    'ULPIN',
    'Government of India',
    'GIS boundaries',
    'PostGIS',
  ],
  authors: [{ name: 'Ministry of Rural Development, Government of India' }],
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://web-rho-gules-89.vercel.app',
    title: 'भू-मित्र BHOOMITRA | National Land Governance Platform | Government of India',
    description:
      'Citizen engagement and spatial cadastral governance portal under Department of Land Resources, Ministry of Rural Development.',
    siteName: 'Bhoomitra - Government of India',
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
        <AuthProvider>
          <Header />
          <main id="main-content" className="flex-1 w-full max-w-full overflow-x-hidden flex flex-col focus:outline-none" tabIndex={-1}>
            <PageTransition>{children}</PageTransition>
          </main>
          <GovFooter />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
