import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ) - Land Records & Rights',
  description:
    'Answers to common citizen questions regarding Bhu-Aadhaar, SVAMITVA property cards, mutation protocols, and cadastral maps.',
  openGraph: {
    title: 'Frequently Asked Questions (FAQ) | BHOOMITRA',
    description:
      'Answers to common citizen questions regarding Bhu-Aadhaar, SVAMITVA property cards, mutation protocols, and cadastral maps.',
    url: 'https://web-rho-gules-89.vercel.app/faq',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Frequently Asked Questions (FAQ) | BHOOMITRA',
    description:
      'Answers to common citizen questions regarding Bhu-Aadhaar, SVAMITVA property cards, mutation protocols, and cadastral maps.',
  },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
