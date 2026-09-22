import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Land Governance Research Papers & Academic Studies',
  description:
    'Peer-reviewed publications, open-access studies, and empirical cadastral research across India.',
  openGraph: {
    title: 'Land Governance Research Papers & Academic Studies | BHOOMITRA',
    description:
      'Peer-reviewed publications, open-access studies, and empirical cadastral research across India.',
    url: 'https://web-rho-gules-89.vercel.app/research',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Land Governance Research Papers & Academic Studies | BHOOMITRA',
    description:
      'Peer-reviewed publications, open-access studies, and empirical cadastral research across India.',
  },
};

export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
