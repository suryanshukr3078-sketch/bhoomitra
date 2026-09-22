import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Department of Land Resources & Helpdesk',
  description:
    'Official contact coordinates, state nodal directors, central helpdesk, and RTI cell for the Land Governance Platform.',
  openGraph: {
    title: 'Contact Department of Land Resources | BHOOMITRA',
    description:
      'Official contact coordinates, state nodal directors, central helpdesk, and RTI cell for the Land Governance Platform.',
    url: 'https://web-rho-gules-89.vercel.app/contact',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Department of Land Resources | BHOOMITRA',
    description:
      'Official contact coordinates, state nodal directors, central helpdesk, and RTI cell for the Land Governance Platform.',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
