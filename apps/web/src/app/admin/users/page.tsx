'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/api/client';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Building2,
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') {
        params.set('status', statusFilter);
      }
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }
      const url = `/admin/users${params.toString() ? `?${params.toString()}` : ''}`;
      const data = await apiRequest<{ users: AdminUser[]; total: number }>(url);
      setUsers(data.users || []);
    } catch (err: any) {
      console.error('Failed to load users:', err);
      setNotification({
        type: 'error',
        message: err.message || 'Failed to load user records.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleApprove = async (userId: string, name: string) => {
    setActionLoadingId(userId);
    try {
      await apiRequest(`/admin/memberships/${userId}/approve`, {
        method: 'PATCH',
      });
      setNotification({
        type: 'success',
        message: `Approved registration for ${name}. User account activated.`,
      });
      fetchUsers();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to approve user.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (userId: string, name: string) => {
    if (!window.confirm(`Reject registration for ${name}?`)) return;
    setActionLoadingId(userId);
    try {
      await apiRequest(`/admin/memberships/${userId}/reject`, {
        method: 'PATCH',
      });
      setNotification({
        type: 'success',
        message: `Rejected registration for ${name}. Access suspended.`,
      });
      fetchUsers();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to reject user.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {notification && (
        <div
          role="alert"
          className={`p-4 rounded-xl border flex items-center justify-between text-sm shadow-sm transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs underline font-semibold opacity-80 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">User Management</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect registered accounts, collaborative roles, and verification statuses.
            </p>
          </div>

          <button
            onClick={fetchUsers}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by user full name or email address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white cursor-pointer appearance-none text-slate-700"
            >
              <option value="all">All Account Statuses</option>
              <option value="active">Active (Verified)</option>
              <option value="pending">Pending Verification</option>
              <option value="suspended">Suspended / Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-xs text-slate-500">Loading user directory...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No users match your filters</p>
            <p className="text-xs text-slate-500">
              Try adjusting your search query or reset the status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-3.5">User</th>
                  <th scope="col" className="px-6 py-3.5">Organization</th>
                  <th scope="col" className="px-6 py-3.5">Category & Title</th>
                  <th scope="col" className="px-6 py-3.5">Status</th>
                  <th scope="col" className="px-6 py-3.5">Registered On</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((u) => {
                  const isActioning = actionLoadingId === u.id;
                  const isPending =
                    u.membership_status === 'pending' || u.user_status === 'pending';
                  const isSuspended =
                    u.membership_status === 'removed' ||
                    u.user_status === 'suspended' ||
                    u.user_status === 'disabled';

                  const dateStr = new Date(u.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-slate-900">{u.full_name}</div>
                          {u.is_superuser && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <div className="text-slate-500 font-mono text-[11px]">{u.email}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {u.organization_name || (
                          <span className="text-slate-400 italic">Individual</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {u.category || u.organization_type || 'Civil Society'}
                      </td>
                      <td className="px-6 py-4">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        ) : isSuspended ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                            <XCircle className="w-3 h-3" />
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {isPending ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleApprove(u.id, u.full_name)}
                              disabled={isActioning}
                              className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-lg transition-colors shadow-sm"
                            >
                              {isActioning ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                'Approve'
                              )}
                            </button>
                            <button
                              onClick={() => handleReject(u.id, u.full_name)}
                              disabled={isActioning}
                              className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 disabled:opacity-50 rounded-lg transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">—</span>
                        )}
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
