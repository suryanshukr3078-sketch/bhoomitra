import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Open Cadastral Datasets & GeoJSON Boundaries',
  description:
    'Discover and download verified spatial datasets, village boundaries, land use overlays, and administrative cadastres.',
  openGraph: {
    title: 'Open Cadastral Datasets & GeoJSON Boundaries | BHOOMITRA',
    description:
      'Discover and download verified spatial datasets, village boundaries, land use overlays, and administrative cadastres.',
    url: 'https://web-rho-gules-89.vercel.app/datasets',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Open Cadastral Datasets & GeoJSON Boundaries | BHOOMITRA',
    description:
      'Discover and download verified spatial datasets, village boundaries, land use overlays, and administrative cadastres.',
  },
};

export default function DatasetsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
