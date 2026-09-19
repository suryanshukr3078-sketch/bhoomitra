'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  MessageSquare,
  Vote,
  BookOpen,
  Mic,
  ArrowRight,
  Users,
  Clock,
  ThumbsUp,
  Sparkles,
} from 'lucide-react';

export function MyGovCitizenHub() {
  const [activeTab, setActiveTab] = useState<'all' | 'do' | 'discuss' | 'poll' | 'blog' | 'talk'>('all');

  const pillars = [
    {
      id: 'do',
      type: 'DO / TASKS',
      typeHi: 'कार्य / सहभागिता',
      title: 'Participatory Boundary Verification for Gram Panchayats',
      desc: 'Verify drone-mapped village boundary lines against ground markers before statutory gazette publication.',
      metric: '38,400+ Submissions',
      deadline: 'Active Phase III',
      href: '/contribute',
      cta: 'Participate Now',
      color: 'border-l-4 border-l-emerald-600 bg-emerald-50/40',
      tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: CheckSquare,
      iconColor: 'text-emerald-600',
    },
    {
      id: 'discuss',
      type: 'DISCUSS',
      typeHi: 'चर्चा / परामर्श',
      title: 'Draft Model Land Titling & Conclusive Guarantee Act 2026',
      desc: 'Invite public opinions, state revenue recommendations, and citizen feedback on transition from presumptive to conclusive land titles.',
      metric: '12,850+ Comments',
      deadline: 'Open for 18 Days',
      href: '/policies',
      cta: 'Join Discussion',
      color: 'border-l-4 border-l-blue-600 bg-blue-50/40',
      tagColor: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: MessageSquare,
      iconColor: 'text-blue-600',
    },
    {
      id: 'poll',
      type: 'POLL / SURVEY',
      typeHi: 'मतदान / सर्वेक्षण',
      title: 'Citizen Experience with Instant Digital RoR (Record of Rights)',
      desc: 'Rate the efficiency, speed, and accuracy of obtaining online digitized Jamabandi, Khasra, and Mutation status via state portals.',
      metric: '94,200+ Votes Recorded',
      deadline: 'Closes 30 Sep',
      href: '/dashboard',
      cta: 'Cast Your Vote',
      color: 'border-l-4 border-l-[#ff9933] bg-amber-50/40',
      tagColor: 'bg-amber-100 text-amber-900 border-amber-300',
      icon: Vote,
      iconColor: 'text-[#ff9933]',
    },
    {
      id: 'blog',
      type: 'BLOG',
      typeHi: 'लेख एवं विचार',
      title: 'How Bhu-Aadhaar (ULPIN) is Eliminating Rural Boundary Conflicts',
      desc: 'Special editorial on interoperability between Unique Land Parcel Identification Numbers, SVAMITVA, and the unified Agri-Stack registry.',
      metric: '45,000+ Reads',
      deadline: 'By Director Land Records',
      href: '/research',
      cta: 'Read Article',
      color: 'border-l-4 border-l-purple-600 bg-purple-50/40',
      tagColor: 'bg-purple-100 text-purple-800 border-purple-300',
      icon: BookOpen,
      iconColor: 'text-purple-600',
    },
    {
      id: 'talk',
      type: 'TALK / PODCAST',
      typeHi: 'संवाद एवं पॉडकास्ट',
      title: 'Cadastral Dialogues: Future of High-Resolution Spatial Records',
      desc: 'A live webinar session with the Surveyor General of India and Ministry technical experts on AI dual-pane deed digitization.',
      metric: '6,200+ Attendees',
      deadline: 'Archived Episode 14',
      href: '/assistant',
      cta: 'Listen / Watch',
      color: 'border-l-4 border-l-rose-600 bg-rose-50/40',
      tagColor: 'bg-rose-100 text-rose-800 border-rose-300',
      icon: Mic,
      iconColor: 'text-rose-600',
    },
  ];

  const filtered = activeTab === 'all' ? pillars : pillars.filter((p) => p.id === activeTab);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#1a3c6e] bg-blue-50 px-3 py-1 rounded-full border border-blue-200 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#ff9933]" />
            <span>MyGov Citizen Engagement Hub</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            Get Involved: Do, Discuss, Poll, Blog &amp; Talk
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Active national citizen initiatives in land administration, title verification, and rural spatial governance.
          </p>
        </div>

        {/* Pillar Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['all', 'do', 'discuss', 'poll', 'blog', 'talk'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-[#1a3c6e] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab === 'all' ? 'All Activities' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of MyGov Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-xl transition-all ${item.color}`}
            >
              <div>
                {/* Card Top Pill */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${item.tagColor} flex items-center gap-1.5`}>
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.type}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {item.typeHi}
                  </span>
                </div>

                {/* Card Title */}
                <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 hover:text-[#1a3c6e] transition-colors mb-2">
                  <Link href={item.href}>{item.title}</Link>
                </h3>

                {/* Card Summary */}
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                  {item.desc}
                </p>
              </div>

              <div>
                {/* Meta stats bar */}
                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 mb-4">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {item.metric}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {item.deadline}
                  </span>
                </div>

                {/* CTA Button */}
                <Link
                  href={item.href}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-[#1a3c6e] font-bold text-xs border border-slate-300 shadow-sm hover:border-[#1a3c6e] transition-all"
                >
                  <span>{item.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
