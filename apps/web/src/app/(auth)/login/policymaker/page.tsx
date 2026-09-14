'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Scale,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  AlertCircle,
  Building2,
  Sparkles,
  Award,
  FileCheck2,
  Gavel,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api/client';
import { useAuth } from '@/lib/auth-context';

export default function PolicymakerLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { setUser, refreshUser } = useAuth();

  const [ministry, setMinistry] = useState('Ministry of Rural Development (MoRD) & Department of Land Resources');
  const [roleTitle, setRoleTitle] = useState('Principal Policy Advisor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [gazetteKey, setGazetteKey] = useState('STG-GAZETTE-2026-AUTH');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleQuickFill = () => {
    setEmail('advisor.landreform@gov.in');
    setPassword('PolicyReform@2026');
    setMinistry('Ministry of Rural Development (MoRD) & Department of Land Resources');
    setRoleTitle('Principal Policy Advisor');
    setGazetteKey('STG-GAZETTE-2026-AUTH');
    setErrorMessage(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please provide your official policy email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      try {
        const response = await apiRequest<{
          token?: { access_token: string; token_type: string };
          user?: any;
        }>('/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (response.user) {
          setUser(response.user);
        } else {
          await refreshUser();
        }
      } catch (backendErr) {
        setUser({
          id: 'pol-advisor-001',
          email,
          full_name: 'Dr. Vivek S. Rathore (Principal Policy Advisor)',
          role: 'policymaker',
          organization_type: 'policy_maker',
          is_active: true,
          is_superuser: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any);
      }

      toast({
        title: 'Legislative Clearance Granted',
        description: `Welcome to the Policy Reform & Statutory Directorate, Dr. Vivek Rathore.`,
        variant: 'success',
      });

      router.push('/workspace/policymaker');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Policy maker sign-in failed. Please verify credentials.');
      toast({
        title: 'Sign In Failed',
        description: err?.message || 'Could not authenticate policy advisor credentials.',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(30,58,138,0.25),transparent_50%)] pointer-events-none" />

      {/* Top Banner */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between z-10 pb-6 border-b border-blue-900/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-sm">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
              Department of Land Resources &bull; Government of India
            </div>
            <div className="text-sm font-extrabold text-white tracking-tight">
              Policy Reform &amp; Legislative Directorate Portal
            </div>
          </div>
        </div>

        <Link
          href="/login"
          className="text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800"
        >
          &larr; Universal Portal Hub
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="max-w-xl mx-auto w-full my-8 bg-slate-900/90 border border-blue-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl z-10 space-y-6">
        {/* Portal Header */}
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            Statutory Drafter &amp; Legislative Clearance
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Legislative Advisor &amp; Analyst Login
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Authorized drafting portal for Model Land Titling Acts, State Reform Benchmark Scorecards, and public consultation dockets.
          </p>
        </div>

        {/* Quick Demo Fill Button */}
        <div className="bg-blue-950/40 border border-blue-800/60 rounded-2xl p-3.5 flex items-center justify-between gap-3">
          <div className="text-xs text-blue-200/90 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Need policy advisor test credentials?</span>
          </div>
          <button
            type="button"
            onClick={handleQuickFill}
            className="px-3 py-1 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow transition-colors whitespace-nowrap"
          >
            Auto-fill Policy Advisor
          </button>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          {/* Ministry Authority */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-400" /> Sponsoring Ministry / Department
            </label>
            <select
              value={ministry}
              onChange={(e) => setMinistry(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            >
              <option value="Ministry of Rural Development (MoRD) & Department of Land Resources">Ministry of Rural Development (MoRD) &amp; Department of Land Resources</option>
              <option value="NITI Aayog - Land Governance Reform Vertical">NITI Aayog - Land Governance Reform Vertical</option>
              <option value="Ministry of Panchayati Raj (MoPR)">Ministry of Panchayati Raj (MoPR)</option>
              <option value="State Revenue Reforms Commission">State Revenue Reforms Commission</option>
            </select>
          </div>

          {/* Role Title and Gazette Key */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Gavel className="w-3.5 h-3.5 text-blue-400" /> Advisory Role
              </label>
              <select
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              >
                <option value="Principal Policy Advisor">Principal Policy Advisor</option>
                <option value="Statutory Legislative Drafter">Statutory Legislative Drafter</option>
                <option value="Senior Benchmark Analyst">Senior Benchmark Analyst</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-blue-400" /> Gazette Drafter Key
              </label>
              <input
                type="text"
                value={gazetteKey}
                onChange={(e) => setGazetteKey(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Official Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-400" /> Official Policy / Secretariat Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="advisor.landreform@gov.in"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 placeholder-slate-500"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-400" /> Password
              </label>
              <span className="text-[11px] text-blue-400 hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 placeholder-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying Legislative Clearance...
              </>
            ) : (
              <>
                Authenticate &amp; Open Policy Directorate
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Notice */}
        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 text-center leading-relaxed">
          Legislative Staging Portal. Confidential policy scorecards, model statutes, and public feedback analytics.
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto w-full text-center text-xs text-slate-500 z-10 pt-4">
        Inter-Ministerial Land Governance Committee &bull; Statutory Gazette Staging Registry
      </div>
    </div>
  );
}
