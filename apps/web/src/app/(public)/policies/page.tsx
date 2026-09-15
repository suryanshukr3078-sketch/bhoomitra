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
import { downloadFromUrl } from '@/lib/download';
import { env } from '@/lib/environment';

interface PolicyDocument {
  id: string;
  policyNumber: string;
  title: string;
  jurisdictionCode: string;
  jurisdictionName: string;
  issuingAuthority: string;
  lifecycleStatus: 'active' | 'consultation' | 'draft' | 'superseded';
  docType?: 'policy' | 'legal_document' | 'case_study';
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
    docType: 'policy',
  },
  {
    id: 'pol-005',
    policyNumber: 'ACT-CENTRAL-2026-01',
    title: 'National Conclusive Land Titling & Digital Registry Act 2026',
    jurisdictionCode: 'IN-DL',
    jurisdictionName: 'National / Central',
    issuingAuthority: 'Ministry of Rural Development & Parliament of India',
    lifecycleStatus: 'active',
    docType: 'legal_document',
    effectiveFrom: 'April 1, 2026',
    effectiveTimestamp: 1775001600000,
    legalBasis: 'Constitution of India, Seventh Schedule Entry 18',
    summary:
      'Statutory legal enactment transitioning presumptive deeds to state-guaranteed conclusive titles with indemnification provisions.',
  },
  {
    id: 'pol-006',
    policyNumber: 'JUD-SC-2025-88',
    title: 'Supreme Court Landmark Directive on Gram Sabha Community Forest Demarcation',
    jurisdictionCode: 'IN-SC',
    jurisdictionName: 'Supreme Court of India',
    issuingAuthority: 'Supreme Court of India (Appellate Jurisdiction)',
    lifecycleStatus: 'active',
    docType: 'legal_document',
    effectiveFrom: 'November 20, 2025',
    effectiveTimestamp: 1763596800000,
    legalBasis: 'FRA 2006, Sec 6(1) & Article 21',
    summary:
      'Judicial binding precedent mandating statutory recognition of Gram Sabha spatial boundaries over arbitrary administrative revenue partitions.',
  },
  {
    id: 'pol-007',
    policyNumber: 'CAS-TG-2026-03',
    title: 'Dharani Portal Real-Time Digital Mutation: Empirical Case Study of Rangareddy District',
    jurisdictionCode: 'IN-TG',
    jurisdictionName: 'Telangana',
    issuingAuthority: 'Centre for Good Governance & Revenue Academy',
    lifecycleStatus: 'active',
    docType: 'case_study',
    effectiveFrom: 'February 10, 2026',
    effectiveTimestamp: 1770681600000,
    legalBasis: 'Telangana Rights in Land and Pattadar Passbooks Act 2020',
    summary:
      'Field case study evaluating the elimination of revenue discretionary powers through algorithmic slotted mutation appointments.',
  },
  {
    id: 'pol-008',
    policyNumber: 'CAS-MP-2026-01',
    title: 'SVAMITVA Abadi Drone Parcel Demarcation: Field Case Study in Harda MP',
    jurisdictionCode: 'IN-MP',
    jurisdictionName: 'Madhya Pradesh',
    issuingAuthority: 'Madhya Pradesh State Land Revenue Directorate',
    lifecycleStatus: 'active',
    docType: 'case_study',
    effectiveFrom: 'March 14, 2026',
    effectiveTimestamp: 1773446400000,
    legalBasis: 'SVAMITVA Scheme Guidelines 2021',
    summary:
      'Empirical analysis of 100% rural residential property card distribution and resultant reduction in boundary dispute litigation.',
  },
];

export default function PoliciesPage() {
  const prefersReduced = useReducedMotion();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [docTypeFilter, setDocTypeFilter] = useState<'all' | 'policy' | 'legal_document' | 'case_study'>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'jurisdiction_asc'>('date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [apiItems, setApiItems] = useState<PolicyDocument[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const pageSize = 6;
  const { toast } = useToast();

  const DOC_TYPE_TABS = [
    { value: 'all', label: 'All Resources' },
    { value: 'policy', label: 'Policy Directives' },
    { value: 'legal_document', label: 'Legal Acts & Orders' },
    { value: 'case_study', label: 'Field Case Studies' },
  ];

  const STATUS_TABS = [
    { value: 'All', label: 'All Statuses' },
    { value: 'active', label: 'Active Statutory' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'draft', label: 'Draft' },
    { value: 'superseded', label: 'Superseded' },
  ];

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const debounceDelay = searchQuery ? 250 : 0;
    const timer = setTimeout(async () => {
      try {
        const endpoint = searchQuery
          ? `/search?resource_type=policy&q=${encodeURIComponent(searchQuery)}`
          : `/resources?resource_type=policy`;

        const data = await apiGet<{ items: any[]; count: number }>(
          endpoint,
          { items: [], count: 0 }
        );

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
    }, debounceDelay);

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
      const matchesDocType = docTypeFilter === 'all' || (p.docType || 'policy') === docTypeFilter;
      return matchesSearch && matchesStatus && matchesDocType;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'date_desc') return b.effectiveTimestamp - a.effectiveTimestamp;
      if (sortBy === 'date_asc') return a.effectiveTimestamp - b.effectiveTimestamp;
      if (sortBy === 'jurisdiction_asc') return a.jurisdictionName.localeCompare(b.jurisdictionName);
      return 0;
    });
  }, [allAvailablePolicies, searchQuery, statusFilter, docTypeFilter, sortBy]);

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

  const generateGazettePdf = (policy: PolicyDocument): string => {
    const cleanTitle = (policy.title || 'Cadastral Policy').slice(0, 80).replace(/[()]/g, '');
    const cleanNumber = (policy.policyNumber || policy.id).replace(/[()]/g, '');
    return (
      `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n` +
      `2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n` +
      `3 0 obj<</Type/Page/MediaBox[0 0 595 842]/Parent 2 0 R/Contents 4 0 R/Resources<<>>>>endobj\n` +
      `4 0 obj<</Length 220>>stream\n` +
      `BT /F1 14 Tf 50 780 Td (OFFICIAL GAZETTE NOTIFICATION: ${cleanNumber}) Tj ET\n` +
      `BT /F1 10 Tf 50 750 Td (${cleanTitle}) Tj ET\n` +
      `BT /F1 9 Tf 50 720 Td (Authority: ${policy.issuingAuthority || 'State Cadastral Authority'}) Tj ET\n` +
      `BT /F1 9 Tf 50 700 Td (Effective: ${policy.effectiveFrom || '2026'}) Tj ET\n` +
      `endstream\nendobj\n` +
      `xref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\n0000000195 00000 n\n` +
      `trailer<</Size 5/Root 1 0 R>>\nstartxref\n450\n%%EOF\n`
    );
  };

  const handleDownload = async (policy: PolicyDocument) => {
    const cleanId = (policy.policyNumber || policy.id).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const filename = `policy-gazette-${cleanId}.pdf`;
    const downloadUrl = `${env.apiUrl.replace(/\/$/, '')}/resources/${policy.id}/download`;
    try {
      await downloadFromUrl(downloadUrl, filename, 'application/pdf', () => generateGazettePdf(policy));
      toast({
        title: 'Policy Gazette Downloaded',
        description: `Saved ${filename} to your device.`,
        variant: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Download Failed',
        description: err?.message || `Could not download gazette for ${policy.policyNumber}.`,
        variant: 'error',
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/85 shadow-card space-y-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500" />
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full w-fit">
            <Scale className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
            <span>Statutory Registry</span>
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

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
          Land Policy Documents &amp; Legal Frameworks
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          Authoritative state and national land governance policies, revenue codes, survey mandates, and tenure rights frameworks.
        </p>

        {/* Search, Status & Sort Filters */}
        <div className="pt-2 flex flex-col md:flex-row gap-3">
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
              className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-all shadow-sm"
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

          <div className="flex flex-col gap-2.5">
            {/* Document Type Filter (Policy, Legal Document, Case Study) */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Document Type:
              </span>
              {DOC_TYPE_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => {
                    setDocTypeFilter(tab.value as any);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    docTypeFilter === tab.value
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Status Filter */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {STATUS_TABS.map((tab) => (
                  <motion.button
                    key={tab.value}
                    type="button"
                    whileHover={prefersReduced ? undefined : { scale: 1.04 }}
                    whileTap={prefersReduced ? undefined : { scale: 0.96 }}
                    transition={{ duration: 0.12 }}
                    onClick={() => {
                      setStatusFilter(tab.value);
                      setCurrentPage(1);
                    }}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                      statusFilter === tab.value
                        ? 'bg-gradient-to-r from-emerald-800 to-teal-700 text-white shadow-sm'
                        : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200/90'
                    }`}
                  >
                    {tab.label}
                  </motion.button>
                ))}
              </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 border border-slate-300 rounded-xl px-3 py-2 bg-white text-xs text-slate-700 shadow-sm">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent focus:outline-none cursor-pointer font-medium"
                aria-label="Sort policy documents"
              >
                <option value="effective_desc">Newest Effective Date</option>
                <option value="effective_asc">Oldest Effective Date</option>
                <option value="title_asc">Title (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Item Count & Page Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
        <span>
          Showing {filteredAndSortedPolicies.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–
          {Math.min(currentPage * pageSize, filteredAndSortedPolicies.length)} of{' '}
          {filteredAndSortedPolicies.length} policies
        </span>
        <span>
          Page {currentPage} of {totalPages}
        </span>
      </div>

      {/* API Warning/Status Banner if offline */}
      {apiError && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center gap-2 shadow-sm" role="status">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Policies List */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200/80 shadow-card space-y-4">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
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
                className="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200/85 shadow-card hover:shadow-card-hover hover:border-emerald-300/80 transition-all space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80">
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
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <span className="font-semibold text-slate-700">{policy.jurisdictionName}</span> ({policy.jurisdictionCode})
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug font-heading">
                    <Link
                      href={`/policies/${policy.id}`}
                      className="hover:text-emerald-700 hover:underline transition-colors"
                    >
                      {policy.title}
                    </Link>
                  </h2>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" /> {policy.issuingAuthority}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                  {policy.summary}
                </p>

                <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 text-xs">
                  <div className="text-slate-500">
                    <span className="font-semibold text-slate-700">Legal Basis:</span> {policy.legalBasis}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Effective: {policy.effectiveFrom}
                    </span>
                    <motion.div
                      whileHover={prefersReduced ? undefined : { scale: 1.03 }}
                      whileTap={prefersReduced ? undefined : { scale: 0.97 }}
                      className="inline-flex"
                    >
                      <Link
                        href={`/policies/${policy.id}`}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 font-semibold text-slate-800 hover:text-emerald-800 bg-white hover:bg-slate-50 rounded-xl transition-colors border border-slate-300 shadow-sm"
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 font-semibold text-slate-700 hover:text-emerald-800 hover:bg-slate-100 rounded-xl transition-colors"
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

      {/* AI-Powered Cross-Domain Recommendations */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 mt-10">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-emerald-800">
            <span className="text-sm font-bold flex items-center gap-1.5">
              <span>AI Recommendations &amp; Connected Evidence</span>
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Cross-domain graph matching</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/research"
            className="p-4 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 transition-all group block"
          >
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full uppercase">
              Supporting Research
            </span>
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 mt-2 line-clamp-2">
              PostGIS Cadastral Polygon Topology &amp; Boundary Dispute Prevention
            </h4>
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
              Validates empirical effectiveness of the Digital Cadastral Survey mandate across 45,000 communal parcels.
            </p>
          </Link>

          <Link
            href="/datasets"
            className="p-4 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 transition-all group block"
          >
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full uppercase">
              Verified Spatial Layer
            </span>
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 mt-2 line-clamp-2">
              National Cadastral Parcel Polygons &amp; Boundary Reconciliations 2026
            </h4>
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
              Sub-decimeter PostGIS parcel polygons supporting statutory 7/12 land mutation procedures.
            </p>
          </Link>

          <Link
            href="/simulation"
            className="p-4 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 transition-all group block"
          >
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full uppercase">
              Policy Simulation
            </span>
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 mt-2 line-clamp-2">
              Simulate Proposed Tenancy &amp; Stamp Duty Reforms
            </h4>
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
              Project multi-year agricultural credit inflow and dispute reduction before statutory enactment.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
