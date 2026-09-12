'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  FileText,
  Calendar,
  Download,
  ShieldCheck,
  Building,
  Scale,
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

interface PolicyDetail {
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
  jurisdiction_code?: string;
  jurisdiction?: string;
  lifecycle_status?: string;
  legal_basis?: string;
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

// Fallback seed policies
const SEED_POLICIES: Record<string, Partial<PolicyDetail>> = {
  'pol-001': {
    id: 'pol-001',
    title: 'Digital Cadastral Survey & Real-Time Mutation Mandate 2026',
    abstract:
      'Mandates all land mutation records to be authenticated against PostGIS spatial boundary polygons before deed registration. Requires certified government surveyors to submit cryptographically signed boundary coordinates within 48 hours of mutation.',
    jurisdiction_code: 'IN-MH',
    lifecycle_status: 'active',
    legal_basis: 'Maharashtra Land Revenue Code, Sec. 148',
    created_at: '2026-01-01T00:00:00Z',
    is_demo: true,
  },
  'pol-002': {
    id: 'pol-002',
    title: 'Urban Land Ceiling & Communal Green Space Demarcation Act',
    abstract:
      'Standardizes geospatial zoning restrictions and customary waterbody protection zones in metropolitan cadastre. Implements strict polygon boundary checks against encroachment in public parks and wetlands.',
    jurisdiction_code: 'IN-KA',
    lifecycle_status: 'active',
    legal_basis: 'Karnataka Land Reforms Act 1961',
    created_at: '2025-09-15T00:00:00Z',
    is_demo: true,
  },
  'pol-003': {
    id: 'pol-003',
    title: 'Integrated Forest Rights & Tribal Tenure Digital Titling Policy',
    abstract:
      'Guidelines for community GPS boundary surveys and community tenure certificate issuance. Establishes protocols for mapping communal ancestral land and verifying claims under the Forest Rights Act.',
    jurisdiction_code: 'IN-AP',
    lifecycle_status: 'consultation',
    legal_basis: 'Scheduled Tribes and Other Traditional Forest Dwellers Act 2006',
    created_at: '2026-02-10T00:00:00Z',
    is_demo: true,
  },
};

export default function PolicyDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [policy, setPolicy] = useState<PolicyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const baseUrl = env.apiUrl.replace(/\/$/, '');

    async function fetchPolicy() {
      try {
        // Try /policies/{id} first, fallback to /resources/{id}
        let res = await fetch(`${baseUrl}/policies/${id}`);
        if (!res.ok) {
          res = await fetch(`${baseUrl}/resources/${id}`);
        }
        if (!res.ok) {
          res = await fetch(`${baseUrl}/documents/${id}`);
        }

        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setPolicy(data);
            setIsLoading(false);
            return;
          }
        }

        // Check fallback seed policies
        if (SEED_POLICIES[id]) {
          if (isMounted) {
            const seed = SEED_POLICIES[id];
            setPolicy({
              id: seed.id || id,
              title: seed.title || 'Statutory Land Policy',
              slug: id,
              abstract: seed.abstract || '',
              resource_type: 'policy',
              status: 'published',
              visibility: 'public',
              created_at: seed.created_at || new Date().toISOString(),
              is_demo: true,
              jurisdiction_code: seed.jurisdiction_code || 'IN-MH',
              lifecycle_status: seed.lifecycle_status || 'active',
              legal_basis: seed.legal_basis || 'Jurisdictional Land Revenue Act',
              file: {
                filename: `${id}-enactment.pdf`,
                download_url: `${baseUrl}/resources/${id}/download`,
                mime_type: 'application/pdf',
                size_bytes: 58200,
                checksum_sha256: '9f83c605d4c82b3e925b99f2a07a1c3d5e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b',
              },
            });
            setIsLoading(false);
            return;
          }
        }

        throw new Error(`Policy document with ID "${id}" was not found.`);
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Could not load policy details.');
          setIsLoading(false);
        }
      }
    }

    fetchPolicy();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link Copied',
        description: 'Permanent policy URL copied to clipboard.',
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
            <Skeleton className="h-6 w-28 rounded-md" />
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

  if (error || !policy) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="p-8 bg-white rounded-2xl border border-rose-200 text-center space-y-4 shadow-sm">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h1 className="text-xl font-bold text-slate-900">Policy Document Not Found</h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            {error || 'The requested statutory policy could not be retrieved from the decentralized registry.'}
          </p>
          <div className="pt-2">
            <Link
              href="/policies"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Policies Registry
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const baseUrl = env.apiUrl.replace(/\/$/, '');
  const downloadUrl =
    policy.file?.download_url
      ? policy.file.download_url.startsWith('http')
        ? policy.file.download_url
        : `${baseUrl}${policy.file.download_url.startsWith('/') ? '' : '/'}${policy.file.download_url}`
      : `${baseUrl}/resources/${policy.id}/download`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Navigation Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/policies" className="hover:text-emerald-700 transition-colors">
          Policies Registry
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold truncate max-w-xs">{policy.title}</span>
      </nav>

      {/* Main Policy Header Card */}
      <article className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        {/* Badges & Jurisdiction */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Scale className="w-3.5 h-3.5" /> Statutory Policy
            </span>
            <Badge variant={policy.lifecycle_status === 'active' ? 'success' : 'outline'}>
              {policy.lifecycle_status === 'active' ? 'Enacted & Active' : policy.lifecycle_status || 'Under Review'}
            </Badge>
            {policy.jurisdiction_code && (
              <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                Jurisdiction: {policy.jurisdiction_code}
              </span>
            )}
            {policy.is_demo ? (
              <Badge variant="outline" className="text-[10px] text-amber-800 bg-amber-50/70 border-amber-200">
                Synthetic Policy (Demo)
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] text-emerald-800 bg-emerald-50/70 border-emerald-200 font-medium">
                Official Revenue Record
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
              {new Date(policy.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Title & Authority */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {policy.title}
          </h1>
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-slate-400" />
            <span>Issuing Authority: Jurisdictional State Revenue & Cadastral Administration</span>
          </p>
          {policy.legal_basis && (
            <p className="text-xs font-semibold text-emerald-800">
              Statutory Basis: {policy.legal_basis}
            </p>
          )}
        </div>

        {/* Executive Summary / Scope */}
        <div className="space-y-2 pt-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Enactment Summary & Regulatory Scope
          </h2>
          <div className="p-4 sm:p-5 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {policy.abstract}
          </div>
        </div>

        {/* Prominent File Attachment & Download Card */}
        <section aria-labelledby="attachment-heading" className="space-y-3 pt-2">
          <h2 id="attachment-heading" className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Statutory Enactment Document & Certified Binary
          </h2>

          <div className="p-5 bg-emerald-50/50 rounded-2xl border-2 border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="font-bold text-slate-900 text-sm break-all">
                  {policy.file?.filename || `${policy.slug || 'policy'}.pdf`}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono uppercase text-emerald-800 font-semibold">
                    {policy.file?.mime_type || 'application/pdf'}
                  </span>
                  {policy.file?.size_bytes ? (
                    <span>• {(policy.file.size_bytes / 1024).toFixed(1)} KB</span>
                  ) : null}
                  <span>• Certified Gazette Text</span>
                </div>
                {policy.file?.checksum_sha256 && (
                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1 break-all">
                    <Hash className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>SHA-256: {policy.file.checksum_sha256}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Clearly Visible Download Button */}
            <a
              href={downloadUrl}
              download={policy.file?.filename || `${policy.slug}.pdf`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-colors w-full sm:w-auto text-sm shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <Download className="w-4 h-4" />
              Download Policy PDF
            </a>
          </div>
        </section>

        {/* Provenance & Ledger Notice */}
        <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Append-Only Provenance Ledger Entry
          </div>
          <p className="leading-relaxed text-[11px] text-slate-500">
            Registered with canonical UUID <code className="font-mono text-slate-700">{policy.id}</code>. 
            All cadastral boundary definitions and statutory tenures referencing this policy mandate are recorded in an append-only provenance graph.
          </p>
        </div>
      </article>

      {/* Back to List Button */}
      <div className="pt-2">
        <Link
          href="/policies"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Return to Policies Registry
        </Link>
      </div>
    </div>
  );
}
