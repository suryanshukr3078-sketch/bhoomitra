import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contribute Land Governance Resources & Evidence',
  description:
    'Contribute spatial datasets, policy gazettes, academic research papers, and drone survey evidence to the national platform.',
  openGraph: {
    title: 'Contribute Land Governance Resources & Evidence | BHOOMITRA',
    description:
      'Contribute spatial datasets, policy gazettes, academic research papers, and drone survey evidence to the national platform.',
    url: 'https://web-rho-gules-89.vercel.app/contribute',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contribute Land Governance Resources & Evidence | BHOOMITRA',
    description:
      'Contribute spatial datasets, policy gazettes, academic research papers, and drone survey evidence to the national platform.',
  },
};

export default function ContributeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
