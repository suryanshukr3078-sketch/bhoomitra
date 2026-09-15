'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Lightbulb,
  Award,
  Compass,
  Trophy,
  Rocket,
  Calendar,
  DollarSign,
  Users,
  Search,
  Plus,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Filter,
  X,
  FileText,
  Send,
  Building,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InnovationItem {
  id: string;
  title: string;
  track: 'grant' | 'hackathon' | 'pilot' | 'competition';
  category: string;
  fundingOrPrize: string;
  deadline: string;
  status: 'active' | 'upcoming' | 'evaluating';
  leadAgency: string;
  description: string;
  eligibility: string;
  tags: string[];
}

const INNOVATION_ITEMS: InnovationItem[] = [
  {
    id: 'GRT-2026-01',
    title: 'National Land Governance & Digital Cadastre Research Grant',
    track: 'grant',
    category: 'Applied Research',
    fundingOrPrize: '₹25,00,000 per Project',
    deadline: '15 October 2026',
    status: 'active',
    leadAgency: 'Ministry of Rural Development & Bhoomitra Foundation',
    description:
      'Funding rigorous econometric and legal studies investigating conclusive titling transitions, agrarian credit mobilization, and tenure rights formalization across pilot districts.',
    eligibility: 'Academic researchers, university departments, and registered policy think tanks.',
    tags: ['Titling', 'Econometrics', 'Credit Flow', 'Public Policy'],
  },
  {
    id: 'HCK-2026-02',
    title: 'National Cadastral Drone AI Hackathon 2026',
    track: 'hackathon',
    category: 'Computer Vision & GIS',
    fundingOrPrize: '₹12,00,000 Prize Pool',
    deadline: '30 November 2026',
    status: 'active',
    leadAgency: 'Survey of India & Department of Land Resources',
    description:
      'Build automated deep learning algorithms to detect village plot boundaries, hedge demarcations, and encroached common land from 5cm GSD drone orthophotos.',
    eligibility: 'Open to developers, AI researchers, geospatial engineers, and university student teams.',
    tags: ['Drone Photogrammetry', 'Computer Vision', 'PostGIS', 'Boundary AI'],
  },
  {
    id: 'PLT-2026-03',
    title: 'SVAMITVA 2.0 Real-Time Mutation Sandbox Pilot',
    track: 'pilot',
    category: 'Operational Sandbox',
    fundingOrPrize: 'Technical & Infrastructure Sandbox Backing',
    deadline: 'Rolling Applications 2026',
    status: 'active',
    leadAgency: 'Panchayati Raj & State Revenue Commissions',
    description:
      'Operational field trials deploying automated RTK-GPS drone parcel re-surveys and instant digital Property Card disbursement across 500 contiguous revenue villages in Central India.',
    eligibility: 'District administrations, state survey departments, and empanelled drone survey agencies.',
    tags: ['SVAMITVA', 'Drone Survey', 'Property Card', 'Rural Cadastre'],
  },
  {
    id: 'PLT-2026-04',
    title: 'Cryptographic Land Registry & DAG Mutation Ledger Pilot',
    track: 'pilot',
    category: 'Decentralized Architecture',
    fundingOrPrize: 'Pilot Deployment Grant (₹40 Lakhs)',
    deadline: '20 November 2026',
    status: 'active',
    leadAgency: 'Odisha State Land Records Directorate & NIC',
    description:
      'Implementing immutable W3C PROV-O audit trails and SHA-256 cryptographic DAG signatures for mutation deeds to eliminate double-registration and unauthorized alterations.',
    eligibility: 'Enterprise blockchain consortia, IIT research labs, and civic technology institutions.',
    tags: ['Blockchain', 'Cryptography', 'Mutation', 'Audit Trail'],
  },
  {
    id: 'CMP-2026-05',
    title: 'All-India Geospatial Cartography & Spatial Justice Contest',
    track: 'competition',
    category: 'Student Competition',
    fundingOrPrize: '₹5,00,000 + Fellowship',
    deadline: '10 December 2026',
    status: 'active',
    leadAgency: 'Indian Society of Remote Sensing (ISRS)',
    description:
      'Student GIS mapping challenge visualizing tribal land rights, agro-ecological vulnerability zones, and communal commons preservation using open satellite data.',
    eligibility: 'Undergraduate and postgraduate students enrolled in Indian universities.',
    tags: ['Cartography', 'GIS', 'Remote Sensing', 'Students'],
  },
  {
    id: 'GRT-2026-06',
    title: 'Forest Rights Act (FRA) Spatial Demarcation Action Grant',
    track: 'grant',
    category: 'Tenurial Rights',
    fundingOrPrize: '₹18,00,000 per Project',
    deadline: '05 January 2027',
    status: 'upcoming',
    leadAgency: 'Ministry of Tribal Affairs & Civil Society Alliances',
    description:
      'Direct grant backing for community-led GPS mapping and Gram Sabha spatial boundary documentation for Community Forest Resource (CFR) claims in Western Ghats and Odisha.',
    eligibility: 'Civil society organizations, tribal collectives, and legal aid institutions.',
    tags: ['FRA 2006', 'Gram Sabha', 'Forest Rights', 'Community GIS'],
  },
];

export default function InnovationPortalPage() {
  const { toast } = useToast();
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedItemForApply, setSelectedItemForApply] =
    useState<InnovationItem | null>(null);

  // Form State
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [proposalAbstract, setProposalAbstract] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredItems = INNOVATION_ITEMS.filter((item) => {
    const matchesTrack = selectedTrack === 'all' || item.track === selectedTrack;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTrack && matchesSearch;
  });

  const handleOpenApply = (item: InnovationItem) => {
    setSelectedItemForApply(item);
    setProjectTitle(`Proposal for: ${item.title}`);
    setIsModalOpen(true);
  };

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim() || !applicantEmail.trim() || !proposalAbstract.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'error',
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsModalOpen(false);
      // Reset form
      setApplicantName('');
      setApplicantEmail('');
      setOrganization('');
      setProposalAbstract('');
      toast({
        title: 'Application Submitted Successfully',
        description: `Your proposal for "${selectedItemForApply?.title}" has been registered. Reference: APP-2026-${Math.floor(1000 + Math.random() * 9000)}.`,
        variant: 'success',
      });
    }, 900);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white pt-10 pb-14 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/40">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Lightbulb className="w-4 h-4" />
            <span>National Land Tech Innovation & Research Accelerator</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Innovation Portal & Research Grants
          </h1>
          <p className="text-slate-300 max-w-3xl text-sm sm:text-base leading-relaxed">
            Supporting research grants, national hackathons, operational sandbox pilots,
            and knowledge competitions to advance conclusive land titling, spatial AI, and tenurial justice.
          </p>

          {/* Quick Metrics */}
          <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <div className="text-xs text-slate-400 font-semibold">Active Grant Pool</div>
              <div className="text-xl font-extrabold text-emerald-400 mt-0.5">₹3.4 Crores</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <div className="text-xs text-slate-400 font-semibold">Live Sandbox Villages</div>
              <div className="text-xl font-extrabold text-teal-400 mt-0.5">1,240 Villages</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <div className="text-xs text-slate-400 font-semibold">Participating Labs</div>
              <div className="text-xl font-extrabold text-blue-400 mt-0.5">48 Institutes</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <div className="text-xs text-slate-400 font-semibold">Active Challenges</div>
              <div className="text-xl font-extrabold text-amber-400 mt-0.5">6 Open Calls</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Controls Bar: Search & Track Filter */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search grants, hackathons, pilots..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
            />
          </div>

          {/* Track Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { key: 'all', label: 'All Tracks', icon: Sparkles },
              { key: 'grant', label: 'Research Grants', icon: Award },
              { key: 'hackathon', label: 'Hackathons', icon: Trophy },
              { key: 'pilot', label: 'Sandbox Pilots', icon: Rocket },
              { key: 'competition', label: 'Competitions', icon: Compass },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedTrack(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  selectedTrack === key
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Innovation Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Track Badge & Deadline */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      item.track === 'grant'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.track === 'hackathon'
                        ? 'bg-purple-100 text-purple-800'
                        : item.track === 'pilot'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.track}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                    <Calendar className="w-3 h-3" />
                    <span>Deadline: {item.deadline}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {item.title}
                </h3>

                {/* Lead Agency */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{item.leadAgency}</span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {item.description}
                </p>

                {/* Funding or Prize Highlight */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-500">Value / Allocation:</span>
                  <span className="font-extrabold text-emerald-800">
                    {item.fundingOrPrize}
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {item.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleOpenApply(item)}
                  className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>Submit Proposal / Apply</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Innovation Calls Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try modifying your search keywords or switching back to &quot;All Tracks&quot;.
            </p>
          </div>
        )}
      </div>

      {/* Application / Proposal Modal */}
      {isModalOpen && selectedItemForApply && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                  Call Ref: {selectedItemForApply.id}
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {selectedItemForApply.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProposal} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">
                    Lead Researcher / Applicant Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="e.g. Dr. Priya Sharma"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    placeholder="e.g. p.sharma@iitb.ac.in"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">
                  Affiliated Institution / Organization
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. IIT Bombay / NALSAR University of Law"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Project / Proposal Title</label>
                <input
                  type="text"
                  required
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">
                  Proposal Abstract & Methodology Summary *
                </label>
                <textarea
                  required
                  rows={4}
                  value={proposalAbstract}
                  onChange={(e) => setProposalAbstract(e.target.value)}
                  placeholder="Briefly describe your objectives, geospatial/econometric methodology, and intended policy impact..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] leading-relaxed border border-emerald-200/60">
                <strong>Evaluation Process:</strong> Proposals are peer-reviewed by the
                Inter-Agency Steering Committee based on rigor, methodological reproducibility, and
                alignment with national land modernization priorities.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-md transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Registering...' : 'Submit Application'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
