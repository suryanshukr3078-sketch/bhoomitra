'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Scale, ExternalLink, CheckCircle } from 'lucide-react';

export type PolicyType =
  | 'website'
  | 'terms'
  | 'privacy'
  | 'hyperlinking'
  | 'copyright'
  | 'disclaimer'
  | 'rti';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: PolicyType;
}

const POLICIES: Record<
  PolicyType,
  { title: string; subtitle: string; content: React.ReactNode }
> = {
  website: {
    title: 'Website Policies (वेबसाइट नीतियां)',
    subtitle: 'Guidelines for Indian Government Websites (GIGW 3.0) Compliance',
    content: (
      <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
        <p>
          The <strong>Bhoomitra Land Governance Platform</strong> is designed and maintained in strict adherence to the Guidelines for Indian Government Websites (GIGW 3.0) formulated by the National Informatics Centre (NIC) and Ministry of Electronics and Information Technology (MeitY).
        </p>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
          <div className="font-bold text-slate-900">Key Website Tenets:</div>
          <ul className="list-disc pl-4 space-y-1 text-slate-600">
            <li>WCAG 2.1 Level AA Accessibility compliance for differently-abled citizens.</li>
            <li>Bilingual presentation in Hindi and English.</li>
            <li>Device-responsive layouts optimized for mobile, tablet, and low-bandwidth connections.</li>
            <li>Regular security audits and vulnerability assessments conducted per CERT-In guidelines.</li>
          </ul>
        </div>
      </div>
    ),
  },
  terms: {
    title: 'Terms & Conditions (नियम और शर्तें)',
    subtitle: 'Usage conditions for Bhoomitra Cadastral & Land Governance Portal',
    content: (
      <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
        <p>
          By accessing the Bhoomitra portal, you agree to comply with the terms of service set forth by the Ministry of Rural Development &amp; Department of Land Resources.
        </p>
        <ul className="list-disc pl-4 space-y-1.5 text-slate-600">
          <li><strong>Lawful Use:</strong> You agree not to misuse, tamper with, or scrape spatial boundaries or citizen cadastral mutation data.</li>
          <li><strong>Demonstration Datasets:</strong> Where explicitly designated as synthetic sandbox data, records are intended solely for technical evaluation, academic study, and administrative pilot trials.</li>
          <li><strong>Statutory Verification:</strong> For formal court, registry, or mutation proceedings, statutory certified copies must be verified against jurisdictional state revenue portals.</li>
        </ul>
      </div>
    ),
  },
  privacy: {
    title: 'Privacy Policy (गोपनीयता नीति)',
    subtitle: 'Data protection and citizen confidentiality standards',
    content: (
      <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
        <p>
          The Bhoomitra platform respects citizen privacy and is compliant with the <strong>Digital Personal Data Protection (DPDP) Act 2023</strong> and national geospatial data privacy norms.
        </p>
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 space-y-1.5">
          <div className="font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>2FA &amp; Data Security Protocols</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            All administrative logins require mandatory Two-Factor Authentication (2FA) with cryptographic OTP verification. Sensitive personal identifiers are encrypted at rest using AES-256 and transmitted exclusively over TLS 1.3.
          </p>
        </div>
        <p className="text-slate-600">
          We do not sell, rent, or disclose personal identity details to commercial entities. Information collected via feedback forms or surveys is utilized strictly for governance improvements.
        </p>
      </div>
    ),
  },
  hyperlinking: {
    title: 'Hyperlinking Policy (हाइपरलिंकिंग नीति)',
    subtitle: 'Outbound and inbound link protocols',
    content: (
      <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
        <p>
          <strong>Links to External Websites:</strong> At many places in this website, you shall find links to other websites/portals created and maintained by other government or statutory organizations (e.g. Survey of India, ISRO Bhuvan, state revenue portals).
        </p>
        <p className="text-slate-600">
          Bhoomitra is not responsible for the contents or reliability of linked websites and does not necessarily endorse the views expressed within them. We cannot guarantee that these links will work at all times.
        </p>
        <p>
          <strong>Linking to Bhoomitra:</strong> We permit linking to information hosted on this portal without prior permission, provided our pages are not loaded into frames on your site.
        </p>
      </div>
    ),
  },
  copyright: {
    title: 'Copyright Policy (सर्वाधिकार नीति)',
    subtitle: 'Government of India Open Data Framework',
    content: (
      <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
        <p>
          Material featured on this portal may be reproduced free of charge in any format or media without requiring specific permission, subject to the material being reproduced accurately and not being used in a derogatory manner or misleading context.
        </p>
        <p className="text-slate-600">
          Where the material is being published or issued to others, the source must be prominently acknowledged as <em>Bhoomitra - National Land Governance &amp; Cadastral Platform, Ministry of Rural Development, Government of India</em>.
        </p>
      </div>
    ),
  },
  disclaimer: {
    title: 'Disclaimer (अस्वीकरण)',
    subtitle: 'Cadastral map boundaries & topological validation note',
    content: (
      <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 space-y-1">
          <div className="font-bold text-amber-900">Official Notice of Non-Official Synthetic Demonstration Data:</div>
          <p className="text-[11px] leading-relaxed">
            This platform demonstrates automated PostGIS topological validation, open cadastral standards (OGC/LADM), and Bhu-Aadhaar (ULPIN) parcel coordination. All sample parcels, boundary polygons, and mutation logs are synthetic test records. Official statutory land rights are governed exclusively by jurisdictional state revenue departments.
          </p>
        </div>
        <p className="text-slate-600">
          While all efforts have been made to ensure accuracy, the Ministry of Rural Development accepts no legal liability for discrepancies arising from reliance upon the spatial or tabular data presented herein.
        </p>
      </div>
    ),
  },
  rti: {
    title: 'Right to Information (RTI / सूचना का अधिकार)',
    subtitle: 'Public authority disclosures under RTI Act 2005',
    content: (
      <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
        <p>
          In accordance with Section 4(1)(b) of the <strong>Right to Information Act, 2005</strong>, citizens can seek information regarding the policies, schemes, budgetary outlays, and cadastral digitization projects managed under the Department of Land Resources (DoLR).
        </p>
        <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 space-y-2">
          <div className="font-bold text-blue-950">RTI Appellate Authority &amp; CPIO Contact:</div>
          <div className="text-slate-700 text-[11px] space-y-0.5">
            <div><strong>Department:</strong> Department of Land Resources, Ministry of Rural Development</div>
            <div><strong>Address:</strong> NBO Building, Nirman Bhawan, New Delhi - 110011</div>
            <div><strong>Online Portal:</strong> <a href="https://rtionline.gov.in" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline font-bold">rtionline.gov.in</a></div>
          </div>
        </div>
      </div>
    ),
  },
};

export function PolicyModal({ isOpen, onClose, initialTab = 'website' }: PolicyModalProps) {
  const [activeTab, setActiveTab] = useState<PolicyType>(initialTab);

  if (!isOpen) return null;

  const current = POLICIES[activeTab] || POLICIES.website;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg font-heading">
              {current.title}
            </h3>
            <p className="text-slate-500 text-[11px] mt-0.5">
              {current.subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector Strip */}
        <div className="flex items-center overflow-x-auto border-b border-slate-200 bg-slate-100/70 px-2 py-1 gap-1 text-[11px] font-semibold text-slate-600 shrink-0">
          {(Object.keys(POLICIES) as PolicyType[]).map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-2.5 py-1.5 rounded-md whitespace-nowrap transition-colors capitalize ${
                activeTab === key
                  ? 'bg-white text-[#1a3c6e] font-bold shadow-sm'
                  : 'hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              {key === 'rti' ? 'RTI' : key.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {current.content}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
          <span>GIGW 3.0 &amp; MeitY Certified Policy Standard</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#1a3c6e] text-white font-bold hover:bg-[#0f2649] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
