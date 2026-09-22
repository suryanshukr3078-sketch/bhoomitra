import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Land Governance Policies & Gazette Consultations',
  description:
    'Search, inspect, and participate in statutory land policies, Model Land Leasing Acts, and state cadastral mandates.',
  openGraph: {
    title: 'Land Governance Policies & Gazette Consultations | BHOOMITRA',
    description:
      'Search, inspect, and participate in statutory land policies, Model Land Leasing Acts, and state cadastral mandates.',
    url: 'https://web-rho-gules-89.vercel.app/policies',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Land Governance Policies & Gazette Consultations | BHOOMITRA',
    description:
      'Search, inspect, and participate in statutory land policies, Model Land Leasing Acts, and state cadastral mandates.',
  },
};

export default function PoliciesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
