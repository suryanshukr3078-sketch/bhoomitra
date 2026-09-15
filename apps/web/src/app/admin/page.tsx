'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api/client';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  Building2,
  AlertCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Mail,
} from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  organization_name?: string | null;
  organization_id?: string | null;
  organization_type?: string | null;
  category?: string | null;
  membership_status?: string | null;
  user_status: string;
  role: string;
  is_superuser: boolean;
  created_at: string;
}

interface AdminOrg {
  id: string;
  name: string;
  slug: string;
  organization_type: string;
  member_count: number;
  is_active: boolean;
  created_at: string;
}

export default function AdminDashboardPage() {
  const [pendingUsers, setPendingUsers] = useState<AdminUser[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [organizations, setOrganizations] = useState<AdminOrg[]>([]);
  const [smtpStatus, setSmtpStatus] = useState<{ configured: boolean; protocol: string; provider: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersRes, orgsRes, smtpRes] = await Promise.all([
        apiRequest<{ users: AdminUser[]; total: number }>('/admin/users'),
        apiRequest<{ organizations: AdminOrg[]; total: number }>('/admin/organizations'),
        apiRequest<any>('/auth/smtp-status').catch(() => null),
      ]);

      const usersList = usersRes.users || [];
      setAllUsers(usersList);
      setOrganizations(orgsRes.organizations || []);
      if (smtpRes) {
        setSmtpStatus(smtpRes);
      }

      const pending = usersList.filter(
        (u) =>
          u.membership_status === 'pending' ||
          u.user_status === 'pending'
      );
      setPendingUsers(pending);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to fetch administrative data.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleApprove = async (userId: string, userName: string) => {
    setActionLoadingId(userId);
    setFeedback(null);
    try {
      await apiRequest(`/admin/memberships/${userId}/approve`, {
        method: 'PATCH',
      });
      setFeedback({
        type: 'success',
        message: `Successfully approved verification for ${userName}. User account is now active.`,
      });
      await loadDashboardData();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || `Failed to approve registration for ${userName}.`,
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to reject the registration for ${userName}? This will remove the membership and suspend access.`)) {
      return;
    }

    setActionLoadingId(userId);
    setFeedback(null);
    try {
      await apiRequest(`/admin/memberships/${userId}/reject`, {
        method: 'PATCH',
      });
      setFeedback({
        type: 'success',
        message: `Rejected registration for ${userName}. Membership marked as removed.`,
      });
      await loadDashboardData();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || `Failed to reject registration for ${userName}.`,
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const activeUsersCount = allUsers.filter((u) => u.user_status === 'active').length;

  return (
    <div className="space-y-8">
      {/* Alert / Feedback Notification */}
      {feedback && (
        <div
          role="alert"
          className={`p-4 rounded-xl border flex items-center justify-between text-sm shadow-sm transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold underline underline-offset-2 opacity-80 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{allUsers.length}</div>
          <p className="text-xs text-slate-500">Registered across all categories</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200/90 bg-amber-50/20 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-900">{pendingUsers.length}</div>
          <p className="text-xs text-amber-700">Government & Policy Maker verifications</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Organizations</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{organizations.length}</div>
          <p className="text-xs text-slate-500">Agencies, institutions & bodies</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Accounts</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">{activeUsersCount}</div>
          <p className="text-xs text-slate-500">Authorized workspace contributors</p>
        </div>
      </div>

      {/* Email & SMTP Status Quick Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Email Delivery & SMTP Service</h3>
              {smtpStatus?.configured ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Operational
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                  <AlertCircle className="w-3 h-3 text-amber-600" /> Standby / Simulated
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Protocol: <span className="font-semibold text-slate-700">{smtpStatus?.protocol || 'HTTP API / SMTP'}</span> • Provider: <span className="font-semibold text-slate-700 capitalize">{smtpStatus?.provider || 'Default'}</span>
            </p>
          </div>
        </div>

        <Link
          href="/admin/smtp"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors whitespace-nowrap"
        >
          <span>Open SMTP Command Center</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Pending Approvals Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Pending Registration Approvals
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                {pendingUsers.length} Awaiting Verification
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Government Agency and Policy Maker registrations requiring administrative identity approval before login access is granted.
            </p>
          </div>

          <button
            onClick={loadDashboardData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh List
          </button>
        </div>

        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-xs text-slate-500">Loading pending verification requests...</p>
          </div>
        ) : pendingUsers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">All Clear! No Pending Approvals</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              There are currently no Government Agency or Policy Maker registrations awaiting review.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-3.5">User / Official</th>
                  <th scope="col" className="px-6 py-3.5">Organization</th>
                  <th scope="col" className="px-6 py-3.5">Category & Title</th>
                  <th scope="col" className="px-6 py-3.5">Submitted On</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Verification Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {pendingUsers.map((item) => {
                  const isActioning = actionLoadingId === item.id;
                  const dateStr = new Date(item.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{item.full_name}</div>
                        <div className="text-slate-500 font-mono text-[11px]">{item.email}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {item.organization_name || (
                          <span className="text-slate-400 italic">Not Specified</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                          {item.category || item.organization_type || 'Government Agency'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(item.id, item.full_name)}
                            disabled={isActioning}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-xl shadow-sm transition-colors"
                          >
                            {isActioning ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(item.id, item.full_name)}
                            disabled={isActioning}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 disabled:opacity-50 rounded-xl transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Navigation Footnotes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/admin/users"
          className="p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-500/50 shadow-sm hover:shadow transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 group-hover:bg-emerald-50 text-slate-600 group-hover:text-emerald-700 transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Manage All Users</div>
              <p className="text-xs text-slate-500">Filter, search, and audit all registered workspace accounts</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
        </Link>

        <Link
          href="/admin/organizations"
          className="p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-500/50 shadow-sm hover:shadow transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 group-hover:bg-emerald-50 text-slate-600 group-hover:text-emerald-700 transition-colors">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Organizations Directory</div>
              <p className="text-xs text-slate-500">View registered departments, academic centers, and member counts</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
        </Link>
      </div>
    </div>
  );
}
