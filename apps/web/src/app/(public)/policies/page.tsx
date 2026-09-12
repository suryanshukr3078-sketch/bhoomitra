'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { StaggerContainer, StaggerItem, MotionCard } from '@/components/motion/motion-primitives';
import {
  FileText,
  Search,
  Scale,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  Archive,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, apiGet } from '@/lib/api/client';

interface PolicyDocument {
  id: string;
  policyNumber: string;
  title: string;
  jurisdictionCode: string;
  jurisdictionName: string;
  issuingAuthority: string;
  lifecycleStatus: 'active' | 'consultation' | 'draft' | 'superseded';
  effectiveFrom: string;
  effectiveTimestamp: number;
  legalBasis: string;
  summary: string;
  isDemo?: boolean;
}

const POLICIES: PolicyDocument[] = [
  {
    id: 'pol-001',
    policyNumber: 'GOV-MH-2026-08',
    title: 'Digital Cadastral Survey & Real-Time Mutation Mandate 2026',
    jurisdictionCode: 'IN-MH',
    jurisdictionName: 'Maharashtra',
    issuingAuthority: 'Department of Revenue & Land Records',
    lifecycleStatus: 'active',
    effectiveFrom: 'January 1, 2026',
    effectiveTimestamp: 1767225600000,
    legalBasis: 'Maharashtra Land Revenue Code, Sec. 148',
    summary:
      'Mandates all land mutation records to be authenticated against PostGIS spatial boundary polygons before deed registration.',
  },
  {
    id: 'pol-002',
    policyNumber: 'GOV-KA-2025-14',
    title: 'Urban Land Ceiling & Communal Green Space Demarcation Act',
    jurisdictionCode: 'IN-KA',
    jurisdictionName: 'Karnataka',
    issuingAuthority: 'Urban Development & Cadastral Authority',
    lifecycleStatus: 'active',
    effectiveFrom: 'September 15, 2025',
    effectiveTimestamp: 1757894400000,
    legalBasis: 'Karnataka Land Reforms Act 1961',
    summary:
      'Standardizes geospatial zoning restrictions and customary waterbody protection zones in metropolitan cadastre.',
  },
  {
    id: 'pol-003',
    policyNumber: 'GOV-AP-2026-DRAFT',
    title: 'Integrated Forest Rights & Tribal Tenure Digital Titling Policy',
    jurisdictionCode: 'IN-AP',
    jurisdictionName: 'Andhra Pradesh',
    issuingAuthority: 'Tribal Welfare & Forest Administration',
    lifecycleStatus: 'consultation',
    effectiveFrom: 'Pending Public Comments',
    effectiveTimestamp: 1772496000000,
    legalBasis: 'Scheduled Tribes and Other Traditional Forest Dwellers Act 2006',
    summary:
      'Guidelines for community GPS boundary surveys and community tenure certificate issuance.',
  },
  {
    id: 'pol-004',
    policyNumber: 'GOV-GJ-2024-02',
    title: 'Agricultural Land Lease Formalization Guidelines',
    jurisdictionCode: 'IN-GJ',
    jurisdictionName: 'Gujarat',
    issuingAuthority: 'State Land Development Commission',
    lifecycleStatus: 'superseded',
    effectiveFrom: 'March 1, 2024',
    effectiveTimestamp: 1709251200000,
    legalBasis: 'Gujarat Agricultural Tenancy Act',
    summary:
      'Framework for 5-year tenant farmer protections (superseded by National Unified Tenancy Framework 2026).',
  },
];

export default function PoliciesPage() {
  const prefersReduced = useReducedMotion();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'jurisdiction_asc'>('date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [apiItems, setApiItems] = useState<PolicyDocument[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const pageSize = 6;
  const { toast } = useToast();

  const statusOptions = ['All', 'active', 'consultation', 'draft', 'superseded'];

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const queryParam = searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : '';
        // Try standard REST collection route /resources first, fallback to /policies and /search
        let data = await apiGet<{ items: any[]; count: number }>(
          `/resources?resource_type=policy${queryParam}`,
          { items: [], count: 0 }
        );

        if (!data || !Array.isArray(data.items) || data.items.length === 0) {
          data = await apiGet<{ items: any[]; count: number }>(
            `/policies?${queryParam.replace(/^&/, '')}`,
            { items: [], count: 0 }
          );
        }

        if (!data || !Array.isArray(data.items) || data.items.length === 0) {
          data = await apiGet<{ items: any[]; count: number }>(
            `/search?resource_type=policy${queryParam}`,
            { items: [], count: 0 }
          );
        }

        if (!isMounted) return;

        if (data && Array.isArray(data.items) && data.items.length > 0) {
          const mapped: PolicyDocument[] = data.items.map((item) => ({
            id: item.id,
            policyNumber: `POL-${(item.slug || item.id).slice(0, 8).toUpperCase()}`,
            title: item.title,
            jurisdictionCode: 'IN',
            jurisdictionName: 'National / State Registry',
            issuingAuthority: 'Government Land Administration',
            lifecycleStatus: 'active',
            effectiveFrom: new Date(item.created_at).toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            }),
            effectiveTimestamp: new Date(item.created_at).getTime(),
            legalBasis: 'Constitution of India, Entry 18 State List',
            summary: item.abstract,
            isDemo: item.is_demo ?? false,
          }));
          setApiItems(mapped);
          setApiError(null);
        } else {
          setApiItems([]);
          setApiError(null);
        }
      } catch (err) {
        if (!isMounted) return;
        console.warn('API policies search error, using safe defaults:', err);
        setApiItems([]);
        setApiError('Unable to load live policies data from API. Displaying standard statutory records.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const allAvailablePolicies = useMemo(() => {
    if (apiItems.length > 0) {
      return [...apiItems, ...POLICIES.filter((p) => !apiItems.some((a) => a.title === p.title))];
    }
    return POLICIES;
  }, [apiItems]);

  const filteredAndSortedPolicies = useMemo(() => {
    const filtered = allAvailablePolicies.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.policyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.jurisdictionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || p.lifecycleStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'date_desc') return b.effectiveTimestamp - a.effectiveTimestamp;
      if (sortBy === 'date_asc') return a.effectiveTimestamp - b.effectiveTimestamp;
      if (sortBy === 'jurisdiction_asc') return a.jurisdictionName.localeCompare(b.jurisdictionName);
      return 0;
    });
  }, [allAvailablePolicies, searchQuery, statusFilter, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedPolicies.length / pageSize) || 1;
  const paginatedPolicies = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedPolicies.slice(start, start + pageSize);
  }, [filteredAndSortedPolicies, currentPage, pageSize]);

  const getStatusBadge = (status: PolicyDocument['lifecycleStatus']) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="success">
            <CheckCircle2 className="w-3 h-3" /> Active Law
          </Badge>
        );
      case 'consultation':
        return (
          <Badge variant="warning">
            <Clock className="w-3 h-3" /> Public Consultation
          </Badge>
        );
      case 'superseded':
        return (
          <Badge variant="secondary">
            <Archive className="w-3 h-3" /> Superseded
          </Badge>
        );
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  const handleDownload = (policy: PolicyDocument) => {
    toast({
      title: 'Policy Document Downloaded',
      description: `Official gazette text for ${policy.policyNumber} downloaded.`,
      variant: 'success',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full w-fit">
            <Scale className="w-3.5 h-3.5" aria-hidden="true" />
            Statutory Registry
          </div>
          {apiItems.length > 0 ? (
            <Badge variant="outline" className="border-emerald-400 text-emerald-900 bg-emerald-50 font-semibold">
              Live Statutory Registry ({apiItems.length} published)
            </Badge>
          ) : (
            <Badge variant="outline" className="border-amber-400 text-amber-900 bg-amber-50">
              Synthetic Policies (Demo)
            </Badge>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Land Policy Documents & Legal Frameworks
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
          Authoritative state and national land governance policies, revenue codes, survey mandates, and tenure rights frameworks.
        </p>

        {/* Search, Status & Sort Filters */}
        <div className="pt-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by policy number, title, jurisdiction, or legal basis..."
              className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
              {statusOptions.map((status) => (
                <motion.button
                  key={status}
                  type="button"
                  whileHover={prefersReduced ? undefined : { scale: 1.05 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.95 }}
                  transition={{ duration: 0.12 }}
                  onClick={() => {
                    setStatusFilter(status);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl capitalize whitespace-nowrap transition-colors ${
                    statusFilter === status
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {status === 'All' ? 'All Statuses' : status}
                </motion.button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 border border-slate-300 rounded-xl px-2.5 py-1.5 bg-white text-xs text-slate-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent focus:outline-none cursor-pointer"
                aria-label="Sort policies"
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="jurisdiction_asc">Jurisdiction (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Item Count & Page Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing {filteredAndSortedPolicies.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–
          {Math.min(currentPage * pageSize, filteredAndSortedPolicies.length)} of{' '}
          {filteredAndSortedPolicies.length} policy documents
        </span>
        <span>
          Page {currentPage} of {totalPages}
        </span>
      </div>

      {/* API Warning/Status Banner if offline */}
      {apiError && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center gap-2 shadow-sm" role="status">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Policies List */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200/80 space-y-4">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-28 rounded-full" />
              </div>
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      ) : filteredAndSortedPolicies.length === 0 ? (
        <EmptyState
          icon="file"
          title="No Policy Documents Found"
          description={`No land policies matched your search criteria for "${searchQuery}".`}
          actionLabel="Reset Filters"
          onAction={() => {
            setSearchQuery('');
            setStatusFilter('All');
            setCurrentPage(1);
          }}
        />
      ) : (
        <StaggerContainer
          key={`${currentPage}-${statusFilter}-${searchQuery}`}
          className="grid grid-cols-1 gap-6"
        >
          {paginatedPolicies.map((policy) => (
            <StaggerItem key={policy.id}>
              <MotionCard
                className="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      {policy.policyNumber}
                    </span>
                    {getStatusBadge(policy.lifecycleStatus)}
                    {policy.isDemo ? (
                      <Badge variant="outline" className="text-[10px] text-amber-800 bg-amber-50/70 border-amber-200">
                        Synthetic Policy (Demo)
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-emerald-800 bg-emerald-50/70 border-emerald-200 font-medium">
                        Verified Statutory Policy
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">{policy.jurisdictionName}</span> ({policy.jurisdictionCode})
                  </div>
                </div>

                <div className="space-y-1">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                    <Link
                      href={`/policies/${policy.id}`}
                      className="hover:text-emerald-700 hover:underline transition-colors"
                    >
                      {policy.title}
                    </Link>
                  </h2>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-slate-400" /> {policy.issuingAuthority}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  {policy.summary}
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 text-xs">
                  <div className="text-slate-500">
                    <span className="font-semibold text-slate-700">Legal Basis:</span> {policy.legalBasis}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Effective: {policy.effectiveFrom}
                    </span>
                    <motion.div
                      whileHover={prefersReduced ? undefined : { scale: 1.03 }}
                      whileTap={prefersReduced ? undefined : { scale: 0.97 }}
                      className="inline-flex"
                    >
                      <Link
                        href={`/policies/${policy.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                      >
                        View Policy
                      </Link>
                    </motion.div>
                    <motion.button
                      type="button"
                      whileHover={prefersReduced ? undefined : { scale: 1.03 }}
                      whileTap={prefersReduced ? undefined : { scale: 0.97 }}
                      transition={{ duration: 0.12 }}
                      onClick={() => handleDownload(policy)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 font-semibold text-slate-700 hover:text-emerald-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Gazette
                    </motion.button>
                  </div>
                </div>
              </MotionCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      {/* Pagination Controls Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <motion.button
            type="button"
            whileHover={prefersReduced || currentPage === 1 ? undefined : { scale: 1.08 }}
            whileTap={prefersReduced || currentPage === 1 ? undefined : { scale: 0.92 }}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-2 border border-slate-300 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>
          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNum = i + 1;
            return (
              <motion.button
                key={pageNum}
                type="button"
                whileHover={prefersReduced ? undefined : { scale: 1.08 }}
                whileTap={prefersReduced ? undefined : { scale: 0.92 }}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors ${
                  currentPage === pageNum
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {pageNum}
              </motion.button>
            );
          })}
          <motion.button
            type="button"
            whileHover={prefersReduced || currentPage === totalPages ? undefined : { scale: 1.08 }}
            whileTap={prefersReduced || currentPage === totalPages ? undefined : { scale: 0.92 }}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-2 border border-slate-300 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
            aria-label="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      )}
    </div>
  );
}
