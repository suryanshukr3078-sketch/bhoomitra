import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Watershed Administration & Remote Sensing (SRISHTI-DRISHTI)',
  description:
    'Satellite remote sensing, micro-watershed boundary demarcation, and soil moisture analytics under WDC-PMKSY.',
  openGraph: {
    title: 'Watershed Administration & Remote Sensing | BHOOMITRA',
    description:
      'Satellite remote sensing, micro-watershed boundary demarcation, and soil moisture analytics under WDC-PMKSY.',
    url: 'https://web-rho-gules-89.vercel.app/watershed',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Watershed Administration & Remote Sensing | BHOOMITRA',
    description:
      'Satellite remote sensing, micro-watershed boundary demarcation, and soil moisture analytics under WDC-PMKSY.',
  },
};

export default function WatershedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
