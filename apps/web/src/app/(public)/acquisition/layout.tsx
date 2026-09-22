import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Land Acquisition Monitoring System (LAMS RFCTLARR)',
  description:
    'Transparent tracking of statutory land acquisitions, Section 11 gazette notifications, social impact assessments, and award compensations.',
  openGraph: {
    title: 'Land Acquisition Monitoring System | BHOOMITRA',
    description:
      'Transparent tracking of statutory land acquisitions, Section 11 gazette notifications, social impact assessments, and award compensations.',
    url: 'https://web-rho-gules-89.vercel.app/acquisition',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Land Acquisition Monitoring System | BHOOMITRA',
    description:
      'Transparent tracking of statutory land acquisitions, Section 11 gazette notifications, social impact assessments, and award compensations.',
  },
};

export default function AcquisitionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
