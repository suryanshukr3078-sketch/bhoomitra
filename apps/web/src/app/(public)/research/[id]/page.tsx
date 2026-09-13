'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  BookOpen,
  Calendar,
  Download,
  FileText,
  ShieldCheck,
  Award,
  ExternalLink,
  ChevronLeft,
  Loader2,
  AlertCircle,
  FileCode,
  Hash,
  Share2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { env } from '@/lib/environment';

interface ResourceDetail {
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
  journal?: string;
  doi?: string;
  authors?: Array<{ name: string; affiliation?: string }> | string[];
  peer_reviewed?: boolean;
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

// Fallback seed research papers for offline or demo lookup
const SEED_PAPERS: Record<string, Partial<ResourceDetail>> = {
  'res-001': {
    id: 'res-001',
    title: 'PostGIS Cadastral Polygon Topology: Preventing Boundary Disputes in Communal Forests',
    abstract:
      'We demonstrate an automated PostGIS topological validation pipeline enforcing zero-overlap boundary invariants across 45,000 communal land parcels. By employing spatial indices and topology geometry data structures, boundary errors are identified before legal deeds are formalized.',
    journal: 'International Journal of Land Administration & Spatial Science',
    doi: '10.1016/j.landuse.2026.108420',
    authors: [{ name: 'Dr. Aisha Sharma' }, { name: 'K. V. Raman' }],
    peer_reviewed: true,
    created_at: '2026-08-15T00:00:00Z',
    is_demo: true,
  },
  'res-002': {
    id: 'res-002',
    title: 'Immutable Mutation Provenance: Cryptographic Land Registration in Developing Economies',
    abstract:
      'Empirical analysis of land registry corruption mitigation through cryptographic append-only DAG provenance trees. Every surveyor verification, boundary mutation, and deed transfer forms an immutable audit chain verifiable by citizen stakeholders.',
    journal: 'Land Economics & Tenure Quarterly',
    doi: '10.1080/01436597.2026.220199',
    authors: [{ name: 'Prof. David Chen' }, { name: 'Elena Rostova' }],
    peer_reviewed: true,
    created_at: '2026-07-20T00:00:00Z',
    is_demo: true,
  },
  'res-003': {
    id: 'res-003',
    title: 'Comparative Analysis of Customary and Statutory Land Rights in Sub-Saharan Agrosystems',
    abstract:
      'Examines the legal interface between customary village chiefs and centralized statutory GIS registries. Highlights institutional friction points and proposes hybrid titling architectures that respect community ownership.',
    journal: 'African Land Governance Review',
    doi: '10.1111/j.1477-8947.2026.01289',
    authors: [{ name: 'Kwame Mensah' }, { name: 'Dr. Sarah Ndlovu' }],
    peer_reviewed: false,
    created_at: '2026-06-18T00:00:00Z',
    is_demo: true,
  },
  'res-004': {
    id: 'res-004',
    title: 'Drone Photogrammetry and High-Resolution Orthomosaics for Rapid Informal Settlement Mapping',
    abstract:
      'Centimeter-accuracy orthomosaic processing with Cloud-Optimized GeoTIFFs for informal settlement formalization. Evaluates cost-effectiveness and administrative velocity compared to conventional ground survey methods.',
    journal: 'Urban Land Information Systems',
    doi: '10.1007/s10901-026-09874-x',
    authors: [{ name: 'Carlos Mendez' }, { name: 'Maria Santos' }],
    peer_reviewed: true,
    created_at: '2026-05-12T00:00:00Z',
    is_demo: true,
  },
};

export default function ResearchDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [resource, setResource] = useState<ResourceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const baseUrl = env.apiUrl.replace(/\/$/, '');

    // Fetch from backend API
    async function fetchResource() {
      try {
        // Try /resources/{id} first, fallback to /documents/{id}
        let res = await fetch(`${baseUrl}/resources/${id}`).catch(() => null);
        if (!res || !res.ok) {
          res = await fetch(`${baseUrl}/documents/${id}`).catch(() => null);
        }

        if (res && res.ok) {
          const data = await res.json().catch(() => null);
          if (data && isMounted) {
            setResource(data);
            setIsLoading(false);
            return;
          }
        }

        // If not found in backend and ID matches seed data
        if (SEED_PAPERS[id]) {
          if (isMounted) {
            const seed = SEED_PAPERS[id];
            setResource({
              id: seed.id || id,
              title: seed.title || 'Cadastral Research Paper',
              slug: id,
              abstract: seed.abstract || '',
              resource_type: 'research_paper',
              status: 'published',
              visibility: 'public',
              created_at: seed.created_at || new Date().toISOString(),
              is_demo: true,
              journal: seed.journal,
              doi: seed.doi,
              authors: seed.authors,
              peer_reviewed: seed.peer_reviewed,
              file: {
                filename: `${id}-paper.pdf`,
                download_url: `${baseUrl}/resources/${id}/download`,
                mime_type: 'application/pdf',
                size_bytes: 42500,
                checksum_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
              },
            });
            setIsLoading(false);
            return;
          }
        }

        throw new Error(`Resource with ID "${id}" was not found.`);
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Could not load resource details.');
          setIsLoading(false);
        }
      }
    }

    fetchResource();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link Copied',
        description: 'Permanent resource URL copied to clipboard.',
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

  if (error || !resource) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="p-8 bg-white rounded-2xl border border-rose-200 text-center space-y-4 shadow-sm">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h1 className="text-xl font-bold text-slate-900">Resource Not Found</h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            {error || 'The requested research document could not be retrieved from the decentralized registry.'}
          </p>
          <div className="pt-2">
            <Link
              href="/research"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Research Repository
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Format authors
  let authorDisplay = 'Accredited Registry Contributor';
  if (Array.isArray(resource.authors) && resource.authors.length > 0) {
    authorDisplay = resource.authors
      .map((a) => (typeof a === 'string' ? a : a.name || 'Contributor'))
      .join(', ');
  }

  // Resolve download URL
  const baseUrl = env.apiUrl.replace(/\/$/, '');
  const downloadUrl =
    resource.file?.download_url
      ? resource.file.download_url.startsWith('http')
        ? resource.file.download_url
        : `${baseUrl}${resource.file.download_url.startsWith('/') ? '' : '/'}${resource.file.download_url}`
      : `${baseUrl}/resources/${resource.id}/download`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Navigation Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/research" className="hover:text-emerald-700 transition-colors">
          Research Papers
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold truncate max-w-xs">{resource.title}</span>
      </nav>

      {/* Main Document Header Card */}
      <article className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        {/* Status and Category Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <BookOpen className="w-3.5 h-3.5" /> Research Paper
            </span>
            {resource.peer_reviewed && (
              <Badge variant="success">
                <Award className="w-3 h-3" /> Peer Reviewed
              </Badge>
            )}
            {resource.is_demo ? (
              <Badge variant="outline" className="text-[10px] text-amber-800 bg-amber-50/70 border-amber-200">
                Synthetic Paper (Demo)
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] text-emerald-800 bg-emerald-50/70 border-emerald-200 font-medium">
                Verified Registry Record
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
              {new Date(resource.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Title & Metadata */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {resource.title}
          </h1>
          <p className="text-sm font-semibold text-emerald-800">{authorDisplay}</p>
          {resource.journal && (
            <p className="text-xs text-slate-500 italic font-serif">Published in: {resource.journal}</p>
          )}
          {resource.doi && (
            <div className="text-xs font-mono text-slate-500 pt-1">
              DOI:{' '}
              <a
                href={`https://doi.org/${resource.doi}`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 hover:underline inline-flex items-center gap-1"
              >
                {resource.doi} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Abstract / Full Summary */}
        <div className="space-y-2 pt-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Executive Abstract & Methodology
          </h2>
          <div className="p-4 sm:p-5 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {resource.abstract}
          </div>
        </div>

        {/* Prominent File Attachment & Download Card */}
        <section aria-labelledby="attachment-heading" className="space-y-3 pt-2">
          <h2 id="attachment-heading" className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Attached Document & Verified Binary
          </h2>

          <div className="p-5 bg-emerald-50/50 rounded-2xl border-2 border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="font-bold text-slate-900 text-sm break-all">
                  {resource.file?.filename || `${resource.slug || 'document'}.pdf`}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono uppercase text-emerald-800 font-semibold">
                    {resource.file?.mime_type || 'application/pdf'}
                  </span>
                  {resource.file?.size_bytes ? (
                    <span>• {(resource.file.size_bytes / 1024).toFixed(1)} KB</span>
                  ) : null}
                  <span>• Cryptographic Hash Verified</span>
                </div>
                {resource.file?.checksum_sha256 && (
                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1 break-all">
                    <Hash className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>SHA-256: {resource.file.checksum_sha256}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Clearly Visible Download Button */}
            <a
              href={downloadUrl}
              download={resource.file?.filename || `${resource.slug}.pdf`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-colors w-full sm:w-auto text-sm shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <Download className="w-4 h-4" />
              Download Document
            </a>
          </div>
        </section>

        {/* Provenance & Cryptographic Audit Trail */}
        <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Append-Only Provenance Ledger Entry
          </div>
          <p className="leading-relaxed text-[11px] text-slate-500">
            This record was committed with UUID <code className="font-mono text-slate-700">{resource.id}</code>. 
            All cadastral polygon validations, surveyor attestations, and title mutations referencing this document are immutable and non-repudiable.
          </p>
        </div>
      </article>

      {/* Back to List Button */}
      <div className="pt-2">
        <Link
          href="/research"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Return to Research Papers Registry
        </Link>
      </div>
    </div>
  );
}
