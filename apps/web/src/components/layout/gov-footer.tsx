'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AshokaEmblem, DigitalIndiaLogo } from '@/components/layout/gov-emblem';
import { ShieldCheck, ExternalLink, Globe2, HeartHandshake, Info } from 'lucide-react';
import { PolicyModal, PolicyType } from '@/components/layout/policy-modal';

export function GovFooter() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<PolicyType>('website');

  const openPolicy = (tab: PolicyType) => {
    setModalTab(tab);
    setModalOpen(true);
  };

  return (
    <>
      <footer className="w-full bg-[#0a1931] text-slate-300 border-t-4 border-[#ff9933] text-xs select-none">
        {/* 1. Official Government Policies Bar (GIGW Top Footer - All Interactive) */}
        <div className="border-b border-slate-800 bg-[#071326] py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-medium text-slate-400">
            <button
              onClick={() => openPolicy('website')}
              className="hover:text-amber-300 transition-colors focus:outline-none focus-visible:underline cursor-pointer"
            >
              Website Policies
            </button>
            <span className="text-slate-600">|</span>

            <button
              onClick={() => openPolicy('terms')}
              className="hover:text-amber-300 transition-colors focus:outline-none focus-visible:underline cursor-pointer"
            >
              Terms &amp; Conditions
            </button>
            <span className="text-slate-600">|</span>

            <button
              onClick={() => openPolicy('privacy')}
              className="hover:text-amber-300 transition-colors focus:outline-none focus-visible:underline cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-slate-600">|</span>

            <button
              onClick={() => openPolicy('hyperlinking')}
              className="hover:text-amber-300 transition-colors focus:outline-none focus-visible:underline cursor-pointer"
            >
              Hyperlinking Policy
            </button>
            <span className="text-slate-600">|</span>

            <button
              onClick={() => openPolicy('copyright')}
              className="hover:text-amber-300 transition-colors focus:outline-none focus-visible:underline cursor-pointer"
            >
              Copyright Policy
            </button>
            <span className="text-slate-600">|</span>

            <button
              onClick={() => openPolicy('disclaimer')}
              className="hover:text-amber-300 transition-colors focus:outline-none focus-visible:underline cursor-pointer"
            >
              Disclaimer
            </button>
            <span className="text-slate-600">|</span>

            <Link href="/contact" className="hover:text-amber-300 transition-colors">
              Help &amp; Support
            </Link>
            <span className="text-slate-600">|</span>

            <button
              onClick={() => openPolicy('rti')}
              className="hover:text-amber-300 transition-colors focus:outline-none focus-visible:underline cursor-pointer"
            >
              RTI
            </button>
            <span className="text-slate-600">|</span>

            <Link href="/contact" className="hover:text-amber-300 transition-colors">
              Feedback
            </Link>
            <span className="text-slate-600">|</span>

            <Link href="/sitemap" className="hover:text-amber-300 transition-colors font-semibold">
              Sitemap
            </Link>
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
                <li><Link href="/maps" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">Pan-India Cadastral GIS Maps</Link></li>
                <li><Link href="/digitization" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">Bhu-Aadhaar (ULPIN) Verification</Link></li>
                <li><Link href="/maps?filter=svamitva" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">SVAMITVA Rural Property Cards</Link></li>
                <li><Link href="/watershed" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">SRISHTI-DRISHTI Watershed GIS</Link></li>
                <li><Link href="/acquisition" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">LAMS Land Acquisition Portal</Link></li>
                <li><Link href="/contribute" className="hover:text-amber-300 font-semibold text-amber-400 transition-colors flex items-center gap-1.5">Participate in Boundary Survey</Link></li>
              </ul>
            </div>

            {/* Column 2: Government & Ministries */}
            <div className="space-y-3">
              <div className="font-bold text-white text-sm uppercase tracking-wide border-b border-slate-700/60 pb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white" />
                <span>Govt. Portals &amp; Schemes</span>
              </div>
              <ul className="space-y-2 text-[11px] text-slate-300">
                <li>
                  <a href="https://rural.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition-colors flex items-center justify-between group">
                    <span>Ministry of Rural Development</span>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-amber-300" />
                  </a>
                </li>
                <li>
                  <a href="https://dolr.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition-colors flex items-center justify-between group">
                    <span>Department of Land Resources (DoLR)</span>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-amber-300" />
                  </a>
                </li>
                <li>
                  <a href="https://panchayat.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition-colors flex items-center justify-between group">
                    <span>Ministry of Panchayati Raj</span>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-amber-300" />
                  </a>
                </li>
                <li>
                  <a href="https://surveyofindia.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition-colors flex items-center justify-between group">
                    <span>Survey of India (SoI)</span>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-amber-300" />
                  </a>
                </li>
                <li>
                  <a href="https://bhuvan.nrsc.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition-colors flex items-center justify-between group">
                    <span>ISRO Bhuvan Geoportal</span>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-amber-300" />
                  </a>
                </li>
                <li>
                  <a href="https://mygov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition-colors flex items-center justify-between group">
                    <span>MyGov (Meri Sarkar)</span>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-amber-300" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Standards & Research */}
            <div className="space-y-3">
              <div className="font-bold text-white text-sm uppercase tracking-wide border-b border-slate-700/60 pb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#138808]" />
                <span>Standards &amp; Research</span>
              </div>
              <ul className="space-y-2 text-[11px] text-slate-300">
                <li><Link href="/research" className="hover:text-amber-300 transition-colors">Peer-Reviewed Land Studies</Link></li>
                <li><Link href="/policies" className="hover:text-amber-300 transition-colors">Central Acts &amp; Gazette Registry</Link></li>
                <li><Link href="/datasets" className="hover:text-amber-300 transition-colors">Open GIS Datasets (OGC)</Link></li>
                <li><Link href="/evidence" className="hover:text-amber-300 transition-colors">W3C PROV-O Audit Trails</Link></li>
                <li><Link href="/developers" className="hover:text-amber-300 transition-colors">Developer APIs &amp; GIS Endpoints</Link></li>
                <li><Link href="/assistant" className="hover:text-amber-300 transition-colors">AI Cadastral Assistant</Link></li>
              </ul>
            </div>

            {/* Column 4: Official Workspaces */}
            <div className="space-y-3">
              <div className="font-bold text-white text-sm uppercase tracking-wide border-b border-slate-700/60 pb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>Official Workspaces (2FA)</span>
              </div>
              <ul className="space-y-2 text-[11px]">
                <li><Link href="/workspace/government" className="text-amber-300 hover:text-amber-200 font-medium transition-colors">Government Agency Desk</Link></li>
                <li><Link href="/workspace/researcher" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">Researcher Spatial Lab</Link></li>
                <li><Link href="/workspace/policymaker" className="text-blue-300 hover:text-blue-200 font-medium transition-colors">Policy Directorate</Link></li>
                <li><Link href="/workspace/civil-society" className="text-teal-300 hover:text-teal-200 font-medium transition-colors">Civil Society Desk</Link></li>
                <li><Link href="/admin" className="text-purple-300 hover:text-purple-200 font-medium transition-colors">Admin Management Portal</Link></li>
                <li className="pt-1.5"><Link href="/login" className="inline-flex items-center gap-1 text-white font-bold hover:underline">Universal Sign In &rarr;</Link></li>
              </ul>
            </div>
          </div>

          {/* 3. Partner Government Badges Strip (100% Functional & Clickable) */}
          <div className="mt-10 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-6">
            {/* Logo Link to Home */}
            <Link
              href="/"
              className="flex items-center gap-3 group hover:opacity-90 transition-opacity"
              title="Bhoomitra Platform Home"
            >
              <AshokaEmblem className="w-8 h-10 text-slate-400 group-hover:text-white transition-colors" />
              <div className="text-left">
                <div className="text-white font-bold text-xs tracking-tight group-hover:text-amber-300 transition-colors">
                  भू-मित्र BHOOMITRA
                </div>
                <div className="text-[10px] text-slate-400">Department of Land Resources | MoRD</div>
              </div>
            </Link>

            {/* National Badges as Interactive Links */}
            <div className="flex flex-wrap items-center gap-5 sm:gap-7 text-xs text-slate-400">
              {/* Digital India */}
              <a
                href="https://www.digitalindia.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-105 transition-transform inline-block"
                title="Digital India Official Portal (Opens in new tab)"
              >
                <DigitalIndiaLogo />
              </a>

              {/* Data.gov.in */}
              <a
                href="https://data.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="font-extrabold text-slate-300 hover:text-white text-xs sm:text-sm tracking-wider hover:underline transition-colors"
                title="Open Government Data (OGD) Platform India (Opens in new tab)"
              >
                data.gov.in
              </a>

              {/* India.gov.in */}
              <a
                href="https://www.india.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="font-extrabold text-slate-300 hover:text-white text-xs sm:text-sm tracking-wider hover:underline transition-colors"
                title="National Portal of India (Opens in new tab)"
              >
                india.gov.in
              </a>

              {/* MyGov */}
              <a
                href="https://www.mygov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#ff9933] hover:text-[#ffaa4d] text-xs sm:text-sm hover:scale-105 transition-all"
                title="MyGov Citizen Engagement Portal (Opens in new tab)"
              >
                my<span className="text-white">Gov</span>
              </a>

              {/* NIC */}
              <a
                href="https://www.nic.in"
                target="_blank"
                rel="noopener noreferrer"
                className="font-extrabold text-slate-300 hover:text-white text-xs sm:text-sm tracking-wide hover:underline transition-colors"
                title="National Informatics Centre (Opens in new tab)"
              >
                NIC
              </a>
            </div>

            {/* Team CodeNova Badge as Interactive Link */}
            <a
              href="https://github.com/suryanshukr3078-sketch/bhoomitra"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-slate-900/90 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700/80 hover:border-amber-400/60 transition-all shadow-md group cursor-pointer"
              title="Team CodeNova Engineering & Architecture (Opens GitHub in new tab)"
            >
              <div className="w-8 h-8 rounded-lg bg-white p-0.5 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
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
                <div className="font-bold text-white group-hover:text-amber-300 leading-tight transition-colors">
                  TEAM CODENOVA
                </div>
                <div className="text-slate-400 leading-tight">Engineering &amp; Design</div>
              </div>
              <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-amber-300 ml-0.5 transition-colors" />
            </a>
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

      {/* 5. Interactive Policy Modal */}
      <PolicyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialTab={modalTab}
      />
    </>
  );
}
