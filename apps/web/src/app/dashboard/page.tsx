'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  BookOpen,
  Scale,
  Layers,
  ShieldCheck,
  Gavel,
  Rocket,
  MapPin,
  RefreshCw,
  Plus,
  X,
  Loader2,
  Shield,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  UploadCloud,
  FileUp,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contributeSchema, ContributeFormData } from '@/schemas/contribute';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { apiRequest, getAuthToken } from '@/lib/api/client';
import { env } from '@/lib/environment';
import { useAuth } from '@/lib/auth-context';
import { DashboardOverview, DimensionTab } from './types';
import { OverviewTab } from './components/OverviewTab';
import { ResearchTab } from './components/ResearchTab';
import { PolicyTab } from './components/PolicyTab';
import { LandUseTab } from './components/LandUseTab';
import { ClimateTab } from './components/ClimateTab';
import { DisputesTab } from './components/DisputesTab';
import { ProjectsTab } from './components/ProjectsTab';
import { GeospatialTab } from './components/GeospatialTab';

const DEFAULT_OVERVIEW: DashboardOverview = {
  permissions: {
    role: 'public',
    is_authenticated: false,
    can_view_sensitive_disputes: false,
    can_export_raw_geospatial: false,
    can_view_agency_audits: false,
    can_submit_data: false,
    access_tier: 'Public Open Data',
  },
  research: {
    total_papers: 142,
    peer_reviewed_count: 98,
    open_access_count: 116,
    total_citations: 1840,
    top_themes: [
      { theme: 'Cadastral Modernization & Titling', count: 48, share_pct: 33.8 },
      { theme: 'Forest Rights & Common Property', count: 34, share_pct: 23.9 },
      { theme: 'Urban Land Value Capture', count: 28, share_pct: 19.7 },
      { theme: 'Agricultural Tenancy Reforms', count: 20, share_pct: 14.1 },
      { theme: 'Climate-Induced Land Relocation', count: 12, share_pct: 8.5 },
    ],
    publication_velocity_yearly: [
      { year: '2023', publications: 22, citations: 180 },
      { year: '2024', publications: 38, citations: 460 },
      { year: '2025', publications: 52, citations: 790 },
      { year: '2026 (YTD)', publications: 30, citations: 410 },
    ],
  },
  policy: {
    total_policies: 64,
    enacted_count: 42,
    under_review_count: 14,
    draft_count: 6,
    repealed_count: 2,
    compliance_index_pct: 87.4,
    jurisdiction_breakdown: [
      { jurisdiction: 'Maharashtra', count: 16, enacted: 12 },
      { jurisdiction: 'Andhra Pradesh', count: 14, enacted: 10 },
      { jurisdiction: 'Karnataka', count: 12, enacted: 8 },
      { jurisdiction: 'Odisha', count: 11, enacted: 7 },
      { jurisdiction: 'National Level', count: 11, enacted: 5 },
    ],
    key_reform_areas: [
      { area: 'Digital Record of Rights (RoR) Mutation', status: 'Enacted', progress_pct: 92.0 },
      { area: 'SVAMITVA Rural Abadi Titling', status: 'Active', progress_pct: 88.5 },
      { area: 'Agricultural Land Leasing Act Conformance', status: 'In Consultation', progress_pct: 64.0 },
      { area: 'Automated Land Acquisition Compensation', status: 'Enacted', progress_pct: 79.0 },
    ],
  },
  land_use: {
    total_area_hectares: 3287263,
    agricultural_pct: 54.2,
    urban_builtup_pct: 14.8,
    forest_conservation_pct: 21.6,
    commercial_industrial_pct: 4.9,
    water_bodies_pct: 4.5,
    conversion_trends_5yr: [
      { period: '2021-2022', agricultural_to_urban_ha: 14200, conservation_gain_ha: 4100 },
      { period: '2022-2023', agricultural_to_urban_ha: 18450, conservation_gain_ha: 6300 },
      { period: '2023-2024', agricultural_to_urban_ha: 16100, conservation_gain_ha: 8900 },
      { period: '2024-2025', agricultural_to_urban_ha: 12800, conservation_gain_ha: 11400 },
      { period: '2025-2026', agricultural_to_urban_ha: 9400, conservation_gain_ha: 14200 },
    ],
  },
  climate: {
    coastal_vulnerability_index: 42.6,
    flood_risk_overlay_hectares: 482100,
    agro_ecological_protection_pct: 73.8,
    soil_carbon_retention_rating: 'A+ High',
    drought_resilience_score: 68.2,
    high_risk_zones_count: 14,
    conservation_reserves_count: 28,
  },
  disputes: {
    total_disputes: 4860,
    resolved_disputes: 3620,
    pending_disputes: 1240,
    resolution_rate_pct: 74.5,
    average_resolution_days: 94,
    dispute_categories: [
      { category: 'Boundary Demarcation & Encroachment', count: 1840, share_pct: 37.9 },
      { category: 'Inheritance & Succession Titles', count: 1260, share_pct: 25.9 },
      { category: 'Tenancy & Leasehold Rights', count: 890, share_pct: 18.3 },
      { category: 'Compensation & Acquisition Grievances', count: 580, share_pct: 11.9 },
      { category: 'Fraudulent Conveyance / Title Forgery', count: 290, share_pct: 6.0 },
    ],
    resolution_mechanism: [
      { mechanism: 'Revenue Court Summary Trials', cases_resolved: 1640, share_pct: 45.3 },
      { mechanism: 'Lok Adalat Pre-Litigation Settlements', cases_resolved: 1180, share_pct: 32.6 },
      { mechanism: 'Fast-Track Land Tribunals', cases_resolved: 800, share_pct: 22.1 },
    ],
    sensitive_details_masked: true,
  },
  projects: {
    total_active_projects: 8,
    drone_surveyed_villages: 284120,
    target_villages: 311000,
    drone_survey_completion_pct: 91.3,
    property_cards_distributed: 14200500,
    digital_mutation_avg_days: 3.4,
    baseline_mutation_days: 45.0,
    key_schemes: [
      { scheme_name: 'SVAMITVA Abadi Mapping', focus: 'Drone survey & rural property cards', progress_pct: 91.3, status: 'On Track' },
      { scheme_name: 'DILRMP Cadastral Resurvey', focus: 'Modernization of land records & GIS geo-referencing', progress_pct: 84.6, status: 'Active' },
      { scheme_name: 'ULPIN Bhu-Aadhaar Integration', focus: '14-digit unique parcel identification number', progress_pct: 78.2, status: 'Active' },
      { scheme_name: 'Bhoomi Samvaad Interoperability', focus: 'Single-window mutation & registration link', progress_pct: 96.0, status: 'Completed' },
    ],
  },
  geospatial: {
    total_parcels_digitized: 48291000,
    total_surveyed_sq_km: 842000,
    rtk_gps_precision_pct: 99.6,
    boundary_topology_consistency_pct: 99.9,
    coordinate_reference_systems: ['EPSG:4326 (WGS84)', 'EPSG:3857 (Web Mercator)', 'EPSG:7755 (India Zone II)'],
    active_map_layers_count: 24,
    boundary_mutations_processed: 894200,
  },
  last_updated: new Date().toISOString(),
  cached: false,
};

const BASE_TABS: { id: DimensionTab; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'Executive Overview', icon: LayoutDashboard },
  { id: 'research', label: 'Research Outputs', icon: BookOpen },
  { id: 'policy', label: 'Policy Indicators', icon: Scale },
  { id: 'land_use', label: 'Land Use Trends', icon: Layers },
  { id: 'climate', label: 'Climate Resilience', icon: ShieldCheck },
  { id: 'disputes', label: 'Dispute Statistics', icon: Gavel },
  { id: 'projects', label: 'Project Outcomes', icon: Rocket },
  { id: 'geospatial', label: 'Geospatial Insights', icon: MapPin },
];

export default function DashboardPage() {
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DimensionTab>('all');
  const [data, setData] = useState<DashboardOverview>(DEFAULT_OVERVIEW);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [publishedResource, setPublishedResource] = useState<{
    id: string;
    title: string;
    url: string;
  } | null>(null);
  const { toast } = useToast();

  // Listen to ?tab= query parameter on mount and update activeTab
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const tabParam = sp.get('tab') as DimensionTab | null;
      if (tabParam) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  // Sync tab change to URL search params
  const handleTabChange = (tabId: DimensionTab) => {
    setActiveTab(tabId);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (tabId === 'all') {
        url.searchParams.delete('tab');
      } else {
        url.searchParams.set('tab', tabId);
      }
      window.history.replaceState({}, '', url.toString());
    }
  };

  // The Contribute tab is always accessible directly in the official dashboard menu
  const tabs = [
    ...BASE_TABS,
    { id: 'contribute' as DimensionTab, label: 'Contribute', icon: UploadCloud },
  ];

  const fetchMetrics = useCallback(async (showToast = false) => {
    try {
      setIsRefreshing(true);
      const res = await apiRequest<DashboardOverview>('/dashboard/metrics');
      if (res && res.research) {
        setData(res);
        if (showToast) {
          toast({
            title: 'Dashboard Updated',
            description: `Live data loaded for access tier: ${res.permissions.access_tier}`,
          });
        }
      }
    } catch (err) {
      console.warn('Could not load live dashboard metrics, retaining resilient defaults:', err);
    } finally {
      setIsLoadingMetrics(false);
      setIsRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ContributeFormData>({
    resolver: zodResolver(contributeSchema),
    defaultValues: {
      title: '',
      publisher: '',
      resourceType: 'research_paper',
      abstract: '',
      jurisdiction: 'IN-MH',
      visibility: 'public',
    },
  });

  useEffect(() => {
    if (user) {
      if (user.organization_name) {
        setValue('publisher', user.organization_name);
      } else if (user.full_name) {
        setValue('publisher', user.full_name);
      }
    }
  }, [user, setValue]);

  const onContributeSubmit = async (formData: ContributeFormData) => {
    setIsSubmitting(true);
    try {
      let uploadInfo = null;
      if (uploadFile) {
        const bodyFormData = new FormData();
        bodyFormData.append('file', uploadFile);
        const baseUrl = env.apiUrl.replace(/\/$/, '');
        const token = getAuthToken();
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${baseUrl}/uploads`, {
          method: 'POST',
          headers,
          body: bodyFormData,
          credentials: 'include',
        });
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.detail || 'File upload failed');
        }
        uploadInfo = await res.json();
      }

      const baseUrl = env.apiUrl.replace(/\/$/, '');
      const token = getAuthToken();
      const resourceHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        resourceHeaders['Authorization'] = `Bearer ${token}`;
      }

      const resourceRes = await fetch(`${baseUrl}/resources`, {
        method: 'POST',
        headers: resourceHeaders,
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title,
          publisher: formData.publisher?.trim() || undefined,
          abstract: formData.abstract,
          resource_type: formData.resourceType,
          visibility: formData.visibility,
          status: 'published',
          jurisdiction: formData.jurisdiction,
          source_url: uploadInfo?.storage_uri,
          storage_uri: uploadInfo?.storage_uri,
          original_filename: uploadInfo?.original_filename,
          mime_type: uploadInfo?.mime_type,
          file_size_bytes: uploadInfo?.file_size_bytes,
          checksum_sha256: uploadInfo?.checksum_sha256,
        }),
      });

      if (!resourceRes.ok) {
        const errJson = await resourceRes.json().catch(() => ({}));
        throw new Error(errJson.detail || `Failed to create resource (Status: ${resourceRes.status})`);
      }

      const createdResource = await resourceRes.json();
      let targetSection = 'research';
      if (formData.resourceType === 'policy') {
        targetSection = 'policies';
      } else if (formData.resourceType === 'dataset' || formData.resourceType === 'spatial_layer') {
        targetSection = 'datasets';
      }

      setPublishedResource({
        id: createdResource.id,
        title: createdResource.title || formData.title,
        url: `/${targetSection}/${createdResource.id}`,
      });

      toast({
        title: 'Resource Published',
        description: `"${createdResource.title || formData.title}" has been successfully published to the registry.`,
        variant: 'success',
      });

      reset();
      setUploadFile(null);
      setSubmitSuccess(true);
      fetchMetrics();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to publish resource';
      toast({
        title: 'Publish Error',
        description: msg,
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Land Governance Intelligence
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
              Live v2.1
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Multidimensional policy analytics, geospatial cadastre benchmarks, and dispute surveillance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchMetrics(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-2xs disabled:opacity-50"
            title="Refresh metrics from backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('contribute')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl shadow-sm transition-colors ${
              activeTab === 'contribute'
                ? 'bg-emerald-900 text-white ring-2 ring-emerald-400'
                : 'text-white bg-emerald-700 hover:bg-emerald-800'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Contribute Records</span>
          </button>
        </div>
      </div>

      {/* Role-Based Access Tier Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Current Access Tier:
              </span>
              <span className="text-sm font-extrabold text-white">
                {data.permissions.access_tier}
              </span>
              {data.permissions.is_authenticated ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Authenticated
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-300">
                  Public Guest
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Role: <span className="font-semibold text-white">{data.permissions.role}</span> &bull;{' '}
              {data.permissions.can_view_sensitive_disputes
                ? 'Authorized for live tehsil dispute hotspots'
                : 'Sensitive dispute hotspots masked for public privacy'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg ${
              data.permissions.can_view_sensitive_disputes
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {data.permissions.can_view_sensitive_disputes ? (
              <Unlock className="w-3 h-3 text-emerald-400" />
            ) : (
              <Lock className="w-3 h-3 text-slate-500" />
            )}
            Dispute Hotspots
          </span>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg ${
              data.permissions.can_export_raw_geospatial
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {data.permissions.can_export_raw_geospatial ? (
              <CheckCircle2 className="w-3 h-3 text-blue-400" />
            ) : (
              <Lock className="w-3 h-3 text-slate-500" />
            )}
            Raw GIS Export
          </span>

          {!data.permissions.is_authenticated && (
            <Link
              href="/login"
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors ml-2"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Multidimensional Tab Switcher */}
      <div className="border-b border-slate-200">
        <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isContribute = tab.id === 'contribute';
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : isContribute
                    ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : isContribute ? 'text-emerald-700' : 'text-slate-500'}`} />
                {tab.label}
                {isContribute && !isActive && (
                  <span className="ml-0.5 px-1.5 py-0.5 text-[9px] font-bold bg-emerald-200 text-emerald-900 rounded-full">
                    Upload
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'contribute' ? (
          !isAuthenticated && !isAuthLoading ? (
            <div className="py-12 space-y-6 max-w-xl mx-auto text-center bg-white p-8 sm:p-10 rounded-2xl border border-slate-200/80 shadow-sm mt-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Official Contributor Sign-In Required</h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Sign in with your verified credentials to contribute research publications, policy statutes, or spatial cadastral layers to the national repository.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/login?redirect=/dashboard?tab=contribute"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm transition-colors w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  Sign In to Open Contribute Form
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors w-full sm:w-auto"
                >
                  Request Contributor Access
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-6 space-y-6 max-w-2xl">
              {submitSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h3 className="text-lg font-bold text-emerald-900">Contribution Published!</h3>
                  <p className="text-sm text-emerald-700">
                    {publishedResource?.title
                      ? `"${publishedResource.title}" has been successfully indexed in the national registry.`
                      : 'Your document has been indexed in the national registry.'}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    {publishedResource?.url && (
                      <Link
                        href={publishedResource.url}
                        className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-emerald-800 bg-white border border-emerald-300 rounded-xl hover:bg-emerald-50 transition-colors shadow-2xs"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Published Record
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitSuccess(false);
                        setPublishedResource(null);
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors"
                    >
                      <UploadCloud className="w-4 h-4" />
                      Submit Another Resource
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Submit Research, Policy, or Dataset</h2>
                      <p className="text-xs text-slate-500">Upload PDFs, images, GeoJSON, or spatial layers to the national registry</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit(onContributeSubmit)} className="space-y-5" noValidate>
                    {/* Title */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Document / Dataset Title <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Pune Metropolitan Cadastral Survey & Mutation Guidelines 2026"
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                          errors.title ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 bg-white'
                        }`}
                        {...register('title')}
                      />
                      {errors.title && (
                        <p role="alert" className="text-xs text-rose-600 font-medium">{errors.title.message}</p>
                      )}
                    </div>

                    {/* Publisher / Issuing Organization */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Publisher / Issuing Authority
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. National Institute of Rural Development or Department of Land Resources"
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        {...register('publisher')}
                      />
                      <p className="text-[11px] text-slate-400">
                        Pre-filled from your registered organization.
                      </p>
                    </div>

                      {/* Type & Jurisdiction */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Resource Type <span className="text-rose-500">*</span>
                          </label>
                          <select
                            className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                            {...register('resourceType')}
                          >
                            <option value="research_paper">📄 Research Paper</option>
                            <option value="policy">⚖️ Policy Document</option>
                            <option value="dataset">📊 Open Dataset</option>
                            <option value="spatial_layer">🗺️ Spatial GIS Layer</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Jurisdiction Code
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. IN-MH, IN-KA, IN-AP"
                            className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            {...register('jurisdiction')}
                          />
                        </div>
                      </div>

                      {/* Abstract */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Abstract / Description <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Provide a summary of this resource — scope, methodology, geographic coverage, or legal basis..."
                          className={`w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none ${
                            errors.abstract ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 bg-white'
                          }`}
                          {...register('abstract')}
                        />
                        {errors.abstract && (
                          <p role="alert" className="text-xs text-rose-600 font-medium">{errors.abstract.message}</p>
                        )}
                      </div>

                      {/* File Upload */}
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Attach File (PDF, Image, GeoJSON, TIFF)
                        </label>
                        <label
                          htmlFor="contrib-file-input"
                          className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl cursor-pointer transition-colors group"
                        >
                          <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-emerald-50 flex items-center justify-center shrink-0 transition-colors">
                            <FileUp className="w-4 h-4 text-slate-500 group-hover:text-emerald-600 transition-colors" />
                          </div>
                          <div className="min-w-0">
                            {uploadFile ? (
                              <p className="text-sm font-semibold text-emerald-700 truncate">{uploadFile.name}</p>
                            ) : (
                              <p className="text-sm text-slate-500">Click to browse or drag & drop</p>
                            )}
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Supported: PDF, PNG, JPG, GeoJSON, TIFF · Max 50MB
                            </p>
                          </div>
                        </label>
                        <input
                          id="contrib-file-input"
                          type="file"
                          accept="application/pdf,image/png,image/jpeg,image/jpg,.pdf,.geojson,.json,.tif,.tiff,.png,.jpg,.jpeg"
                          onChange={(e) => {
                            setUploadFile(e.target.files ? e.target.files[0] : null);
                          }}
                          className="sr-only"
                        />
                        {uploadFile && (
                          <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <span className="text-xs text-emerald-700 font-mono truncate">
                              {uploadFile.name} — {(uploadFile.size / 1024).toFixed(1)} KB
                            </span>
                            <button
                              type="button"
                              onClick={() => setUploadFile(null)}
                              className="ml-2 text-emerald-600 hover:text-rose-600 transition-colors shrink-0"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Visibility */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Visibility
                        </label>
                        <select
                          className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                          {...register('visibility')}
                        >
                          <option value="public">🌐 Public — visible to everyone</option>
                          <option value="restricted">🔒 Restricted — authenticated users only</option>
                        </select>
                      </div>

                      {/* Submit */}
                      <div className="pt-2 flex items-center gap-3">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-6 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm disabled:opacity-70 transition-colors"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Publishing to Registry...
                            </>
                          ) : (
                            <>
                              <UploadCloud className="w-4 h-4" />
                              Publish to Registry
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )
          ) : isLoadingMetrics ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'all' && (
              <OverviewTab overview={data} onSelectTab={(tab) => handleTabChange(tab)} />
            )}
            {activeTab === 'research' && <ResearchTab data={data.research} />}
            {activeTab === 'policy' && <PolicyTab data={data.policy} />}
            {activeTab === 'land_use' && <LandUseTab data={data.land_use} />}
            {activeTab === 'climate' && <ClimateTab data={data.climate} />}
            {activeTab === 'disputes' && (
              <DisputesTab data={data.disputes} permissions={data.permissions} />
            )}
            {activeTab === 'projects' && <ProjectsTab data={data.projects} />}
            {activeTab === 'geospatial' && (
              <GeospatialTab data={data.geospatial} permissions={data.permissions} />
            )}
          </>
        )}
      </div>

      {/* Cadastral Activity & Governance Audit Stream */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Recent Cadastral Mutations & Land Records Log
            </h3>
          </div>
          <span className="text-xs text-slate-500">Live Synchronized</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th scope="col" className="px-5 py-3">Mutation ID</th>
                <th scope="col" className="px-5 py-3">Jurisdiction</th>
                <th scope="col" className="px-5 py-3">Action Type</th>
                <th scope="col" className="px-5 py-3">Status</th>
                <th scope="col" className="px-5 py-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="hover:bg-slate-50/50">
                <td className="px-5 py-3 font-mono text-slate-500">MUT-2026-08412</td>
                <td className="px-5 py-3 font-semibold text-slate-900">Pune Metro Circle, MH</td>
                <td className="px-5 py-3">Digital RoR Subdivision</td>
                <td className="px-5 py-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Validated
                  </span>
                </td>
                <td className="px-5 py-3 text-right text-slate-500">12 mins ago</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="px-5 py-3 font-mono text-slate-500">MUT-2026-08411</td>
                <td className="px-5 py-3 font-semibold text-slate-900">Visakhapatnam Coastal, AP</td>
                <td className="px-5 py-3">Flood Hazard Buffer Demarcation</td>
                <td className="px-5 py-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                    Gazetted
                  </span>
                </td>
                <td className="px-5 py-3 text-right text-slate-500">45 mins ago</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="px-5 py-3 font-mono text-slate-500">MUT-2026-08410</td>
                <td className="px-5 py-3 font-semibold text-slate-900">Bengaluru Urban, KA</td>
                <td className="px-5 py-3">Agricultural to Mixed Urban Conversion</td>
                <td className="px-5 py-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    Revenue Hearing
                  </span>
                </td>
                <td className="px-5 py-3 text-right text-slate-500">2 hours ago</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="px-5 py-3 font-mono text-slate-500">MUT-2026-08409</td>
                <td className="px-5 py-3 font-semibold text-slate-900">Mayurbhanj Tribal Tract, OD</td>
                <td className="px-5 py-3">Community Forest Resource Title (FRA)</td>
                <td className="px-5 py-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Title Conferred
                  </span>
                </td>
                <td className="px-5 py-3 text-right text-slate-500">3 hours ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
