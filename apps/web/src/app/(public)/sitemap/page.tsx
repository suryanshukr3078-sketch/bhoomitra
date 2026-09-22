import React from 'react';
import Link from 'next/link';
import {
  MapPin,
  FileText,
  BookOpen,
  Database,
  Building2,
  Bot,
  ShieldCheck,
  Code2,
  Lightbulb,
  ExternalLink,
  Layers,
} from 'lucide-react';

export const metadata = {
  title: 'Sitemap | Bhoomitra Land Governance Platform',
  description: 'Complete directory of all pages, schemes, cadastral maps, and research portals on Bhoomitra.',
};

export default function SitemapPage() {
  const sections = [
    {
      title: 'Cadastral GIS & Maps',
      icon: MapPin,
      links: [
        { label: 'Pan-India Cadastral GIS Viewer', href: '/maps' },
        { label: 'SVAMITVA Village Property Cadastres', href: '/maps?filter=svamitva' },
        { label: 'Bhu-Aadhaar (ULPIN) Verification', href: '/digitization' },
        { label: 'Watershed SRISHTI-DRISHTI GIS', href: '/watershed' },
        { label: 'Land Acquisition (LAMS RFCTLARR)', href: '/acquisition' },
      ],
    },
    {
      title: 'Schemes & Public Consultations',
      icon: FileText,
      links: [
        { label: 'Acts & Gazette Policy Registry', href: '/policies' },
        { label: 'Participatory Boundary Verification (Do)', href: '/contribute' },
        { label: 'Citizen Governance Dashboard', href: '/dashboard' },
        { label: 'Innovation Challenges & Grants', href: '/innovation' },
      ],
    },
    {
      title: 'Research, Data & Standards',
      icon: BookOpen,
      links: [
        { label: 'Peer-Reviewed Land Publications', href: '/research' },
        { label: 'Open Spatial Datasets (OGC)', href: '/datasets' },
        { label: 'W3C PROV-O Audit Provenance', href: '/evidence' },
        { label: 'Developer APIs & GIS Endpoints', href: '/developers' },
        { label: 'AI Cadastral Policy Assistant', href: '/assistant' },
      ],
    },
    {
      title: 'Official Workspaces (2FA Secured)',
      icon: Building2,
      links: [
        { label: 'Government Agency Desk', href: '/workspace/government' },
        { label: 'Researcher Spatial Lab', href: '/workspace/researcher' },
        { label: 'Policy Directorate', href: '/workspace/policymaker' },
        { label: 'Civil Society Desk', href: '/workspace/civil-society' },
        { label: 'Admin Management Portal', href: '/admin' },
        { label: 'Universal Sign In Hub', href: '/login' },
      ],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-black text-slate-900 font-heading">
          Portal Sitemap (साइटमैप)
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Complete structural navigation index of the Bhoomitra National Land Governance Platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((sec, idx) => {
          const Icon = sec.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#d96534] flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-base text-slate-900 font-heading">
                  {sec.title}
                </h2>
              </div>
              <ul className="space-y-2 text-xs">
                {sec.links.map((link, lidx) => (
                  <li key={lidx}>
                    <Link
                      href={link.href}
                      className="text-slate-700 hover:text-[#00838f] hover:underline flex items-center justify-between py-1 border-b border-slate-50"
                    >
                      <span>{link.label}</span>
                      <span className="text-slate-400 font-mono text-[10px]">{link.href}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="p-4 rounded-xl bg-slate-100 flex items-center justify-between text-xs text-slate-600">
        <span>Machine-readable XML index available for search engines:</span>
        <a href="/sitemap.xml" target="_blank" className="font-bold text-[#00838f] hover:underline flex items-center gap-1">
          <span>View sitemap.xml</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
