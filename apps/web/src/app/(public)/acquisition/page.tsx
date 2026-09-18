'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Compass,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  MapPin,
  FileText,
  IndianRupee,
  Users,
  ShieldAlert,
  Building,
  ArrowRight,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Download,
  Filter,
} from 'lucide-react';
import { apiRequest } from '@/lib/api/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProjectLifecycleStage {
  stage_number: number;
  stage_name: string;
  statutory_act: string;
  section_in_progress: string;
}

interface AcquisitionProject {
  id: string;
  title: string;
  project_type: string;
  requiring_body: string;
  acquiring_authority: string;
  state: string;
  districts_covered: string[];
  total_alignment_length_km: number;
  total_land_required_ha: number;
  land_notified_ha: number;
  land_possessed_ha: number;
  possession_percent: number;
  current_lifecycle_stage: ProjectLifecycleStage;
  total_compensation_assessed_crores: number;
  compensation_disbursed_crores: number;
  disbursement_percent: number;
  affected_families_count: number;
  displaced_families_count: number;
  families_resettled_count: number;
  r_and_r_status: string;
  delay_risk_score: number;
  delay_risk_category: string;
  predicted_delay_months: number;
  target_completion_date: string;
  gis_corridor_coordinates: [number, number][];
}

interface DelayDriver {
  factor: string;
  impact_percent: number;
  status: string;
  description: string;
}

interface DelayPrediction {
  project_id: string;
  project_title: string;
  delay_risk_score: number;
  delay_risk_category: string;
  predicted_delay_months: number;
  delay_probability_percent: number;
  current_stage: ProjectLifecycleStage;
  model_version: string;
  explainable_delay_drivers: DelayDriver[];
  actionable_recommendations: string[];
  timeline_forecast: {
    scheduled_completion: string;
    statutory_risk_buffer_days: number;
    critical_path_milestone: string;
  };
}

export default function AcquisitionPage() {
  const [projects, setProjects] = useState<AcquisitionProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('proj-dfc-eastern-corridor');
  const [activeProject, setActiveProject] = useState<AcquisitionProject | null>(null);
  const [delayPrediction, setDelayPrediction] = useState<DelayPrediction | null>(null);
  const [lifecycleStages, setLifecycleStages] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadAcquisitionData() {
      try {
        const [projData, metricsData] = await Promise.all([
          apiRequest<any>('/acquisition/projects'),
          apiRequest<any>('/acquisition/metrics'),
        ]);
        if (projData?.projects) {
          setProjects(projData.projects);
          setLifecycleStages(projData.standard_lifecycle_stages || []);
          const defaultProj =
            projData.projects.find((p: any) => p.id === selectedProjectId) || projData.projects[0];
          setActiveProject(defaultProj);
          if (defaultProj) loadDelayPrediction(defaultProj.id);
        }
        if (metricsData) setMetrics(metricsData);
      } catch (err) {
        console.error('Failed to load acquisition data:', err);
      }
    }
    loadAcquisitionData();
  }, []);

  const loadDelayPrediction = async (projectId: string) => {
    setIsLoading(true);
    try {
      const pred = await apiRequest<DelayPrediction>(`/acquisition/predict-delay/${projectId}`);
      setDelayPrediction(pred);
    } catch (err) {
      console.error('Failed to load delay prediction:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProject = (proj: AcquisitionProject) => {
    setActiveProject(proj);
    setSelectedProjectId(proj.id);
    loadDelayPrediction(proj.id);
  };

  const filteredProjects = projects.filter((p) => {
    if (filterType === 'all') return true;
    return p.project_type.toLowerCase().includes(filterType.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-teal-950 to-emerald-950 text-white border-b border-teal-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                <Compass className="w-3.5 h-3.5" />
                Ministry of Rural Development • Department of Land Resources (DoLR)
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                National Land Acquisition & Management System (LAMS)
              </h1>
              <p className="text-sm sm:text-base text-slate-300">
                End-to-end digital lifecycle monitoring under the <strong>RFCTLARR Act 2013</strong> integrated with <strong>AI Predictive Analytics</strong> for early detection and mitigation of infrastructure project delays.
              </p>
            </div>

            {/* Project Quick Selector Dropdown */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 min-w-[300px]">
              <label className="block text-xs font-bold text-teal-300 uppercase tracking-wider mb-2">
                Active Strategic Infrastructure Project
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => {
                  const proj = projects.find((p) => p.id === e.target.value);
                  if (proj) handleSelectProject(proj);
                }}
                className="w-full px-3 py-2 bg-slate-900 text-white text-sm rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 font-medium"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
              {activeProject && (
                <div className="mt-2.5 flex items-center justify-between text-xs text-slate-300 border-t border-white/10 pt-2">
                  <span>Req Body: <strong className="text-teal-300">{activeProject.requiring_body.split('(')[0]}</strong></span>
                  <Badge
                    className={
                      activeProject.delay_risk_category === 'Critical'
                        ? 'bg-rose-500 text-white'
                        : activeProject.delay_risk_category === 'High'
                        ? 'bg-amber-500 text-white'
                        : 'bg-emerald-500 text-slate-950 font-bold'
                    }
                  >
                    {activeProject.delay_risk_category} Risk
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* National KPI Metrics Bar */}
      {metrics && (
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase">Total Land Required</span>
                <p className="text-lg font-bold text-slate-900">{metrics.total_land_required_ha.toLocaleString()} Ha</p>
                <span className="text-[11px] text-teal-700 font-medium">Possessed: {metrics.overall_possession_rate_percent}%</span>
              </div>
              <div className="p-3 bg-teal-50 rounded-xl border border-teal-100">
                <span className="text-xs font-semibold text-teal-800 uppercase">Assessed Compensation</span>
                <p className="text-lg font-bold text-teal-950">₹{metrics.total_compensation_assessed_cr} Cr</p>
                <span className="text-[11px] text-teal-700 font-medium">Under Section 23 Award</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-xs font-semibold text-emerald-800 uppercase">DBT Disbursed</span>
                <p className="text-lg font-bold text-emerald-950">₹{metrics.total_compensation_disbursed_cr} Cr</p>
                <span className="text-[11px] text-emerald-700 font-bold">{metrics.dbt_disbursement_rate_percent}% Disbursed</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <span className="text-xs font-semibold text-blue-800 uppercase">Families Resettled</span>
                <p className="text-lg font-bold text-blue-950">{metrics.total_resettled_families.toLocaleString()} Families</p>
                <span className="text-[11px] text-blue-700">{metrics.r_and_r_completion_percent}% R&R Completion</span>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                <span className="text-xs font-semibold text-rose-800 uppercase">High-Risk Delay Watch</span>
                <p className="text-lg font-bold text-rose-950">{metrics.high_risk_delayed_projects} Projects</p>
                <span className="text-[11px] text-rose-700 font-medium">Require Ministerial Intervention</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {activeProject && (
          <>
            {/* Section 1: End-to-End 9-Stage RFCTLARR Lifecycle Visualizer */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    RFCTLARR 9-Stage Statutory Acquisition Progress
                  </h3>
                  <p className="text-xs text-slate-500">
                    Current Active Stage: <strong className="text-teal-700">{activeProject.current_lifecycle_stage.stage_name}</strong> ({activeProject.current_lifecycle_stage.section_in_progress})
                  </p>
                </div>
                <Badge variant="outline" className="text-xs text-slate-600 border-slate-300">
                  Target Handover: {activeProject.target_completion_date}
                </Badge>
              </div>

              {/* 9-Stage Progress Steps */}
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2 pt-2">
                {lifecycleStages.map((stageItem) => {
                  const isPassed = stageItem.stage < activeProject.current_lifecycle_stage.stage_number;
                  const isCurrent = stageItem.stage === activeProject.current_lifecycle_stage.stage_number;

                  return (
                    <div
                      key={stageItem.stage}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        isPassed
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                          : isCurrent
                          ? 'bg-teal-900 text-white border-teal-700 shadow-md ring-2 ring-teal-400/40'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-center mb-1">
                        {isPassed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isCurrent ? 'bg-teal-400 text-slate-950' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {stageItem.stage}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold line-clamp-2 leading-tight">
                        {stageItem.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 2: AI Predictive Delay Analytics & GIS Alignment Corridor */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* AI Predictive Delay Engine Box (6 Cols) */}
              <div className="lg:col-span-6 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-teal-700" />
                      <div>
                        <h3 className="text-base font-bold text-slate-900">AI Predictive Delay Analytics</h3>
                        <p className="text-xs text-slate-500">Model: GBDT Multi-Variable Risk Forecaster</p>
                      </div>
                    </div>
                    {delayPrediction && (
                      <Badge
                        className={
                          delayPrediction.delay_risk_score > 70
                            ? 'bg-rose-100 text-rose-800 border-rose-300 font-bold'
                            : delayPrediction.delay_risk_score > 40
                            ? 'bg-amber-100 text-amber-800 border-amber-300 font-bold'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                        }
                      >
                        {delayPrediction.delay_risk_score}/100 Risk Score
                      </Badge>
                    )}
                  </div>

                  {delayPrediction ? (
                    <>
                      {/* Prediction Summary KPI Strip */}
                      <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
                        <div>
                          <span className="text-[11px] text-slate-500 uppercase font-bold block">Delay Probability</span>
                          <strong className="text-base font-mono text-rose-600">
                            {delayPrediction.delay_probability_percent}%
                          </strong>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500 uppercase font-bold block">Forecasted Slip</span>
                          <strong className="text-base font-mono text-amber-700">
                            +{delayPrediction.predicted_delay_months} Months
                          </strong>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500 uppercase font-bold block">Risk Buffer</span>
                          <strong className="text-base font-mono text-slate-900">
                            {delayPrediction.timeline_forecast.statutory_risk_buffer_days} Days
                          </strong>
                        </div>
                      </div>

                      {/* Explainable AI Key Delay Drivers */}
                      <div className="space-y-2.5">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                          Explainable AI: Key Delay Drivers & Friction Points
                        </span>
                        <div className="space-y-2">
                          {delayPrediction.explainable_delay_drivers.map((driver, idx) => (
                            <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-800">{driver.factor}</span>
                                <span className="font-bold text-rose-700">{driver.impact_percent}% Contribution</span>
                              </div>
                              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-rose-500 h-full rounded-full"
                                  style={{ width: `${driver.impact_percent * 2}%` }}
                                />
                              </div>
                              <p className="text-[11px] text-slate-500">{driver.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actionable Recommendations for Administrators */}
                      <div className="p-4 bg-teal-950 text-white rounded-xl space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-teal-300 uppercase tracking-wider">
                          <Sparkles className="w-4 h-4" />
                          Proactive Mitigation Recommendations
                        </div>
                        <ul className="text-xs text-slate-200 space-y-1.5 list-disc list-inside">
                          {delayPrediction.actionable_recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6 text-xs text-slate-500">
                      Loading AI predictive delay model calculations...
                    </div>
                  )}
                </div>
              </div>

              {/* GIS Project Corridor & Compensation Status (6 Cols) */}
              <div className="lg:col-span-6 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-teal-700" />
                      <div>
                        <h3 className="text-base font-bold text-slate-900">GIS Corridor Alignment & Parcel Status</h3>
                        <p className="text-xs text-slate-500">Alignment Length: {activeProject.total_alignment_length_km} km</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs text-teal-700 border-teal-300">
                      {activeProject.districts_covered.join(', ')}
                    </Badge>
                  </div>

                  {/* Simulated GIS Corridor Canvas */}
                  <div className="relative h-56 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center p-4">
                    <div
                      className="absolute inset-0 opacity-65 bg-cover bg-center"
                      style={{
                        backgroundImage:
                          'radial-gradient(circle at 50% 50%, rgba(20, 184, 166, 0.3) 0%, rgba(15, 23, 42, 0.95) 80%), url("https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80")',
                      }}
                    />

                    {/* Vector Linear Corridor Line */}
                    <svg className="absolute inset-0 w-full h-full stroke-teal-400 stroke-[3] fill-none" viewBox="0 0 500 220">
                      <path d="M 40 180 Q 150 140 260 110 T 460 40" strokeDasharray="6 3" />
                      <circle cx="40" cy="180" r="6" fill="#14b8a6" />
                      <circle cx="260" cy="110" r="6" fill="#3b82f6" />
                      <circle cx="460" cy="40" r="6" fill="#10b981" />
                    </svg>

                    <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-700 px-2.5 py-1 rounded text-[11px] text-slate-300 backdrop-blur">
                      <span>Corridor: {activeProject.title.slice(0, 32)}...</span>
                    </div>

                    <div className="absolute bottom-3 right-3 bg-slate-900/90 border border-slate-700 px-2.5 py-1 rounded text-[11px] text-emerald-400 font-mono backdrop-blur">
                      Possession: {activeProject.possession_percent}%
                    </div>
                  </div>

                  {/* Compensation & R&R Cards */}
                  <div className="grid grid-cols-2 gap-3.5 text-xs">
                    <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-xl space-y-1">
                      <span className="text-emerald-800 font-bold uppercase block text-[11px]">
                        Compensation Direct Benefit Transfer (DBT)
                      </span>
                      <div className="flex justify-between text-slate-700 pt-1">
                        <span>Assessed:</span>
                        <strong>₹{activeProject.total_compensation_assessed_crores} Cr</strong>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Disbursed:</span>
                        <strong className="text-emerald-800 font-bold">₹{activeProject.compensation_disbursed_crores} Cr</strong>
                      </div>
                      <div className="w-full bg-emerald-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                        <div
                          className="bg-emerald-600 h-full rounded-full"
                          style={{ width: `${activeProject.disbursement_percent}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl space-y-1">
                      <span className="text-blue-800 font-bold uppercase block text-[11px]">
                        Rehabilitation & Resettlement (R&R)
                      </span>
                      <div className="flex justify-between text-slate-700 pt-1">
                        <span>Affected Families:</span>
                        <strong>{activeProject.affected_families_count}</strong>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Displaced / Resettled:</span>
                        <strong className="text-blue-900 font-bold">
                          {activeProject.families_resettled_count} / {activeProject.displaced_families_count}
                        </strong>
                      </div>
                      <p className="text-[10px] text-blue-700 mt-1 truncate">{activeProject.r_and_r_status}</p>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <Link
                      href={`/maps?lat=${activeProject.gis_corridor_coordinates[0][1]}&lng=${activeProject.gis_corridor_coordinates[0][0]}&zoom=12`}
                      className="flex-1 inline-flex items-center justify-center text-xs border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold py-2 px-3 rounded-lg shadow-sm transition-colors"
                    >
                      Open Corridor in Full GIS
                      <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                    </Link>
                    <Link
                      href="/dashboard"
                      className="flex-1 inline-flex items-center justify-center text-xs bg-teal-800 hover:bg-teal-900 text-white font-bold py-2 px-3 rounded-lg shadow-sm transition-colors"
                    >
                      View National Analytics
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
}
