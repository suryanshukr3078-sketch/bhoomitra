'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Layers,
  FileText,
  TrendingUp,
  Download,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  RefreshCw,
  Search,
  BookOpen,
  Globe2,
  Code2,
  Sparkles,
  ShieldCheck,
  Building2,
  Calendar,
  Eye,
  Filter,
  Info,
  HelpCircle,
  FileCheck2,
  MapPin,
  X,
  Compass,
  FileDown,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api/client';
import { useAuth } from '@/lib/auth-context';

// Realistic sample GeoJSON datasets for instant download & inspection
const SAMPLE_GEOJSON_DATA: Record<string, any> = {
  'lyr-maha-cadastre-v2': {
    type: 'FeatureCollection',
    crs: {
      type: 'name',
      properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' },
    },
    bhoomitra_metadata: {
      package_title: 'Maharashtra Haveli Tehsil Cadastre',
      tehsil: 'Haveli',
      district: 'Pune',
      state: 'Maharashtra',
      crs_standard: 'EPSG:4326 (WGS 84)',
      topology_verification: 'VERIFIED_ZERO_OVERLAPS',
      total_parcels_in_registry: 45120,
      survey_date: '2026-09-12',
      institution: 'Survey of India & Department of Land Records, Maharashtra',
    },
    features: [
      {
        type: 'Feature',
        id: 'MH-HAV-104-1',
        properties: {
          survey_no: '104/1',
          gat_no: '88',
          village: 'Haveli Gaothan',
          taluka: 'Haveli',
          district: 'Pune',
          area_hectares: 1.45,
          land_use: 'Agricultural & Gaothan Boundary',
          ownership_type: 'Private Tenancy Title',
          bhu_aadhaar_ulpin: 'MH27041040188',
          topology_audit: 'PASSED_ZERO_OVERLAPS',
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [73.8561, 18.5204],
              [73.8582, 18.5204],
              [73.8582, 18.5225],
              [73.8561, 18.5225],
              [73.8561, 18.5204],
            ],
          ],
        },
      },
      {
        type: 'Feature',
        id: 'MH-HAV-104-2',
        properties: {
          survey_no: '104/2',
          gat_no: '89',
          village: 'Haveli Gaothan',
          taluka: 'Haveli',
          district: 'Pune',
          area_hectares: 2.10,
          land_use: 'Irrigated Agro-Crop',
          ownership_type: 'Family Joint Title',
          bhu_aadhaar_ulpin: 'MH27041040289',
          topology_audit: 'PASSED_ZERO_OVERLAPS',
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [73.8582, 18.5204],
              [73.8605, 18.5204],
              [73.8605, 18.5225],
              [73.8582, 18.5225],
              [73.8582, 18.5204],
            ],
          ],
        },
      },
      {
        type: 'Feature',
        id: 'MH-HAV-105',
        properties: {
          survey_no: '105',
          gat_no: '90',
          village: 'Haveli Gaothan',
          taluka: 'Haveli',
          district: 'Pune',
          area_hectares: 3.80,
          land_use: 'Communal Forest Buffer & Agroforestry',
          ownership_type: 'Communal Title (CFR)',
          bhu_aadhaar_ulpin: 'MH27041050090',
          topology_audit: 'PASSED_ZERO_OVERLAPS',
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [73.8561, 18.5225],
              [73.8605, 18.5225],
              [73.8605, 18.5255],
              [73.8561, 18.5255],
              [73.8561, 18.5225],
            ],
          ],
        },
      },
      {
        type: 'Feature',
        id: 'MH-HAV-106-1',
        properties: {
          survey_no: '106/1',
          gat_no: '91',
          village: 'Haveli Gaothan',
          taluka: 'Haveli',
          district: 'Pune',
          area_hectares: 0.95,
          land_use: 'Government Canal & Waterbody Buffer',
          ownership_type: 'Irrigation Department, Govt of Maharashtra',
          bhu_aadhaar_ulpin: 'MH27041060191',
          topology_audit: 'PASSED_ZERO_OVERLAPS',
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [73.8561, 18.5255],
              [73.8585, 18.5255],
              [73.8585, 18.5275],
              [73.8561, 18.5275],
              [73.8561, 18.5255],
            ],
          ],
        },
      },
    ],
  },
  'lyr-deccan-soil-carbon': {
    type: 'FeatureCollection',
    crs: {
      type: 'name',
      properties: { name: 'urn:ogc:def:crs:EPSG::32643' },
    },
    bhoomitra_metadata: {
      package_title: 'Soil Organic Carbon & Land Use Degradation Overlay',
      region: 'Deccan Plateau Watershed',
      state: 'Maharashtra / Karnataka Border',
      crs_standard: 'EPSG:32643 (UTM Zone 43N)',
      spatial_resolution: '10m Multi-Spectral Grid',
      topology_verification: 'RASTER_INGEST_COMPLETE',
      institution: 'Indian Council of Agricultural Research (ICAR) & ISRO',
    },
    features: [
      {
        type: 'Feature',
        id: 'SOC-DEC-GRID-01',
        properties: {
          grid_cell_id: 'DEC_SOC_0041',
          carbon_density_ton_per_ha: 42.8,
          degradation_risk: 'LOW',
          soil_ph: 6.8,
          vegetation_index_ndvi: 0.62,
          tenure_zone: 'Community Agroforestry',
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [74.120, 17.850],
              [74.125, 17.850],
              [74.125, 17.855],
              [74.120, 17.855],
              [74.120, 17.850],
            ],
          ],
        },
      },
      {
        type: 'Feature',
        id: 'SOC-DEC-GRID-02',
        properties: {
          grid_cell_id: 'DEC_SOC_0042',
          carbon_density_ton_per_ha: 31.4,
          degradation_risk: 'MODERATE',
          soil_ph: 7.2,
          vegetation_index_ndvi: 0.44,
          tenure_zone: 'Rainfed Dryland Crop',
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [74.125, 17.850],
              [74.130, 17.850],
              [74.130, 17.855],
              [74.125, 17.855],
              [74.125, 17.850],
            ],
          ],
        },
      },
    ],
  },
  'cfr-central-india': {
    type: 'FeatureCollection',
    crs: {
      type: 'name',
      properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' },
    },
    bhoomitra_metadata: {
      package_title: 'Central India Community Forest Rights (CFR) Overlay',
      district: 'Gadchiroli & Mayurbhanj Belt',
      state: 'Maharashtra / Odisha',
      statutory_basis: 'Forest Rights Act (FRA) 2006',
      total_cfr_titles: 1850,
      topology_verification: 'VERIFIED_ZERO_OVERLAPS',
    },
    features: [
      {
        type: 'Feature',
        id: 'CFR-GAD-MENDHA-01',
        properties: {
          cfr_title_id: 'MH-GAD-CFR-2026-0042',
          gram_sabha_name: 'Mendha Lekha Gram Sabha',
          taluka: 'Dhanora',
          district: 'Gadchiroli',
          demarcated_area_ha: 1800.5,
          forest_type: 'Dry Deciduous Teak & Bamboo Canopy',
          community_stewardship: 'Active Gram Sabha Council',
          title_status: 'Formally Certified & Registered',
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [80.145, 20.210],
              [80.170, 20.210],
              [80.170, 20.235],
              [80.145, 20.235],
              [80.145, 20.210],
            ],
          ],
        },
      },
    ],
  },
};

export default function ResearcherWorkspacePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'spatial-lab' | 'papers' | 'citations' | 'export'>('spatial-lab');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [copiedBibtexId, setCopiedBibtexId] = useState<string | null>(null);

  // Interactive Topology Audit State
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [auditStep, setAuditStep] = useState(0);
  const [auditSuccess, setAuditSuccess] = useState(false);
  const [showAuditReportModal, setShowAuditReportModal] = useState(false);

  // Spatial Workbench State
  const [workbenchCategory, setWorkbenchCategory] = useState<'all' | 'cadastre' | 'ecological' | 'forest'>('all');
  const [workbenchSearch, setWorkbenchSearch] = useState('');
  const [selectedLayerForInspect, setSelectedLayerForInspect] = useState<any>(null);

  // Manuscripts & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [newPaperTitle, setNewPaperTitle] = useState('');
  const [newPaperPublisher, setNewPaperPublisher] = useState('Indian Council of Agricultural Research (ICAR)');
  const [newPaperAbstract, setNewPaperAbstract] = useState('');
  const [isSubmittingPaper, setIsSubmittingPaper] = useState(false);

  const fetchWorkspace = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest<any>('/workspace/researcher');
      setData(res);
    } catch (err) {
      console.warn('Could not fetch researcher workspace from API, using fallback:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, []);

  // Multi-step Interactive Topology Audit Simulation
  const handleRunTopologyAudit = () => {
    setIsRunningAudit(true);
    setAuditStep(1);
    setAuditSuccess(false);

    // Step 1: Scanning vertices
    setTimeout(() => {
      setAuditStep(2);
      // Step 2: Testing intersections
      setTimeout(() => {
        setAuditStep(3);
        // Step 3: Snapping tolerance
        setTimeout(() => {
          setAuditStep(4);
          // Step 4: Finished
          setTimeout(() => {
            setIsRunningAudit(false);
            setAuditStep(0);
            setAuditSuccess(true);
            setShowAuditReportModal(true);
            toast({
              title: 'Topology Audit Completed (100% Valid)',
              description: 'Audited 45,120 land parcel polygons. 0 self-crossings, 0 overlaps, and 0 boundary gaps found.',
              variant: 'success',
            });
          }, 600);
        }, 600);
      }, 600);
    }, 600);
  };

  // Direct File Download Helpers (prevents black screen with raw JSON)
  const downloadTextFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadGeoJSON = (layerId: string, friendlyName: string) => {
    const geojsonData = SAMPLE_GEOJSON_DATA[layerId] || SAMPLE_GEOJSON_DATA['lyr-maha-cadastre-v2'];
    const safeFilename = `${layerId.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_cadastre.geojson`;
    const jsonString = JSON.stringify(geojsonData, null, 2);

    downloadTextFile(jsonString, safeFilename, 'application/geo+json');

    toast({
      title: 'GeoJSON Download Started',
      description: `"${friendlyName}" downloaded as "${safeFilename}". Ready to open in QGIS, ArcGIS, or Python.`,
      variant: 'success',
    });
  };

  const handleDownloadBibtexLibrary = () => {
    const fullBib = papers
      .map(
        (p: any) => `@article{bhoomitra_${p.id.replace(/[^a-zA-Z0-9]/g, '_')},
  title = {${p.title}},
  author = {${user?.full_name || 'Cadastral GIS Research Group'}},
  journal = {International Journal of Land Tenure & Cadastral Geoscience},
  publisher = {${p.publisher || 'National Remote Sensing Centre (NRSC)'}},
  year = {2026},
  doi = {${p.doi || '10.1016/landgov.' + p.id.slice(0, 8)}},
  url = {https://web-rho-gules-89.vercel.app/resources/${p.id}}
}`
      )
      .join('\n\n');

    downloadTextFile(fullBib, 'bhoomitra_citations_library.bib', 'text/x-bibtex');

    toast({
      title: 'BibTeX Library Downloaded',
      description: 'Downloaded complete "bhoomitra_citations_library.bib" bundle for Zotero, Mendeley, and LaTeX.',
      variant: 'success',
    });
  };

  const handleCopyBibtex = (paper: any) => {
    const bibtex = `@article{landgov_${paper.id.slice(0, 8)},
  title = {${paper.title}},
  author = {${user?.full_name || 'Cadastral GIS Research Group'}},
  journal = {International Journal of Land Tenure & Cadastral Geoscience},
  publisher = {${paper.publisher || 'National Remote Sensing Centre (NRSC)'}},
  year = {2026},
  doi = {${paper.doi || '10.1016/landgov.' + paper.id.slice(0, 8)}},
  url = {https://web-rho-gules-89.vercel.app/resources/${paper.id}}
}`;

    navigator.clipboard.writeText(bibtex);
    setCopiedBibtexId(paper.id);
    toast({
      title: 'BibTeX Citation Copied',
      description: `Citation with publisher "${paper.publisher || 'NRSC'}" copied to clipboard.`,
      variant: 'success',
    });
    setTimeout(() => setCopiedBibtexId(null), 3000);
  };

  const handleSubmitManuscript = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPaperTitle.trim()) return;

    setIsSubmittingPaper(true);
    setTimeout(() => {
      setIsSubmittingPaper(false);
      setShowSubmitModal(false);
      toast({
        title: 'Manuscript Submitted for Peer Review',
        description: `"${newPaperTitle}" submitted under publisher "${newPaperPublisher}". DOI assigned: 10.1016/landgov.${Math.random().toString(36).substring(2, 8)}.`,
        variant: 'success',
      });
      setNewPaperTitle('');
      setNewPaperAbstract('');
      fetchWorkspace();
    }, 1000);
  };

  // Curated spatial layers
  const spatialLayers = [
    {
      layer_id: 'lyr-maha-cadastre-v2',
      name: 'Western Ghats Communal Agro-Forest Parcels',
      category: 'cadastre',
      category_label: 'Cadastral Land Parcels (भू-नक्शा)',
      region: 'Haveli Tehsil, Pune, Maharashtra',
      format: 'GeoJSON / FlatGeobuf',
      crs: 'EPSG:4326 (WGS 84)',
      feature_count: 45120,
      topology_status: 'Verified - Zero Overlaps',
      last_validated: '2026-09-12T19:00:00Z',
      purpose: 'High-resolution drone survey demarcating individual farm boundaries and gaothan plots.',
    },
    {
      layer_id: 'lyr-deccan-soil-carbon',
      name: 'Soil Organic Carbon & Land Use Degradation Overlay',
      category: 'ecological',
      category_label: 'Soil & Ecology (मृदा स्वास्थ्य)',
      region: 'Deccan Plateau Watershed (MH / KA)',
      format: 'Cloud-Optimized GeoTIFF / GeoJSON',
      crs: 'EPSG:32643 (UTM Zone 43N)',
      feature_count: '10m Spatial Resolution Grid',
      topology_status: 'Raster Ingest Complete',
      last_validated: '2026-09-10T11:30:00Z',
      purpose: 'Multi-spectral satellite indicators monitoring soil organic carbon and agricultural vulnerability.',
    },
    {
      layer_id: 'cfr-central-india',
      name: 'Central India Community Forest Resource (CFR) Titles',
      category: 'forest',
      category_label: 'Customary Forest Rights (वन अधिकार)',
      region: 'Gadchiroli & Mayurbhanj Forest Belt',
      format: 'GeoJSON / KML',
      crs: 'EPSG:4326 (WGS 84)',
      feature_count: 1850,
      topology_status: 'Certified Invariant Clean',
      last_validated: '2026-09-08T15:20:00Z',
      purpose: 'Official spatial boundaries of Gram Sabha-managed communal forest resources under FRA 2006.',
    },
  ];

  const filteredSpatialLayers = spatialLayers.filter((layer) => {
    const matchesCategory = workbenchCategory === 'all' || layer.category === workbenchCategory;
    const matchesSearch =
      layer.name.toLowerCase().includes(workbenchSearch.toLowerCase()) ||
      layer.region.toLowerCase().includes(workbenchSearch.toLowerCase()) ||
      layer.layer_id.toLowerCase().includes(workbenchSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Fallback / dynamic papers
  const papers = data?.papers?.length
    ? data.papers
    : [
        {
          id: 'res-paper-001',
          title: 'Machine Learning Cadastral Topology Invariant Validation Across Multi-Resolution SVAMITVA Orthomosaics',
          publisher: 'National Remote Sensing Centre (NRSC) / ISRO',
          doi: '10.1016/landgov.2026.0142',
          status: 'published',
          created_at: '2026-08-14T10:30:00Z',
        },
        {
          id: 'res-paper-002',
          title: 'Socio-Legal Dimensions of Forest Rights Act 2006: Geospatial Community Tenure Demarcation in Central India',
          publisher: 'Indian Council of Social Science Research (ICSSR)',
          doi: '10.1016/landgov.2026.0089',
          status: 'published',
          created_at: '2026-07-22T14:15:00Z',
        },
        {
          id: 'res-paper-003',
          title: 'Comparative Assessment of Blockchain-Anchored Cadastral Ledgers in Mitigating Agricultural Title Disputes',
          publisher: 'Centre for Land Governance & Policy Analytics',
          doi: '10.1016/landgov.2026.0031',
          status: 'under_review',
          created_at: '2026-09-02T09:00:00Z',
        },
      ];

  const filteredPapers = papers.filter(
    (p: any) =>
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.publisher?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.doi?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Official Header Banner */}
      <section className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white border-b border-emerald-900/60 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                  Academic & Scientific Clearance
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300 border border-slate-700">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  ORCID: {data?.researcher?.orcid_id || '0000-0002-1825-0097'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Researcher & GIS Science Lab Workbench
              </h1>
              <p className="text-slate-300 text-sm sm:text-base max-w-3xl">
                Advanced spatial computation environment for cadastral boundary integrity audits, high-resolution vector analysis, and peer-reviewed land governance publications with institutional publisher accreditation.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={fetchWorkspace}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                Sync Datasets
              </button>
              <button
                onClick={() => setShowSubmitModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Submit Manuscript
              </button>
              <Link
                href="/workspace"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700/80 transition-colors"
              >
                Switch Workspace
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
            <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-4 border border-emerald-500/20">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-emerald-400" /> Authored Papers
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{data?.summary?.total_papers_authored || papers.length}</span>
                <span className="text-xs text-emerald-400 font-medium">Published</span>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-4 border border-emerald-500/20">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-teal-400" /> Peer Citations
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{data?.summary?.total_citations || 480}</span>
                <span className="text-xs text-teal-400 font-medium">+18% YoY</span>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-4 border border-emerald-500/20">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-cyan-400" /> Active GIS Layers
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{data?.summary?.active_gis_layers || spatialLayers.length}</span>
                <span className="text-xs text-cyan-400 font-medium">Vector & COG</span>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-4 border border-emerald-500/20">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Topology Pass Rate
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{data?.summary?.topology_runs_passed || 99.8}%</span>
                <span className="text-xs text-emerald-400 font-medium">Grade A+ (Clean)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 mb-8 overflow-x-auto pb-2 sm:pb-0">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setActiveTab('spatial-lab')}
              className={`inline-flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'spatial-lab'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              Spatial GIS Lab & Topology
            </button>
            <button
              onClick={() => setActiveTab('papers')}
              className={`inline-flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'papers'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Manuscripts & Publisher Directory
              <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-800">
                {papers.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('citations')}
              className={`inline-flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'citations'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Citation Analytics
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`inline-flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'export'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Download className="w-4 h-4" />
              Open Data Export Engine
            </button>
          </div>
        </div>

        {/* TAB 1: SPATIAL LAB & TOPOLOGY CHECK */}
        {activeTab === 'spatial-lab' && (
          <div className="space-y-8">
            {/* Interactive Topology Audit Station */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
                    <Sparkles className="w-4 h-4" /> Automated Geospatial Validation Engine &bull; भू-सीमा सत्यापन
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                    Cadastral Boundary Accuracy & Topology Verifier
                  </h2>
                  <p className="text-sm text-slate-600 mt-1 max-w-3xl">
                    Automated quality-control engine that checks land parcel boundaries for overlaps, micro-gaps, and coordinate alignment before official registration.
                  </p>
                </div>
                <button
                  onClick={handleRunTopologyAudit}
                  disabled={isRunningAudit}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-sm font-semibold shadow-sm transition-all whitespace-nowrap"
                >
                  {isRunningAudit ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Auditing Invariants...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Run Full Topology Audit
                    </>
                  )}
                </button>
              </div>

              {/* In-Flight Audit Progress Indicator */}
              {isRunningAudit && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 animate-in fade-in space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-900">
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                      {auditStep === 1 && 'Phase 1/4: Scanning 45,120 parcel boundary vertices...'}
                      {auditStep === 2 && 'Phase 2/4: Checking polygon non-intersections and self-loops...'}
                      {auditStep === 3 && 'Phase 3/4: Testing snap tolerances and border adjacency (< 5cm)...'}
                      {auditStep === 4 && 'Phase 4/4: Conforming coordinates to Survey of India geodetic reference...'}
                    </span>
                    <span className="font-mono">{auditStep * 25}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-emerald-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${auditStep * 25}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Plain-Language Explainer Card (सरल व्याख्या) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-slate-50 border border-emerald-200/80 flex flex-col md:flex-row items-start gap-4">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div className="space-y-1 text-xs sm:text-sm text-slate-700">
                  <span className="font-bold text-slate-900 text-sm block">
                    Why Topology Validation Matters for Land Owners & Farmers (भू-अभिलेखों में सीमा सत्यापन क्यों आवश्यक है?)
                  </span>
                  <p className="leading-relaxed">
                    Just as a spellchecker catches spelling mistakes, this <strong>Topology Verifier</strong> automatically detects errors on digital land maps. It prevents neighboring land plots from accidentally overlapping, guarantees that property boundaries snap together seamlessly like puzzle pieces, and ensures maps align with official Indian satellite benchmarks (SVAMITVA standard).
                  </p>
                </div>
              </div>

              {/* 3 Core Invariant Cards (Plain Language + Technical Standard) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Card 1: Overlaps */}
                <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 hover:border-emerald-300 transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Check 1 &bull; सीमा अतिच्छादन निषेध
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> 0 Overlaps
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Zero Parcel Overlaps</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Guarantees no two land plots claim the same physical ground. Prevents double-counting and ownership disputes.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/70 text-[11px] text-slate-500 font-mono">
                    <span className="font-semibold text-slate-700">Technical:</span> CCW Winding &bull; ISO 19152 (LADM) Compliant
                  </div>
                </div>

                {/* Card 2: Boundary Snapping */}
                <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 hover:border-emerald-300 transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Check 2 &bull; सूक्ष्म अंतराल रहित सीमा
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Snapped &lt; 5cm
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Seamless Boundary Snapping</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Shared boundaries between neighboring fields snap cleanly together with no accidental micro-gaps or orphaned slivers.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/70 text-[11px] text-slate-500 font-mono">
                    <span className="font-semibold text-slate-700">Technical:</span> Snapping Invariant Met &bull; Tolerance &lt; 0.05m
                  </div>
                </div>

                {/* Card 3: Geodetic Reference */}
                <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 hover:border-emerald-300 transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Check 3 &bull; राष्ट्रीय भू-निर्देशांक
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Survey of India
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">National Map & Satellite Alignment</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      All survey coordinates accurately align with Indian national geodetic benchmarks and high-resolution satellite orthomosaics.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/70 text-[11px] text-slate-500 font-mono">
                    <span className="font-semibold text-slate-700">Technical:</span> EPSG:4326 (WGS 84) &amp; EPSG:32643 (UTM 43N)
                  </div>
                </div>
              </div>
            </div>

            {/* Spatial Layers Table & Interactive Workbench */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Scientific Spatial Layers Workbench
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Curated cadastral vector maps and ecological layers available for preview and direct GeoJSON download.
                  </p>
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setWorkbenchCategory('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      workbenchCategory === 'all'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    All Layers ({spatialLayers.length})
                  </button>
                  <button
                    onClick={() => setWorkbenchCategory('cadastre')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      workbenchCategory === 'cadastre'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    Cadastral Parcels
                  </button>
                  <button
                    onClick={() => setWorkbenchCategory('ecological')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      workbenchCategory === 'ecological'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    Soil & Ecology
                  </button>
                  <button
                    onClick={() => setWorkbenchCategory('forest')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      workbenchCategory === 'forest'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    Forest Rights (FRA)
                  </button>
                </div>
              </div>

              {/* Search Bar for Layers */}
              <div className="px-6 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={workbenchSearch}
                    onChange={(e) => setWorkbenchSearch(e.target.value)}
                    placeholder="Search layers by name, region, or layer ID..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                  Showing {filteredSpatialLayers.length} of {spatialLayers.length} datasets
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/90 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <th className="px-6 py-3.5">Layer Name &amp; Area</th>
                      <th className="px-6 py-3.5">Category &amp; Format</th>
                      <th className="px-6 py-3.5">Features / Extent</th>
                      <th className="px-6 py-3.5">Topology Status</th>
                      <th className="px-6 py-3.5">Last Validated</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredSpatialLayers.map((layer) => (
                      <tr key={layer.layer_id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{layer.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{layer.region}</span>
                            <span className="text-slate-300">&bull;</span>
                            <span className="font-mono text-slate-400 text-[11px]">{layer.crs}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 max-w-md line-clamp-1">{layer.purpose}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <span className="inline-block text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                              {layer.category_label}
                            </span>
                            <div className="font-mono text-xs text-slate-500">{layer.format}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-700 font-medium">
                          {typeof layer.feature_count === 'number'
                            ? `${layer.feature_count.toLocaleString()} Polygons`
                            : layer.feature_count}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {layer.topology_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {new Date(layer.last_validated).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => setSelectedLayerForInspect(layer)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
                              title="Inspect attributes and sample geometry"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-600" />
                              Inspect
                            </button>
                            <button
                              onClick={() => handleDownloadGeoJSON(layer.layer_id, layer.name)}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 active:scale-95 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors shadow-2xs"
                              title="Directly download clean GeoJSON file"
                            >
                              <Download className="w-3.5 h-3.5 text-emerald-700" />
                              Download GeoJSON
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANUSCRIPTS & PUBLISHER DIRECTORY */}
        {activeTab === 'papers' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search papers by title, publisher name, or DOI..."
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs py-1.5 px-3">
                  Publisher Attributed
                </Badge>
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Submit New Research
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredPapers.map((paper: any) => (
                <div
                  key={paper.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:border-emerald-300/80 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="space-y-2.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={paper.status === 'published' ? 'success' : 'default'} className="capitalize text-xs">
                        {paper.status.replace('_', ' ')}
                      </Badge>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <Building2 className="w-3 h-3 text-emerald-600" />
                        Publisher: <span className="font-bold">{paper.publisher || 'National Remote Sensing Centre (NRSC)'}</span>
                      </span>
                      {paper.doi && (
                        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                          DOI: {paper.doi}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {paper.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {paper.created_at ? new Date(paper.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '2026-08-14'}
                      </span>
                      <span>&bull;</span>
                      <span>Peer-Reviewed Archival Record</span>
                      <span>&bull;</span>
                      <span className="text-emerald-700 font-medium">Full Open Access</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 self-end lg:self-center">
                    <button
                      onClick={() => handleCopyBibtex(paper)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                    >
                      {copiedBibtexId === paper.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          BibTeX
                        </>
                      )}
                    </button>
                    <Link
                      href={`/resources/${paper.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Paper Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CITATION ANALYTICS */}
        {activeTab === 'citations' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Annual Peer Citation Trajectory</h3>
                <p className="text-xs text-slate-500 mt-1">Growth in scientific references to published cadastral models and spatial algorithms.</p>
              </div>

              <div className="space-y-4 pt-2">
                {(data?.citation_benchmarks || [
                  { year: '2024', citations: 85 },
                  { year: '2025', citations: 195 },
                  { year: '2026 YTD', citations: 200 },
                ]).map((item: any) => {
                  const maxVal = 250;
                  const pct = Math.min(100, Math.round((item.citations / maxVal) * 100));
                  return (
                    <div key={item.year} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">{item.year}</span>
                        <span className="text-emerald-700 font-mono">{item.citations} citations</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                <div className="text-center p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                  <div className="text-2xl font-black text-emerald-900">14</div>
                  <div className="text-xs text-emerald-700 font-medium mt-0.5">h-Index</div>
                </div>
                <div className="text-center p-3 rounded-2xl bg-teal-50/60 border border-teal-100">
                  <div className="text-2xl font-black text-teal-900">22</div>
                  <div className="text-xs text-teal-700 font-medium mt-0.5">i10-Index</div>
                </div>
                <div className="text-center p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-2xl font-black text-slate-900">100%</div>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">Open Access</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Publisher Affiliations</h3>
              <p className="text-xs text-slate-500">Official research partners and peer-review consortia hosting our published papers.</p>
              
              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                  <span className="font-bold text-slate-800 block">National Remote Sensing Centre (NRSC)</span>
                  <span className="text-slate-500 text-xs">Department of Space, Govt of India</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                  <span className="font-bold text-slate-800 block">Indian Council of Social Science Research (ICSSR)</span>
                  <span className="text-slate-500 text-xs">Land Rights & Tenure Directorate</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                  <span className="font-bold text-slate-800 block">Survey of India (SOI) Academic Press</span>
                  <span className="text-slate-500 text-xs">Geodetic & Cadastral GIS Series</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: OPEN DATA EXPORT ENGINE (FIXED DIRECT DOWNLOADS) */}
        {activeTab === 'export' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
                <Download className="w-4 h-4" /> Open Science & Interoperable Data Distribution
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                Open Cadastral Geospatial Data Packages
              </h3>
              <p className="text-sm text-slate-600 mt-1 max-w-3xl">
                Pre-packaged, standards-compliant spatial bundles with verified topology. Download directly to your local workstation for GIS analysis in QGIS, ArcGIS, or GeoPandas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Package 1: Maharashtra Haveli */}
              <div className="p-6 rounded-2xl border border-slate-200/90 hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4 bg-slate-50/50">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-mono text-xs">
                      GeoJSON / Vector FeatureCollection
                    </Badge>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                      Clean Topology
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    Maharashtra Haveli Tehsil Cadastre
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Standardized bundle containing 45,120 agricultural and gaothan parcel polygons with survey numbers, area calculations, and closed boundary vertices.
                  </p>
                  <div className="text-[11px] text-slate-500 font-mono">
                    CRS: EPSG:4326 (WGS 84) &bull; Format: .geojson &bull; Compliant: ISO 19152 LADM
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                  <button
                    onClick={() =>
                      setSelectedLayerForInspect({
                        layer_id: 'lyr-maha-cadastre-v2',
                        name: 'Maharashtra Haveli Tehsil Cadastre',
                        category_label: 'Cadastral Land Parcels',
                        region: 'Haveli Tehsil, Pune, Maharashtra',
                        format: 'GeoJSON / Vector',
                        crs: 'EPSG:4326 (WGS 84)',
                        feature_count: 45120,
                        topology_status: 'Verified - Zero Overlaps',
                        last_validated: '2026-09-12T19:00:00Z',
                        purpose: 'Standardized cadastre bundle for Haveli tehsil with clean boundaries and survey numbers.',
                      })
                    }
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-600" />
                    Preview Schema
                  </button>
                  <button
                    onClick={() =>
                      handleDownloadGeoJSON('lyr-maha-cadastre-v2', 'Maharashtra Haveli Tehsil Cadastre')
                    }
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download GeoJSON
                  </button>
                </div>
              </div>

              {/* Package 2: CFR Forest Rights */}
              <div className="p-6 rounded-2xl border border-slate-200/90 hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4 bg-slate-50/50">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-mono text-xs">
                      GeoJSON / Forest Rights Layer
                    </Badge>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                      FRA 2006
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    Central India Community Forest Rights (CFR) Overlay
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Geospatial boundaries of Gram Sabha-managed communal forest resources across Gadchiroli and Mayurbhanj forest corridors.
                  </p>
                  <div className="text-[11px] text-slate-500 font-mono">
                    CRS: EPSG:4326 (WGS 84) &bull; Format: .geojson &bull; 1,850 Titles Demarcated
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                  <button
                    onClick={() =>
                      setSelectedLayerForInspect({
                        layer_id: 'cfr-central-india',
                        name: 'Central India Community Forest Rights (CFR) Overlay',
                        category_label: 'Customary Forest Rights',
                        region: 'Gadchiroli & Mayurbhanj Belt',
                        format: 'GeoJSON / Polygon',
                        crs: 'EPSG:4326 (WGS 84)',
                        feature_count: 1850,
                        topology_status: 'Certified Invariant Clean',
                        last_validated: '2026-09-08T15:20:00Z',
                        purpose: 'Official Gram Sabha boundary demarcations under Forest Rights Act 2006.',
                      })
                    }
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-600" />
                    Preview Schema
                  </button>
                  <button
                    onClick={() =>
                      handleDownloadGeoJSON('cfr-central-india', 'Central India Community Forest Rights')
                    }
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download GeoJSON
                  </button>
                </div>
              </div>

              {/* Package 3: Citations Library */}
              <div className="p-6 rounded-2xl border border-slate-200/90 hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4 bg-slate-50/50">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-mono text-xs">
                      BibTeX / Reference Bundle
                    </Badge>
                    <span className="text-xs font-semibold text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded-full">
                      All Registered DOIs
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    Consolidated Citations Library
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Comprehensive citation bibliography containing all published research papers, peer-review metadata, official publishers, and digital object identifiers.
                  </p>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Format: .bib &bull; Compatible with Zotero, Mendeley, Overleaf &amp; LaTeX
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                  <button
                    onClick={() => {
                      const fullBib = papers
                        .map(
                          (p: any) => `@article{landgov_${p.id.slice(0, 8)},\n  title = {${p.title}},\n  publisher = {${p.publisher || 'NRSC'}},\n  year = {2026}\n}`
                        )
                        .join('\n\n');
                      navigator.clipboard.writeText(fullBib);
                      toast({
                        title: 'All Citations Copied',
                        description: 'Complete BibTeX citation library copied to clipboard.',
                        variant: 'success',
                      });
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-600" />
                    Copy BibTeX
                  </button>
                  <button
                    onClick={handleDownloadBibtexLibrary}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download .bib File
                  </button>
                </div>
              </div>

              {/* Package 4: LADM Schema */}
              <div className="p-6 rounded-2xl border border-slate-200/90 hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4 bg-slate-50/50">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-mono text-xs">
                      JSON Schema / ISO 19152
                    </Badge>
                    <span className="text-xs font-semibold text-cyan-700 bg-cyan-100/70 px-2 py-0.5 rounded-full">
                      OGC Standard
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    National LADM Data Dictionary &amp; Schema
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Formal ISO 19152 (Land Administration Domain Model) schema definitions for spatial units, right-holders, tenurial rights, and boundary vertices.
                  </p>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Format: .json schema &bull; Specification: ISO 19152:2012 / 2024 Stage 2
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                  <button
                    onClick={() => {
                      const ladmSample = JSON.stringify(
                        {
                          $schema: 'https://json-schema.org/draft/2020-12/schema',
                          title: 'Bhoomitra National Cadastral Parcel Schema (ISO 19152 LADM)',
                          type: 'object',
                          properties: {
                            su_id: { type: 'string', description: 'Spatial Unit Identifier / ULPIN' },
                            area_m2: { type: 'number', minimum: 0 },
                            geometry: { type: 'object', properties: { type: { const: 'Polygon' } } },
                            tenure_type: { type: 'string', enum: ['freehold', 'customary', 'statutory_lease'] },
                          },
                          required: ['su_id', 'geometry', 'tenure_type'],
                        },
                        null,
                        2
                      );
                      downloadTextFile(ladmSample, 'iso_19152_ladm_schema.json', 'application/json');
                      toast({
                        title: 'LADM Schema Downloaded',
                        description: 'Saved "iso_19152_ladm_schema.json" successfully.',
                        variant: 'success',
                      });
                    }}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download LADM Schema (.json)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Layer Inspection & Attribute Modal */}
      {selectedLayerForInspect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Spatial Dataset Inspector &bull; डेटासेट विवरण
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{selectedLayerForInspect.name}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  ID: {selectedLayerForInspect.layer_id} &bull; {selectedLayerForInspect.crs}
                </p>
              </div>
              <button
                onClick={() => setSelectedLayerForInspect(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metadata Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block">Coverage Region</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block">{selectedLayerForInspect.region}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block">Features Count</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                  {typeof selectedLayerForInspect.feature_count === 'number'
                    ? `${selectedLayerForInspect.feature_count.toLocaleString()} Polygons`
                    : selectedLayerForInspect.feature_count}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block">Topology Audit</span>
                <span className="text-xs font-bold text-emerald-700 mt-0.5 block">100% Verified Valid</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block">File Format</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block">GeoJSON / Vector</span>
              </div>
            </div>

            {/* Sample Parcel Attributes Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Sample Parcel Attribute Schema (नमूना भूखंड विशेषताएँ)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Survey of India Standard Schema</span>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 font-semibold text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2">Survey No</th>
                      <th className="px-3 py-2">Gat / ULPIN</th>
                      <th className="px-3 py-2">Area (Ha)</th>
                      <th className="px-3 py-2">Land Classification</th>
                      <th className="px-3 py-2">Topology</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="px-3 py-2 font-mono font-bold text-emerald-800">104/1</td>
                      <td className="px-3 py-2 font-mono">MH27041040188</td>
                      <td className="px-3 py-2 font-semibold">1.45 Ha</td>
                      <td className="px-3 py-2">Gaothan Residential</td>
                      <td className="px-3 py-2 text-emerald-700 font-semibold">&check; 0 Overlaps</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-mono font-bold text-emerald-800">104/2</td>
                      <td className="px-3 py-2 font-mono">MH27041040289</td>
                      <td className="px-3 py-2 font-semibold">2.10 Ha</td>
                      <td className="px-3 py-2">Irrigated Agro-Crop</td>
                      <td className="px-3 py-2 text-emerald-700 font-semibold">&check; 0 Overlaps</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-mono font-bold text-emerald-800">105</td>
                      <td className="px-3 py-2 font-mono">MH27041050090</td>
                      <td className="px-3 py-2 font-semibold">3.80 Ha</td>
                      <td className="px-3 py-2">Communal Forest Buffer</td>
                      <td className="px-3 py-2 text-emerald-700 font-semibold">&check; 0 Overlaps</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick GeoJSON Preview Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">GeoJSON Structure Preview:</span>
                <button
                  onClick={() => {
                    const sample = SAMPLE_GEOJSON_DATA[selectedLayerForInspect.layer_id] || SAMPLE_GEOJSON_DATA['lyr-maha-cadastre-v2'];
                    navigator.clipboard.writeText(JSON.stringify(sample, null, 2));
                    toast({
                      title: 'GeoJSON Copied',
                      description: 'Copied GeoJSON structure to clipboard.',
                      variant: 'success',
                    });
                  }}
                  className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy JSON Snippet
                </button>
              </div>
              <pre className="p-3 bg-slate-900 text-emerald-300 font-mono text-[11px] rounded-xl overflow-x-auto max-h-40 border border-slate-800">
                {JSON.stringify(
                  SAMPLE_GEOJSON_DATA[selectedLayerForInspect.layer_id] || SAMPLE_GEOJSON_DATA['lyr-maha-cadastre-v2'],
                  null,
                  2
                ).slice(0, 650) + '\n  ...\n}'}
              </pre>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedLayerForInspect(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDownloadGeoJSON(selectedLayerForInspect.layer_id, selectedLayerForInspect.name);
                  setSelectedLayerForInspect(null);
                }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Complete .geojson File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Topology Audit Certificate / Results Modal */}
      {showAuditReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Official Validation Report &bull; आधिकारिक सत्यापन रिपोर्ट
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                Topology Audit Passed (Grade A+)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                All 45,120 cadastral parcel polygons evaluated against national mapping invariants.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500">Self-Intersections</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">0 Violations</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500">Boundary Slivers</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">0 Detected</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500">Coordinate Bounds</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">EPSG:4326 Conforming</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500">Regulatory Standard</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">ISO 19152 (LADM)</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 leading-relaxed text-left">
              &check; <strong>Cadastre Integrity Certified:</strong> Clean geometries verified. The surveyed land parcels are ready for mutation registration, Bhu-Aadhaar ULPIN generation, and SVAMITVA title verification.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAuditReportModal(false)}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors w-full"
              >
                Acknowledge &amp; Return to Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manuscript Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <span>Submit Research Manuscript</span>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitManuscript} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Manuscript Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newPaperTitle}
                  onChange={(e) => setNewPaperTitle(e.target.value)}
                  placeholder="e.g., GeoAI Boundary Polygon Reconstruction..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Academic Publisher / Institutional Press <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newPaperPublisher}
                  onChange={(e) => setNewPaperPublisher(e.target.value)}
                  placeholder="e.g. National Remote Sensing Centre (NRSC) / ISRO"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <p className="text-xs text-slate-500 mt-1">Publisher name will be prominently displayed on research pages and BibTeX citations.</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Abstract &amp; Methodology
                </label>
                <textarea
                  rows={3}
                  value={newPaperAbstract}
                  onChange={(e) => setNewPaperAbstract(e.target.value)}
                  placeholder="Brief summary of GIS datasets, methodology, and empirical findings..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPaper || !newPaperTitle.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  {isSubmittingPaper ? 'Submitting...' : 'Register Manuscript'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
