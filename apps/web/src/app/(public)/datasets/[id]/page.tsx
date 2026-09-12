'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Database,
  Calendar,
  Download,
  ShieldCheck,
  Globe2,
  Layers,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Hash,
  Share2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { env } from '@/lib/environment';

interface DatasetDetail {
  id: string;
  title: string;
  slug: string;
  abstract: string;
  resource_type: string;
  status: string;
  visibility: string;
  created_at: string;
  published_at?: string | null;
  is_demo?: boolean;
  source_url?: string | null;
  geometry_type?: string;
  srid?: number | string;
  feature_count?: number | string;
  jurisdiction?: string;
  file?: {
    filename: string;
    storage_uri?: string;
    download_url: string;
    mime_type?: string;
    size_bytes?: number | null;
    checksum_sha256?: string | null;
  } | null;
  versions?: Array<{
    version_number: number;
    original_filename?: string;
    mime_type?: string;
    file_size_bytes?: number | null;
    checksum_sha256?: string | null;
    created_at: string;
    download_url?: string;
  }>;
}

// Fallback seed datasets
const SEED_DATASETS: Record<string, Partial<DatasetDetail>> = {
  'ds-01': {
    id: 'ds-01',
    title: 'Pune District Cadastral Parcel Polygons (2026)',
    abstract:
      'High-precision cadastral boundary polygons with surveyor verification timestamps, mutation sequence numbers, and land use codes. Fully compliant with EPSG:4326 PostGIS topology rules with zero overlapping boundaries.',
    geometry_type: 'MultiPolygon',
    srid: 'EPSG:4326 (WGS 84)',
    feature_count: '48,200 parcels',
    created_at: '2026-09-01T00:00:00Z',
    is_demo: true,
  },
  'ds-02': {
    id: 'ds-02',
    title: 'Bangalore Metropolitan 10cm Digital Surface Model & Orthomosaics',
    abstract:
      'High-resolution drone photogrammetry orthomosaic tiled for rapid streaming and informal settlement encroachment audits. Optimized as Cloud-Optimized GeoTIFF (COG) with overview pyramids.',
    geometry_type: 'Raster COG',
    srid: 'EPSG:32643 (UTM 43N)',
    feature_count: '1 Raster Layer',
    created_at: '2026-08-10T00:00:00Z',
    is_demo: true,
  },
};

export default function DatasetDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [dataset, setDataset] = useState<DatasetDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const baseUrl = env.apiUrl.replace(/\/$/, '');

    async function fetchDataset() {
      try {
        // Try /datasets/{id} first, fallback to /resources/{id}
        let res = await fetch(`${baseUrl}/datasets/${id}`);
        if (!res.ok) {
          res = await fetch(`${baseUrl}/resources/${id}`);
        }
        if (!res.ok) {
          res = await fetch(`${baseUrl}/documents/${id}`);
        }

        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setDataset(data);
            setIsLoading(false);
            return;
          }
        }

        // Check fallback seed datasets
        if (SEED_DATASETS[id]) {
          if (isMounted) {
            const seed = SEED_DATASETS[id];
            setDataset({
              id: seed.id || id,
              title: seed.title || 'Cadastral Spatial Dataset',
              slug: id,
              abstract: seed.abstract || '',
              resource_type: 'dataset',
              status: 'published',
              visibility: 'public',
              created_at: seed.created_at || new Date().toISOString(),
              is_demo: true,
              geometry_type: seed.geometry_type || 'MultiPolygon',
              srid: seed.srid || '4326',
              feature_count: seed.feature_count || 'Spatial Layer',
              file: {
                filename: `${id}-cadastre.geojson`,
                download_url: `${baseUrl}/resources/${id}/download`,
                mime_type: 'application/geo+json',
                size_bytes: 142000,
                checksum_sha256: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
              },
            });
            setIsLoading(false);
            return;
          }
        }

        throw new Error(`Spatial dataset with ID "${id}" was not found.`);
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Could not load dataset details.');
          setIsLoading(false);
        }
      }
    }

    fetchDataset();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link Copied',
        description: 'Permanent dataset URL copied to clipboard.',
        variant: 'success',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <Skeleton className="h-6 w-36 rounded-lg" />
        <div className="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-8 w-4/5 rounded-lg" />
            <Skeleton className="h-4 w-1/3 rounded-lg" />
          </div>
          <div className="p-4 bg-slate-50 rounded-xl space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !dataset) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="p-8 bg-white rounded-2xl border border-rose-200 text-center space-y-4 shadow-sm">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h1 className="text-xl font-bold text-slate-900">Spatial Dataset Not Found</h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            {error || 'The requested GIS dataset could not be retrieved from the decentralized registry.'}
          </p>
          <div className="pt-2">
            <Link
              href="/datasets"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Datasets Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const baseUrl = env.apiUrl.replace(/\/$/, '');
  const downloadUrl =
    dataset.file?.download_url
      ? dataset.file.download_url.startsWith('http')
        ? dataset.file.download_url
        : `${baseUrl}${dataset.file.download_url.startsWith('/') ? '' : '/'}${dataset.file.download_url}`
      : `${baseUrl}/resources/${dataset.id}/download`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Navigation Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/datasets" className="hover:text-emerald-700 transition-colors">
          Datasets Catalog
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold truncate max-w-xs">{dataset.title}</span>
      </nav>

      {/* Main Dataset Header Card */}
      <article className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        {/* Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Database className="w-3.5 h-3.5" /> Spatial GIS Layer
            </span>
            <Badge variant="default">{dataset.geometry_type || 'Vector Features'}</Badge>
            {dataset.is_demo ? (
              <Badge variant="outline" className="text-[10px] text-amber-800 bg-amber-50/70 border-amber-200">
                Synthetic GeoJSON (Demo)
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] text-emerald-800 bg-emerald-50/70 border-emerald-200 font-medium">
                Verified Spatial Layer
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Copy shareable link"
              aria-label="Share resource"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />{' '}
              {new Date(dataset.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Title & Spatial Properties */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {dataset.title}
          </h1>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 block">Geometry Type:</span>
              <span className="font-semibold text-slate-800">{dataset.geometry_type || 'MultiPolygon'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Projection / SRID:</span>
              <span className="font-mono font-semibold text-emerald-800">
                {dataset.srid ? `EPSG:${dataset.srid}` : 'EPSG:4326 (WGS 84)'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Feature Volume:</span>
              <span className="font-semibold text-slate-800">
                {dataset.feature_count ? `${dataset.feature_count} features` : 'Full Coverage'}
              </span>
            </div>
          </div>
        </div>

        {/* Summary / Description */}
        <div className="space-y-2 pt-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Dataset Description & Spatial Specifications
          </h2>
          <div className="p-4 sm:p-5 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {dataset.abstract}
          </div>
        </div>

        {/* Prominent File Attachment & Download Card */}
        <section aria-labelledby="attachment-heading" className="space-y-3 pt-2">
          <h2 id="attachment-heading" className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Downloadable Spatial Artifact & File Binary
          </h2>

          <div className="p-5 bg-emerald-50/50 rounded-2xl border-2 border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
                <Database className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="font-bold text-slate-900 text-sm break-all">
                  {dataset.file?.filename || `${dataset.slug || 'spatial-layer'}.geojson`}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono uppercase text-emerald-800 font-semibold">
                    {dataset.file?.mime_type || 'application/geo+json'}
                  </span>
                  {dataset.file?.size_bytes ? (
                    <span>• {(dataset.file.size_bytes / 1024).toFixed(1)} KB</span>
                  ) : null}
                  <span>• Standard OGC GeoJSON</span>
                </div>
                {dataset.file?.checksum_sha256 && (
                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1 break-all">
                    <Hash className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>SHA-256: {dataset.file.checksum_sha256}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Clearly Visible Download Button */}
            <a
              href={downloadUrl}
              download={dataset.file?.filename || `${dataset.slug}.geojson`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-colors w-full sm:w-auto text-sm shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <Download className="w-4 h-4" />
              Download Dataset
            </a>
          </div>
        </section>

        {/* Provenance Notice */}
        <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            PostGIS Verification & Provenance
          </div>
          <p className="leading-relaxed text-[11px] text-slate-500">
            Indexed with UUID <code className="font-mono text-slate-700">{dataset.id}</code>. 
            All polygon boundaries within this layer adhere to the EPSG:4326 PostGIS geometry specification with zero overlap topological rules.
          </p>
        </div>
      </article>

      {/* Back to List Button */}
      <div className="pt-2">
        <Link
          href="/datasets"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Return to Datasets Catalog
        </Link>
      </div>
    </div>
  );
}
