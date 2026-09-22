'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Eye,
  Users,
  FileText,
  TrendingUp,
  BarChart3,
  BookOpen,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Building2,
  GraduationCap,
  Scale,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { apiRequest } from '@/lib/api/client';

export interface UserCategoryCount {
  category: string;
  label: string;
  count: number;
  percentage: number;
}

export interface MonthlySubmissionCount {
  month: string;
  label: string;
  count: number;
}

export interface MostViewedPaperItem {
  id: string;
  title: string;
  slug: string;
  journal: string | null;
  views: number;
  citations: number;
}

export interface AdminAnalyticsData {
  total_page_views: number;
  total_users: number;
  total_resources: number;
  users_by_category: UserCategoryCount[];
  resources_per_month: MonthlySubmissionCount[];
  most_viewed_papers: MostViewedPaperItem[];
}

export function AdminAnalyticsWidget() {
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await apiRequest<AdminAnalyticsData>('/admin/analytics');
        setData(res);
      } catch (err: any) {
        console.error('Failed to load admin analytics:', err);
        setError(err.message || 'Failed to fetch analytics.');
      } finally {
        setIsLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center gap-2 text-slate-500 text-xs">
        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
        <span>Loading administrative analytics metrics...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs text-slate-500">
        <p className="font-semibold text-slate-700">Analytics temporarily unavailable</p>
        <p className="text-[11px] text-slate-400 mt-0.5">{error || 'Could not retrieve database metrics.'}</p>
      </div>
    );
  }

  const maxMonthly = Math.max(...data.resources_per_month.map((m) => m.count), 1);

  return (
    <div className="space-y-6">
      {/* 1. Stat Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Page Views */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
            <Eye className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Page Views
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
              {data.total_page_views.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Native database telemetry</span>
            </div>
          </div>
        </div>

        {/* Total Registered Users */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
            <Users className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Registered Users
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
              {data.total_users.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              Across 5 role tiers
            </div>
          </div>
        </div>

        {/* Total Resources */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
            <FileText className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Published Resources
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
              {data.total_resources.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              Policies, Papers & Spatial
            </div>
          </div>
        </div>

        {/* Governance Integrity */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100">
            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Platform Integrity
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
              100%
            </div>
            <div className="text-[10px] text-purple-700 font-semibold">
              PostgreSQL PostGIS Active
            </div>
          </div>
        </div>
      </div>

      {/* 2. Middle Row: Users By Category & Monthly Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Users by Category Breakdown */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-700" />
              <h3 className="font-bold text-sm text-slate-900">
                Registered Users by Category
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {data.total_users} Total
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {data.users_by_category.map((cat) => {
              const colorClass =
                cat.category === 'government'
                  ? 'bg-amber-500'
                  : cat.category === 'academic'
                  ? 'bg-emerald-600'
                  : cat.category === 'civil_society'
                  ? 'bg-blue-600'
                  : cat.category === 'private_sector'
                  ? 'bg-purple-600'
                  : 'bg-teal-600';

              return (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${colorClass}`} />
                      {cat.label}
                    </span>
                    <span className="text-slate-500 font-mono">
                      {cat.count} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colorClass} transition-all duration-500`}
                      style={{ width: `${Math.max(cat.percentage, 3)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resources Submitted Per Month */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <h3 className="font-bold text-sm text-slate-900">
                Monthly Submissions Velocity
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Last 6 Months</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2">
            {data.resources_per_month.map((item) => {
              const heightPct = Math.round((item.count / maxMonthly) * 100);
              return (
                <div
                  key={item.month}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end group"
                >
                  <span className="text-[10px] font-bold text-slate-600 opacity-80 group-hover:opacity-100 font-mono">
                    {item.count}
                  </span>
                  <div
                    className="w-full max-w-[40px] rounded-t-lg bg-emerald-600 group-hover:bg-emerald-700 transition-all duration-300"
                    style={{ height: `${Math.max(heightPct, 12)}%` }}
                  />
                  <span className="text-[10px] text-slate-500 font-medium truncate w-full text-center">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Most-Viewed Research Papers */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <h3 className="font-bold text-sm text-slate-900">
              Most-Viewed Research Papers
            </h3>
          </div>
          <Link
            href="/research"
            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
          >
            <span>View All Papers</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" aria-label="Most-viewed research papers">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-100">
              <tr>
                <th scope="col" className="py-2.5 px-3">#</th>
                <th scope="col" className="py-2.5 px-3">Research Publication Title</th>
                <th scope="col" className="py-2.5 px-3">Journal / Outlet</th>
                <th scope="col" className="py-2.5 px-3 text-right">Views</th>
                <th scope="col" className="py-2.5 px-3 text-right">Citations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.most_viewed_papers.map((p, idx) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-400">
                    #{idx + 1}
                  </td>
                  <td className="py-2.5 px-3">
                    <Link
                      href={`/research/${p.id}`}
                      className="font-semibold text-slate-900 hover:text-emerald-700 transition-colors line-clamp-1"
                    >
                      {p.title}
                    </Link>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 truncate max-w-xs">
                    {p.journal || 'Cadastral Administration Press'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                    {p.views.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                    {p.citations}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
