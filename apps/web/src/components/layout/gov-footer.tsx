'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AshokaEmblem, DigitalIndiaLogo } from '@/components/layout/gov-emblem';
import { ShieldCheck, ExternalLink, Globe2 } from 'lucide-react';

export function GovFooter() {
  return (
    <footer className="w-full bg-[#0a1931] text-slate-300 border-t-4 border-[#ff9933] text-xs">
      {/* 1. Official Government Policies Bar (GIGW Top Footer) */}
      <div className="border-b border-slate-800 bg-[#071326] py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-medium text-slate-400">
          <Link href="/about" className="hover:text-amber-300 transition-colors">Website Policies</Link>
          <span>|</span>
          <Link href="/about" className="hover:text-amber-300 transition-colors">Terms &amp; Conditions</Link>
          <span>|</span>
          <Link href="/about" className="hover:text-amber-300 transition-colors">Privacy Policy</Link>
          <span>|</span>
          <Link href="/about" className="hover:text-amber-300 transition-colors">Hyperlinking Policy</Link>
          <span>|</span>
          <Link href="/about" className="hover:text-amber-300 transition-colors">Copyright Policy</Link>
          <span>|</span>
          <Link href="/about" className="hover:text-amber-300 transition-colors">Disclaimer</Link>
          <span>|</span>
          <Link href="/contact" className="hover:text-amber-300 transition-colors">Help &amp; Support</Link>
          <span>|</span>
          <Link href="/policies" className="hover:text-amber-300 transition-colors">RTI</Link>
          <span>|</span>
          <Link href="/contact" className="hover:text-amber-300 transition-colors">Feedback</Link>
          <span>|</span>
          <Link href="/sitemap.xml" className="hover:text-amber-300 transition-colors">Sitemap</Link>
        </div>
      </div>

      {/* 2. Main Footer Links Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Citizen Services */}
          <div className="space-y-3">
            <div className="font-bold text-white text-sm uppercase tracking-wide border-b border-slate-700/60 pb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff9933]" />
              <span>Citizen Services</span>
            </div>
            <ul className="space-y-2 text-[11px] text-slate-300">
              <li><Link href="/maps" className="hover:text-amber-300">Pan-India Cadastral GIS Maps</Link></li>
              <li><Link href="/digitization" className="hover:text-amber-300">Bhu-Aadhaar (ULPIN) Verification</Link></li>
              <li><Link href="/maps?filter=svamitva" className="hover:text-amber-300">SVAMITVA Rural Property Cards</Link></li>
              <li><Link href="/watershed" className="hover:text-amber-300">SRISHTI-DRISHTI Watershed GIS</Link></li>
              <li><Link href="/acquisition" className="hover:text-amber-300">LAMS Land Acquisition Portal</Link></li>
              <li><Link href="/contribute" className="hover:text-amber-300 font-semibold text-amber-400">Participate in Boundary Survey</Link></li>
            </ul>
          </div>

          {/* Column 2: Government & Ministries */}
          <div className="space-y-3">
            <div className="font-bold text-white text-sm uppercase tracking-wide border-b border-slate-700/60 pb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span>Govt. Portals &amp; Schemes</span>
            </div>
            <ul className="space-y-2 text-[11px] text-slate-300">
              <li><a href="https://rural.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 flex items-center gap-1">Ministry of Rural Development <ExternalLink className="w-3 h-3 text-slate-500" /></a></li>
              <li><a href="https://dolr.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 flex items-center gap-1">Department of Land Resources (DoLR) <ExternalLink className="w-3 h-3 text-slate-500" /></a></li>
              <li><a href="https://panchayat.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 flex items-center gap-1">Ministry of Panchayati Raj <ExternalLink className="w-3 h-3 text-slate-500" /></a></li>
              <li><a href="https://surveyofindia.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 flex items-center gap-1">Survey of India (SoI) <ExternalLink className="w-3 h-3 text-slate-500" /></a></li>
              <li><a href="https://bhuvan.nrsc.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 flex items-center gap-1">ISRO Bhuvan Geoportal <ExternalLink className="w-3 h-3 text-slate-500" /></a></li>
              <li><a href="https://mygov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 flex items-center gap-1">MyGov (Meri Sarkar) <ExternalLink className="w-3 h-3 text-slate-500" /></a></li>
            </ul>
          </div>

          {/* Column 3: Standards & Research */}
          <div className="space-y-3">
            <div className="font-bold text-white text-sm uppercase tracking-wide border-b border-slate-700/60 pb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#138808]" />
              <span>Standards &amp; Research</span>
            </div>
            <ul className="space-y-2 text-[11px] text-slate-300">
              <li><Link href="/research" className="hover:text-amber-300">Peer-Reviewed Land Studies</Link></li>
              <li><Link href="/policies" className="hover:text-amber-300">Central Acts &amp; Gazette Registry</Link></li>
              <li><Link href="/datasets" className="hover:text-amber-300">Open GIS Datasets (OGC)</Link></li>
              <li><Link href="/evidence" className="hover:text-amber-300">W3C PROV-O Audit Trails</Link></li>
              <li><Link href="/developers" className="hover:text-amber-300">Developer APIs &amp; GIS Endpoints</Link></li>
              <li><Link href="/assistant" className="hover:text-amber-300">AI Cadastral Assistant</Link></li>
            </ul>
          </div>

          {/* Column 4: Official Workspaces */}
          <div className="space-y-3">
            <div className="font-bold text-white text-sm uppercase tracking-wide border-b border-slate-700/60 pb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Official Workspaces (2FA)</span>
            </div>
            <ul className="space-y-2 text-[11px]">
              <li><Link href="/workspace/government" className="text-amber-300 hover:text-amber-200 font-medium">Government Agency Desk</Link></li>
              <li><Link href="/workspace/researcher" className="text-emerald-400 hover:text-emerald-300 font-medium">Researcher Spatial Lab</Link></li>
              <li><Link href="/workspace/policymaker" className="text-blue-300 hover:text-blue-200 font-medium">Policy Directorate</Link></li>
              <li><Link href="/workspace/civil-society" className="text-teal-300 hover:text-teal-200 font-medium">Civil Society Desk</Link></li>
              <li><Link href="/admin" className="text-purple-300 hover:text-purple-200 font-medium">Admin Management Portal</Link></li>
              <li className="pt-1.5"><Link href="/login" className="inline-flex items-center gap-1 text-white font-bold hover:underline">Universal Sign In &rarr;</Link></li>
            </ul>
          </div>
        </div>

        {/* 3. Partner Government Badges Strip (Digital India, Data.gov.in, NIC, Team CodeNova) */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <AshokaEmblem className="w-8 h-10 text-slate-400" />
            <div className="text-left">
              <div className="text-white font-bold text-xs tracking-tight">भू-मित्र BHOOMITRA</div>
              <div className="text-[10px] text-slate-400">Department of Land Resources | MoRD</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <DigitalIndiaLogo />
            <div className="font-extrabold text-white text-xs tracking-wider">data.gov.in</div>
            <div className="font-extrabold text-white text-xs tracking-wider">india.gov.in</div>
            <div className="font-bold text-[#ff9933] text-xs">my<span className="text-white">Gov</span></div>
            <div className="font-extrabold text-white text-xs tracking-wide">NIC</div>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-white p-0.5 flex items-center justify-center overflow-hidden shrink-0">
              <Image
                src="/images/team-codenova-logo.png"
                alt="Team CodeNova"
                width={28}
                height={28}
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="text-left text-[10px]">
              <div className="font-bold text-white leading-tight">TEAM CODENOVA</div>
              <div className="text-slate-400 leading-tight">Engineering &amp; Design</div>
            </div>
          </div>
        </div>

        {/* 4. Copyright & Disclaimer */}
        <div className="mt-8 pt-4 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 text-center md:text-left">
          <p>
            Website Content Owned &amp; Managed by Department of Land Resources, Ministry of Rural Development, Government of India.
          </p>
          <p className="shrink-0 text-slate-400">
            Hosted by National Informatics Centre (NIC) | PostGIS 3.3 Spatial Engine
          </p>
        </div>
      </div>
    </footer>
  );
}
