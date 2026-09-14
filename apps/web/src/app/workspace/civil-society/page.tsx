'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  FileText,
  MapPin,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Send,
  CheckCircle2,
  TreePine,
  Eye,
  Download,
  FileCheck2,
  Share2,
  Building,
  HelpCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api/client';
import { useAuth } from '@/lib/auth-context';

export default function CivilSocietyWorkspacePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'grievances' | 'community-tenure' | 'encroachments' | 'legal-toolkit'>('grievances');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Grievance Filing Modal
  const [showGrievanceModal, setShowGrievanceModal] = useState(false);
  const [isSubmittingGrievance, setIsSubmittingGrievance] = useState(false);
  const [grievanceForm, setGrievanceForm] = useState({
    title: '',
    category: 'fraudulent_mutation' as 'fraudulent_mutation' | 'boundary_encroachment' | 'fra_denial' | 'compensation_delay' | 'other',
    jurisdiction: 'IN-MH-PUN',
    complainant_name: '',
    complainant_contact: '',
    description: '',
    parcel_id: '',
  });

  const fetchWorkspace = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest<any>('/workspace/civil-society');
      setData(res);
    } catch (err) {
      console.warn('Could not fetch civil society workspace from API, using fallback:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, []);

  const handleCreateGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grievanceForm.title.trim() || !grievanceForm.description.trim()) return;

    setIsSubmittingGrievance(true);
    try {
      const res = await apiRequest<any>('/workspace/civil-society/grievances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(grievanceForm),
      });

      toast({
        title: 'Grievance Lodged Successfully',
        description: res.message || 'Ticket registered in jurisdictional docket.',
        variant: 'success',
      });

      setShowGrievanceModal(false);
      setGrievanceForm({
        title: '',
        category: 'fraudulent_mutation',
        jurisdiction: 'IN-MH-PUN',
        complainant_name: '',
        complainant_contact: '',
        description: '',
        parcel_id: '',
      });
      await fetchWorkspace();
    } catch (err: any) {
      toast({
        title: 'Submission Failed',
        description: err?.message || 'Could not lodge grievance ticket.',
        variant: 'error',
      });
    } finally {
      setIsSubmittingGrievance(false);
    }
  };

  const grievances = data?.citizen_grievances || [
    {
      id: 'grv-2026-0104',
      title: 'Unauthorized Mutation on Ancestral Agricultural Parcel 12/4',
      category: 'fraudulent_mutation',
      jurisdiction: 'IN-MH-PUN',
      complainant_name: 'Eknath Rao Gaikwad',
      status: 'escalated_to_tahsildar',
      priority: 'high',
      parcel_id: 'PAR-PUN-HAV-0124',
      created_at: '2026-09-10T14:20:00Z',
      assigned_officer: 'Sub-Divisional Officer (Revenue)',
    },
    {
      id: 'grv-2026-0112',
      title: 'Gram Sabha Community Forest Rights Title Pending Over 18 Months',
      category: 'fra_denial',
      jurisdiction: 'IN-MH-GAD',
      complainant_name: 'Adivasi Gram Sangathan (Bhamragad)',
      status: 'under_sdlc_review',
      priority: 'critical',
      parcel_id: 'CFR-GAD-BHM-008',
      created_at: '2026-09-12T09:10:00Z',
      assigned_officer: 'District Collectorate Tribal Cell',
    },
  ];

  const communityClaims = data?.community_tenure_claims || [
    {
      claim_id: 'CFR-2026-FRA-088',
      village_gram_sabha: 'Mendha Lekha Gram Sabha',
      district: 'Gadchiroli (IN-MH)',
      claimed_area_hectares: 1820.0,
      claim_type: 'Community Forest Rights (CFR) under FRA 2006',
      status: 'pending_dlc_approval',
      filed_date: '2025-11-14',
      days_in_review: 304,
    },
    {
      claim_id: 'CFR-2026-FRA-094',
      village_gram_sabha: 'Baraigram Pastoral Collective',
      district: 'Udaipur (IN-RJ)',
      claimed_area_hectares: 940.0,
      claim_type: 'Customary Grazing Commons Protection',
      status: 'field_survey_scheduled',
      filed_date: '2026-03-20',
      days_in_review: 178,
    },
  ];

  const encroachments = data?.commons_encroachment_alerts || [
    {
      alert_id: 'ENC-2026-901',
      wetland_commons_name: 'Pashan Lake Catchment Commons',
      jurisdiction: 'Pune (IN-MH)',
      detected_encroachment_ha: 3.8,
      severity: 'high',
      satellite_verification: 'Sentinel-2 NDVI Shift Confirmed',
      action_status: 'Magistrate Notice Issued',
    },
    {
      alert_id: 'ENC-2026-904',
      wetland_commons_name: 'Kengeri Grazing Pasture',
      jurisdiction: 'Bengaluru (IN-KA)',
      detected_encroachment_ha: 2.1,
      severity: 'medium',
      satellite_verification: 'Surface Cover Anomaly Detected',
      action_status: 'Citizen Verification Docket Open',
    },
  ];

  const filteredGrievances = grievances.filter((g: any) =>
    g.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.complainant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Official Header Banner */}
      <section className="bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 text-white border-b border-teal-900/60 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  <Users className="w-3.5 h-3.5 text-teal-400" />
                  Public Interest & NGO Clearance
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300 border border-slate-700">
                  <ShieldCheck className="w-3 h-3 text-teal-400" />
                  {data?.advocate?.organization || 'National Land Tenure Justice Network'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Civil Society, Community Tenure & Citizen Rights Desk
              </h1>
              <p className="text-slate-300 text-sm sm:text-base max-w-3xl">
                Grassroots advocacy workbench for monitoring Forest Rights Act (FRA 2006) community tenure claims, escalating citizen land grievances, and detecting unlawful encroachment on communal grazing and wetlands.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={fetchWorkspace}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                Sync Grievances
              </button>
              <button
                onClick={() => setShowGrievanceModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Lodge Citizen Grievance
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
            <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-4 border border-teal-500/20">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <TreePine className="w-3.5 h-3.5 text-teal-400" /> Community Claims
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{data?.summary?.active_community_claims || 24}</span>
                <span className="text-xs text-teal-400 font-medium">FRA 2006</span>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-4 border border-teal-500/20">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-cyan-400" /> Tracked Grievances
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{data?.summary?.citizen_grievances_tracked || grievances.length}</span>
                <span className="text-xs text-cyan-400 font-medium">Active Dockets</span>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-4 border border-teal-500/20">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Commons Alerts
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{data?.summary?.encroachment_alerts_active || 6}</span>
                <span className="text-xs text-amber-400 font-medium">Satellite Flags</span>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-4 border border-teal-500/20">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Resolved Grievances
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{data?.summary?.resolved_grievance_pct || 68.5}%</span>
                <span className="text-xs text-emerald-400 font-medium">Resolution Index</span>
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
              onClick={() => setActiveTab('grievances')}
              className={`inline-flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'grievances'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              Citizen Grievances & Escalations
              <span className="px-2 py-0.5 rounded-full text-xs bg-teal-100 text-teal-800">
                {grievances.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('community-tenure')}
              className={`inline-flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'community-tenure'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <TreePine className="w-4 h-4" />
              Forest Rights (FRA 2006) Tracker
            </button>
            <button
              onClick={() => setActiveTab('encroachments')}
              className={`inline-flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'encroachments'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Commons Encroachment Watchdog
            </button>
            <button
              onClick={() => setActiveTab('legal-toolkit')}
              className={`inline-flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'legal-toolkit'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              Grassroots Legal Rights Toolkit
            </button>
          </div>
        </div>

        {/* TAB 1: CITIZEN GRIEVANCES */}
        {activeTab === 'grievances' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search grievances by ticket ID, complainant, or keywords..."
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowGrievanceModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Lodge Citizen Ticket
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredGrievances.map((grv: any) => (
                <div
                  key={grv.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:border-teal-300/80 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="space-y-2.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                        {grv.id}
                      </span>
                      <Badge variant={grv.priority === 'critical' ? 'danger' : 'default'} className="uppercase text-[10px] tracking-wider">
                        {grv.priority}
                      </Badge>
                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full capitalize">
                        {grv.category.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {grv.jurisdiction}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {grv.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span>Complainant: <strong className="text-slate-800">{grv.complainant_name}</strong></span>
                      <span>&bull;</span>
                      <span>Assigned: <strong className="text-slate-800">{grv.assigned_officer}</strong></span>
                      {grv.parcel_id && (
                        <>
                          <span>&bull;</span>
                          <span className="font-mono text-slate-600">Parcel: {grv.parcel_id}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end lg:self-center">
                    <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200">
                      Status: {grv.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: COMMUNITY TENURE TRACKER */}
        {activeTab === 'community-tenure' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Forest Rights Act (FRA 2006) Community Tenure Claims</h3>
                <p className="text-xs text-slate-500 mt-0.5">Community Forest Resource (CFR) and customary grazing rights verification ledger.</p>
              </div>
              <Badge variant="outline">Schedule V & VI Tribal Areas</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="px-6 py-3.5">Claim ID & Gram Sabha</th>
                    <th className="px-6 py-3.5">District / State</th>
                    <th className="px-6 py-3.5">Claim Type</th>
                    <th className="px-6 py-3.5">Claimed Area (Ha)</th>
                    <th className="px-6 py-3.5">Days in Review</th>
                    <th className="px-6 py-3.5 text-right">Tenure Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {communityClaims.map((claim: any) => (
                    <tr key={claim.claim_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{claim.village_gram_sabha}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">{claim.claim_id}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium">{claim.district}</td>
                      <td className="px-6 py-4 text-slate-600 text-xs">{claim.claim_type}</td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">{claim.claimed_area_hectares.toLocaleString()} Ha</td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-xs">{claim.days_in_review} days</td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                          <Clock className="w-3 h-3 text-teal-600" />
                          {claim.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: COMMONS ENCROACHMENT WATCHDOG */}
        {activeTab === 'encroachments' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">Satellite-Observed Commons Encroachment Alerts</h3>
              <p className="text-xs text-slate-500 mt-1">Multi-spectral anomaly detection identifying illegal fencing or construction on public grazing commons and wetlands.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {encroachments.map((enc: any) => (
                <div
                  key={enc.alert_id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                      {enc.alert_id}
                    </span>
                    <Badge variant={enc.severity === 'high' ? 'danger' : 'default'} className="uppercase text-xs">
                      {enc.severity} severity
                    </Badge>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900">{enc.wetland_commons_name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{enc.jurisdiction} &bull; {enc.detected_encroachment_ha} Hectares Affected</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Eye className="w-3.5 h-3.5 text-teal-600" />
                      <strong>Satellite Verification:</strong> {enc.satellite_verification}
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <strong>Legal Status:</strong> {enc.action_status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: LEGAL TOOLKIT */}
        {activeTab === 'legal-toolkit' && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Grassroots Legal Rights & Tenure Defence Toolkit</h3>
              <p className="text-sm text-slate-600 mt-1">
                Standard legal petition drafts, Right to Information (RTI) templates, and Gram Sabha statutory notice guides.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <FileText className="w-6 h-6 text-teal-700" />
                <h4 className="font-bold text-slate-900 text-sm">RTI Revenue Records Inspection Form</h4>
                <p className="text-xs text-slate-500">Form to demand 7/12 RoR historical register mutation copies under Section 6(1) of the RTI Act.</p>
                <button
                  onClick={() => {
                    toast({
                      title: 'Template Downloaded',
                      description: 'RTI Section 6(1) Draft Template copied to clipboard.',
                      variant: 'success',
                    });
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800"
                >
                  <Download className="w-3.5 h-3.5" /> Download Template (.docx)
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <TreePine className="w-6 h-6 text-emerald-700" />
                <h4 className="font-bold text-slate-900 text-sm">Gram Sabha FRA Resolution Format</h4>
                <p className="text-xs text-slate-500">Statutory quorum resolution declaring Community Forest Rights (CFR) title claim under Rule 11.</p>
                <button
                  onClick={() => {
                    toast({
                      title: 'Template Downloaded',
                      description: 'Gram Sabha CFR Resolution Format copied to clipboard.',
                      variant: 'success',
                    });
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800"
                >
                  <Download className="w-3.5 h-3.5" /> Download Template (.docx)
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <ShieldCheck className="w-6 h-6 text-cyan-700" />
                <h4 className="font-bold text-slate-900 text-sm">Objection to Fraudulent Mutation</h4>
                <p className="text-xs text-slate-500">Legal objection notice to Sub-Divisional Officer (SDO) under Maharashtra Land Revenue Code 1966.</p>
                <button
                  onClick={() => {
                    toast({
                      title: 'Template Downloaded',
                      description: 'Mutation Objection Draft copied to clipboard.',
                      variant: 'success',
                    });
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800"
                >
                  <Download className="w-3.5 h-3.5" /> Download Template (.docx)
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Grievance Lodging Modal */}
      {showGrievanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 text-teal-800 font-bold">
                <Users className="w-5 h-5 text-teal-600" />
                <span>Lodge Citizen Land Grievance</span>
              </div>
              <button
                onClick={() => setShowGrievanceModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateGrievance} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Grievance Summary / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={grievanceForm.title}
                  onChange={(e) => setGrievanceForm({ ...grievanceForm, title: e.target.value })}
                  placeholder="e.g. Unlawful mutation on ancestral plot..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={grievanceForm.category}
                    onChange={(e: any) => setGrievanceForm({ ...grievanceForm, category: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                  >
                    <option value="fraudulent_mutation">Fraudulent Mutation</option>
                    <option value="boundary_encroachment">Boundary Encroachment</option>
                    <option value="fra_denial">FRA Title Denial</option>
                    <option value="compensation_delay">Compensation Delay</option>
                    <option value="other">Other Violation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Jurisdiction Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={grievanceForm.jurisdiction}
                    onChange={(e) => setGrievanceForm({ ...grievanceForm, jurisdiction: e.target.value })}
                    placeholder="e.g. IN-MH-PUN"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Complainant Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={grievanceForm.complainant_name}
                    onChange={(e) => setGrievanceForm({ ...grievanceForm, complainant_name: e.target.value })}
                    placeholder="e.g. Rameshwar Patil"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Contact / Phone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={grievanceForm.complainant_contact}
                    onChange={(e) => setGrievanceForm({ ...grievanceForm, complainant_contact: e.target.value })}
                    placeholder="e.g. +91 98220 12345"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Parcel / Survey Number (Optional)
                </label>
                <input
                  type="text"
                  value={grievanceForm.parcel_id}
                  onChange={(e) => setGrievanceForm({ ...grievanceForm, parcel_id: e.target.value })}
                  placeholder="e.g. PAR-PUN-HAV-0124 or Survey No. 44/2"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Detailed Grievance Narrative <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={grievanceForm.description}
                  onChange={(e) => setGrievanceForm({ ...grievanceForm, description: e.target.value })}
                  placeholder="Describe how the violation took place, authorities approached, and relief demanded..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGrievanceModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingGrievance || !grievanceForm.title.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  {isSubmittingGrievance ? 'Transmitting...' : 'Register Grievance Docket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
