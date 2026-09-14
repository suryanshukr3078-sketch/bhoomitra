'use client';

import React from 'react';
import Link from 'next/link';
import {
  Landmark,
  GraduationCap,
  Scale,
  Users,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Building2,
  MapPin,
  FileCheck,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Globe2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const WORKSPACES = [
  {
    id: 'government',
    title: 'Government Official Workspace',
    role: 'Revenue Officers, Cadastral Surveyors & Tahsildars',
    description:
      'Manage title deed mutations, review topological boundary flags, track SVAMITVA village progress, and adjudicate revenue court disputes.',
    href: '/workspace/government',
    loginHref: '/login/government',
    badge: 'Statutory Revenue Clearance',
    icon: Landmark,
    colorScheme: 'text-amber-700 bg-amber-100 border-amber-200',
    cardBorder: 'hover:border-amber-500 hover:bg-amber-50/40',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-200',
    actionText: 'Enter Revenue Workspace',
    tools: [
      'Deed Mutation Review & Digital RoR Approval',
      'Cadastral Boundary Invariant & Overlap Inspector',
      'Revenue Court Dispute Hearing Docket',
      'SVAMITVA Drone Survey & Gharouni Dispatch',
    ],
  },
  {
    id: 'researcher',
    title: 'Researcher & Scientific GIS Lab',
    role: 'Spatial Scientists, University Fellows & GIS Analysts',
    description:
      'Perform spatial topological analysis, publish peer-reviewed research with DOIs, manage open cadastral datasets, and export citations.',
    href: '/workspace/researcher',
    loginHref: '/login/researcher',
    badge: 'Academic & Scientific Clearance',
    icon: GraduationCap,
    colorScheme: 'text-emerald-700 bg-emerald-100 border-emerald-200',
    cardBorder: 'hover:border-emerald-500 hover:bg-emerald-50/40',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    actionText: 'Launch GIS Research Lab',
    tools: [
      'Spatial Data Workbench & GeoJSON Inspector',
      'Manuscript Publishing with DOI & Publisher Metadata',
      'Automated PostGIS Boundary Topology Runner',
      'Real-Time Citation Analytics & BibTeX Generator',
    ],
  },
  {
    id: 'policymaker',
    title: 'Policy Maker & Legislative Directorate',
    role: 'Legislative Advisors, Reform Commissioners & Planners',
    description:
      'Author statutory land reform bills, monitor state compliance indices, benchmark inter-jurisdictional performance, and analyze stakeholder feedback.',
    href: '/workspace/policymaker',
    loginHref: '/login/policymaker',
    badge: 'Legislative Drafter Clearance',
    icon: Scale,
    colorScheme: 'text-blue-700 bg-blue-100 border-blue-200',
    cardBorder: 'hover:border-blue-500 hover:bg-blue-50/40',
    badgeBg: 'bg-blue-100 text-blue-900 border-blue-200',
    actionText: 'Open Legislative Workspace',
    tools: [
      'Statutory Land Reform Drafter & Gazette Staging',
      'Multi-State Comparative Reform Scorecard',
      'National Regulatory Compliance Matrix',
      'Public Consultation Sentiment Analytics',
    ],
  },
  {
    id: 'civil-society',
    title: 'Civil Society & Grassroots Desk',
    role: 'Advocacy Organizations, Community Leaders & Legal Aid',
    description:
      'Track Forest Rights Act (FRA 2006) claims, lodge citizen land disputes, monitor commons encroachment alerts, and access legal rights toolkits.',
    href: '/workspace/civil-society',
    loginHref: '/login/civil-society',
    badge: 'Public Interest & NGO Clearance',
    icon: Users,
    colorScheme: 'text-teal-700 bg-teal-100 border-teal-200',
    cardBorder: 'hover:border-teal-500 hover:bg-teal-50/40',
    badgeBg: 'bg-teal-100 text-teal-900 border-teal-200',
    actionText: 'Access Advocate Desk',
    tools: [
      'Community Forest Rights (FRA) Claim Tracker',
      'Citizen Land Grievance Lodging & Escalation Desk',
      'Commons & Water-Body Encroachment Watchdog',
      'Grassroots Legal Notices & Rights Toolkit',
    ],
  },
];

export default function WorkspacesDirectoryPage() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Multi-Institutional Cadastral Infrastructure
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
          Official Workspaces &amp; Directorate Portals
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Dedicated operational workstations engineered specifically for jurisdictional officers, scientists, legislative advisors, and grassroots advocates to manage land governance workflows.
        </p>
      </div>

      {/* Authenticated User Status Strip */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold border border-slate-200">
            <Building2 className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Authentication Status</div>
            <div className="text-sm font-bold text-slate-900">
              {isAuthenticated && user
                ? `Logged in as ${user.full_name || user.email} (${user.role || 'Officer'})`
                : 'Browsing in Guest Mode — Select a workspace or login to begin official work'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <Activity className="w-3.5 h-3.5 text-slate-600" />
              Platform Overview
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-sm"
            >
              Sign In to Workspaces
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
            Admin Portal
          </Link>
        </div>
      </div>

      {/* Category Workspaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {WORKSPACES.map((ws) => {
          const Icon = ws.icon;
          return (
            <div
              key={ws.id}
              className={`p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-card transition-all duration-200 flex flex-col justify-between ${ws.cardBorder} hover:shadow-xl hover:-translate-y-0.5`}
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${ws.badgeBg}`}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {ws.badge}
                  </span>
                  <Link
                    href={ws.loginHref}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 underline-offset-2 hover:underline inline-flex items-center gap-1"
                  >
                    Dedicated Login
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${ws.colorScheme}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-heading">
                      {ws.title}
                    </h2>
                    <p className="text-xs font-semibold text-slate-500">
                      {ws.role}
                    </p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {ws.description}
                </p>

                <div className="pt-3 border-t border-slate-100 space-y-2.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Core Operational Tools
                  </div>
                  <ul className="grid grid-cols-1 gap-1.5 text-xs text-slate-700">
                    {ws.tools.map((t, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-medium">{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={ws.href}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 active:bg-black transition-all shadow-md group"
                >
                  <span>{ws.actionText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <span className="text-[11px] font-mono text-slate-400">
                  {ws.id.toUpperCase()}-v2
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Platform Architecture & Trust Footer Card */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Globe2 className="w-4 h-4" />
            Append-Only Cryptographic Consensus
          </div>
          <h3 className="text-lg font-bold">
            Cadastral Boundary Verifiability &amp; Inter-Jurisdictional Trust
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl">
            All approvals, topological polygon updates, and policy enactments executed within these official workspaces are committed to the non-repudiable provenance ledger with surveyor digital signatures.
          </p>
        </div>
        <Link
          href="/evidence"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition-colors shrink-0 shadow-sm"
        >
          <span>View Provenance DAG</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
