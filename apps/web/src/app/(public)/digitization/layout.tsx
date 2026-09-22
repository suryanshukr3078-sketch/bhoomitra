import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bhu-Aadhaar (ULPIN) & Dual-Pane OCR Digitization',
  description:
    'Real-time automated cadastral digitization, historical deed optical character recognition (OCR), and GIS vector overlay verification.',
  openGraph: {
    title: 'Bhu-Aadhaar & Dual-Pane OCR Digitization | BHOOMITRA',
    description:
      'Real-time automated cadastral digitization, historical deed optical character recognition (OCR), and GIS vector overlay verification.',
    url: 'https://web-rho-gules-89.vercel.app/digitization',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bhu-Aadhaar & Dual-Pane OCR Digitization | BHOOMITRA',
    description:
      'Real-time automated cadastral digitization, historical deed optical character recognition (OCR), and GIS vector overlay verification.',
  },
};

export default function DigitizationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
