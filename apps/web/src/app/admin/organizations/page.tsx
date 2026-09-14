'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/api/client';
import {
  Building2,
  Search,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Building,
} from 'lucide-react';

interface AdminOrg {
  id: string;
  name: string;
  slug: string;
  organization_type: string;
  member_count: number;
  is_active: boolean;
  created_at: string;
}

export default function AdminOrganizationsPage() {
  const [orgs, setOrgs] = useState<AdminOrg[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }
      const url = `/admin/organizations${params.toString() ? `?${params.toString()}` : ''}`;
      const data = await apiRequest<{ organizations: AdminOrg[]; total: number }>(url);
      setOrgs(data.organizations || []);
    } catch (err: any) {
      console.error('Failed to load organizations:', err);
      setError(err.message || 'Failed to load organization records.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrganizations();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchOrganizations]);

  return (
    <div className="space-y-6">
      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl border bg-rose-50 border-rose-200 text-rose-900 text-sm flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Organizations Directory</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review government agencies, academic research centers, and civil society bodies.
            </p>
          </div>

          <button
            onClick={fetchOrganizations}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by organization name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-xs text-slate-500">Loading organizations...</p>
          </div>
        ) : orgs.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No organizations found</p>
            <p className="text-xs text-slate-500">
              Try changing your search query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Organization</th>
                  <th scope="col" className="px-6 py-3.5">Category / Type</th>
                  <th scope="col" className="px-6 py-3.5">Registered Members</th>
                  <th scope="col" className="px-6 py-3.5">Status</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Established</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {orgs.map((org) => {
                  const dateStr = new Date(org.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <tr key={org.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{org.name}</div>
                        <div className="text-slate-400 font-mono text-[11px]">{org.slug}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wide">
                          {org.organization_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{org.member_count} {org.member_count === 1 ? 'member' : 'members'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {org.is_active ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Inactive</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500 whitespace-nowrap">
                        {dateStr}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
