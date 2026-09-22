import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Interactive Spatial Cadastral GIS & Maps',
  description:
    'High-resolution multi-tier cadastral map viewer with SVAMITVA village boundaries, Bhu-Aadhaar parcel polygons, and drone orthophotos.',
  openGraph: {
    title: 'Interactive Spatial Cadastral GIS & Maps | BHOOMITRA',
    description:
      'High-resolution multi-tier cadastral map viewer with SVAMITVA village boundaries, Bhu-Aadhaar parcel polygons, and drone orthophotos.',
    url: 'https://web-rho-gules-89.vercel.app/maps',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interactive Spatial Cadastral GIS & Maps | BHOOMITRA',
    description:
      'High-resolution multi-tier cadastral map viewer with SVAMITVA village boundaries, Bhu-Aadhaar parcel polygons, and drone orthophotos.',
  },
};

export default function MapsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
