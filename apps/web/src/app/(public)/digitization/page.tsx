'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  FileSpreadsheet,
  Languages,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Search,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Download,
  Check,
  X,
  Edit3,
  Building2,
  Sliders,
  Layers,
  ArrowRight,
  Database,
  BarChart2,
  FileText,
} from 'lucide-react';
import { apiRequest } from '@/lib/api/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ExtractedField {
  value: string;
  confidence: number;
  bbox?: [number, number, number, number];
}

interface DigitizedRecord {
  id: string;
  title: string;
  state: string;
  district: string;
  tehsil: string;
  village: string;
  document_type: string;
  original_language: string;
  scan_url: string;
  scanned_at: string;
  verification_status: 'pending_review' | 'verified' | 'flagged' | 'approved';
  overall_confidence: number;
  extracted_fields: Record<string, ExtractedField>;
  validation_warnings: string[];
  assigned_verifier: string;
}

interface StateProgress {
  state: string;
  districts_total: number;
  total_records_lakhs: number;
  digitized_percent: number;
  ocr_accuracy_percent: number;
  pending_verification: number;
}

export default function DigitizationPage() {
  const [records, setRecords] = useState<DigitizedRecord[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string>('doc-ror-up-01');
  const [activeRecord, setActiveRecord] = useState<DigitizedRecord | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [metrics, setMetrics] = useState<{ national_summary: any; states_progress: StateProgress[] } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isProcessing, setIsProcessing] = useState(false);
  const [highlightedField, setHighlightedField] = useState<string | null>(null);
  const [editingFields, setEditingFields] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    async function loadDigitizationData() {
      try {
        const [recordsData, metricsData] = await Promise.all([
          apiRequest<any>('/digitization/records'),
          apiRequest<any>('/digitization/metrics'),
        ]);
        if (recordsData?.records) {
          setRecords(recordsData.records);
          setActiveRecord(recordsData.records[0] || null);
        }
        if (metricsData) {
          setMetrics(metricsData);
        }
      } catch (err) {
        console.error('Failed to load digitization data:', err);
      }
    }
    loadDigitizationData();
  }, []);

  const handleSelectRecord = (rec: DigitizedRecord) => {
    setActiveRecord(rec);
    setSelectedRecordId(rec.id);
    setHighlightedField(null);
    setEditingFields({});
  };

  const handleVerifyDecision = async (decision: 'approved' | 'flagged') => {
    if (!activeRecord) return;
    setIsProcessing(true);
    try {
      await apiRequest('/digitization/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          record_id: activeRecord.id,
          decision,
          verifier_name: 'Authorized Revenue Official',
          corrected_fields: editingFields,
          remarks: decision === 'approved' ? 'Matched with field inspection' : 'Flagged for ground check',
        }),
      });

      // Update local state
      setActiveRecord((prev) => (prev ? { ...prev, verification_status: decision } : null));
      setRecords((prev) =>
        prev.map((r) => (r.id === activeRecord.id ? { ...r, verification_status: decision } : r))
      );

      toast({
        title: decision === 'approved' ? 'Record Approved' : 'Record Flagged for Audit',
        description: `Land record ${activeRecord.title} has been marked as ${decision}.`,
        variant: decision === 'approved' ? 'success' : 'warning',
      });
    } catch (err: any) {
      toast({
        title: 'Action Failed',
        description: err?.message || 'Could not verify record.',
        variant: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredRecords = records.filter((r) => {
    if (selectedLanguage === 'all') return true;
    return r.original_language.toLowerCase().includes(selectedLanguage.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white border-b border-indigo-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                <Sparkles className="w-3.5 h-3.5" />
                Digital India Land Records Modernization Programme (DILRMP) • DoLR
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Intelligent Land Record Digitization & Validation Studio
              </h1>
              <p className="text-sm sm:text-base text-slate-300">
                AI-powered multilingual Optical Character Recognition (OCR), NLP entity extraction, automated business rules validation, and human-in-the-loop verification for legacy land registers, Satbara, Khatoni, and cadastral documents.
              </p>
            </div>

            {/* Quick Metrics Badge */}
            {metrics?.national_summary && (
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 min-w-[260px] text-xs space-y-1.5">
                <span className="font-bold text-indigo-300 uppercase tracking-wide block">
                  National DILRMP Scale
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-300">Total Scanned:</span>
                  <strong className="text-white font-mono">{metrics.national_summary.total_records_scanned_lakhs} Lakh Records</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Average OCR Accuracy:</span>
                  <strong className="text-emerald-300 font-mono">{metrics.national_summary.national_average_ocr_accuracy}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Indic Languages:</span>
                  <strong className="text-indigo-200">{metrics.national_summary.supported_indic_languages} Indian Scripts</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Workspace Dual-Pane Studio */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Document Selector & Language Filter Bar */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Document Queue ({filteredRecords.length} loaded)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Languages className="w-3.5 h-3.5" />
              <span>Language:</span>
            </div>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-2.5 py-1 text-xs bg-slate-100 border border-slate-300 rounded-lg text-slate-800 font-medium"
            >
              <option value="all">All Languages</option>
              <option value="hindi">Hindi (Devanagari)</option>
              <option value="marathi">Marathi</option>
              <option value="bengali">Bengali</option>
              <option value="gujarati">Gujarati</option>
            </select>

            <div className="h-4 w-px bg-slate-300 mx-1 hidden sm:block" />

            <div className="flex gap-1.5">
              {filteredRecords.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleSelectRecord(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeRecord?.id === r.id
                      ? 'bg-indigo-700 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  {r.state}: {r.document_type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {activeRecord ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Pane: High-Res Document Scanner Viewport with Bounding Box Overlay (6 Cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold truncate max-w-[280px]">
                      {activeRecord.title} ({activeRecord.original_language})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setZoomLevel((z) => Math.max(60, z - 15))}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-mono text-slate-300">{zoomLevel}%</span>
                    <button
                      onClick={() => setZoomLevel((z) => Math.min(180, z + 15))}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Document Display Canvas */}
                <div className="relative h-[560px] bg-slate-900 overflow-auto p-4 flex items-center justify-center">
                  <div
                    style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                    className="relative transition-transform duration-150 shadow-2xl border border-slate-700 rounded-lg overflow-hidden bg-white max-w-[500px]"
                  >
                    <Image
                      src={activeRecord.scan_url}
                      alt={activeRecord.title}
                      width={500}
                      height={700}
                      unoptimized
                      className="w-full h-auto block select-none"
                    />

                    {/* Simulated Bounding Box Highlights */}
                    <div className="absolute inset-0 pointer-events-none">
                      {Object.entries(activeRecord.extracted_fields).map(([fieldName, fieldData]) => {
                        const isHovered = highlightedField === fieldName;
                        const isLowConfidence = fieldData.confidence < 75;
                        return (
                          <div
                            key={fieldName}
                            style={{
                              position: 'absolute',
                              top: `${fieldData.bbox ? fieldData.bbox[1] * 0.7 : 100}px`,
                              left: `${fieldData.bbox ? fieldData.bbox[0] * 0.5 : 50}px`,
                              width: `${fieldData.bbox ? (fieldData.bbox[2] - fieldData.bbox[0]) * 0.5 : 180}px`,
                              height: '24px',
                            }}
                            className={`rounded transition-all duration-150 border-2 ${
                              isHovered
                                ? 'bg-indigo-500/30 border-indigo-400 ring-2 ring-indigo-300'
                                : isLowConfidence
                                ? 'bg-rose-500/20 border-rose-500'
                                : 'bg-emerald-500/15 border-emerald-500/60'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                  <span>Village: <strong>{activeRecord.village}</strong>, Tehsil: <strong>{activeRecord.tehsil}</strong> ({activeRecord.district})</span>
                  <span className="font-mono text-slate-500">ID: {activeRecord.id}</span>
                </div>
              </div>
            </div>

            {/* Right Pane: Structured Extraction, Confidence Scoring & Approval (6 Cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                
                {/* Header with Verification Status */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Extracted Land Record Entities</h3>
                    <p className="text-xs text-slate-500">
                      OCR Confidence Score: <strong className="text-indigo-700">{activeRecord.overall_confidence}%</strong> • Language: {activeRecord.original_language}
                    </p>
                  </div>

                  <Badge
                    className={
                      activeRecord.verification_status === 'approved' || activeRecord.verification_status === 'verified'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : activeRecord.verification_status === 'flagged'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }
                  >
                    {activeRecord.verification_status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>

                {/* Validation Warnings Box */}
                {activeRecord.validation_warnings.length > 0 && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      Automated Validation Alerts
                    </div>
                    <ul className="text-xs text-amber-800 list-disc list-inside space-y-1 pl-1">
                      {activeRecord.validation_warnings.map((warn, i) => (
                        <li key={i}>{warn}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Structured Fields Grid */}
                <div className="space-y-3">
                  {Object.entries(activeRecord.extracted_fields).map(([fieldName, fieldData]) => {
                    const isLowConfidence = fieldData.confidence < 75;
                    const isMediumConfidence = fieldData.confidence >= 75 && fieldData.confidence < 90;
                    const isHighlighted = highlightedField === fieldName;

                    return (
                      <div
                        key={fieldName}
                        onMouseEnter={() => setHighlightedField(fieldName)}
                        onMouseLeave={() => setHighlightedField(null)}
                        className={`p-3 rounded-xl border transition-all ${
                          isHighlighted
                            ? 'border-indigo-400 bg-indigo-50/40 ring-1 ring-indigo-400'
                            : 'border-slate-200 bg-slate-50/60 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                            {fieldName.replace(/_/g, ' ')}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isLowConfidence
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : isMediumConfidence
                                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {fieldData.confidence}% Confidence
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            defaultValue={fieldData.value}
                            onChange={(e) =>
                              setEditingFields((prev) => ({ ...prev, [fieldName]: e.target.value }))
                            }
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Human-in-the-Loop Action Controls */}
                <div className="pt-2 border-t border-slate-100 space-y-2.5">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleVerifyDecision('approved')}
                      disabled={isProcessing}
                      className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2.5"
                    >
                      <Check className="w-4 h-4 mr-1.5" />
                      Approve & Commit to Registry
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleVerifyDecision('flagged')}
                      disabled={isProcessing}
                      className="flex-1 border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold py-2.5"
                    >
                      <AlertTriangle className="w-4 h-4 mr-1.5" />
                      Flag for Revenue Audit
                    </Button>
                  </div>
                  <p className="text-[11px] text-slate-500 text-center">
                    All verifications are digitally signed and recorded in the W3C PROV-O provenance ledger.
                  </p>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Database className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Loading digitization record queue...</p>
          </div>
        )}

        {/* State-wise Progress Table */}
        {metrics?.states_progress && (
          <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">National DILRMP State-wise Digitization Ledger</h3>
                <p className="text-xs text-slate-500">
                  Real-time synchronization with state Revenue Department master databases and cadastral geoportals.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 uppercase font-semibold">
                    <th className="py-2.5 px-3">State</th>
                    <th className="py-2.5 px-3">Districts</th>
                    <th className="py-2.5 px-3">Total Records (Lakhs)</th>
                    <th className="py-2.5 px-3">Digitized Progress</th>
                    <th className="py-2.5 px-3">OCR Accuracy</th>
                    <th className="py-2.5 px-3">Pending Human Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {metrics.states_progress.map((st) => (
                    <tr key={st.state} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{st.state}</td>
                      <td className="py-2.5 px-3 text-slate-600">{st.districts_total}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-800">{st.total_records_lakhs}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-600 h-full rounded-full"
                              style={{ width: `${st.digitized_percent}%` }}
                            />
                          </div>
                          <span className="font-semibold text-slate-700">{st.digitized_percent}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-emerald-700">{st.ocr_accuracy_percent}%</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-amber-700 font-semibold">
                        {st.pending_verification.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
