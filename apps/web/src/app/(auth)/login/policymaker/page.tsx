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
import { apiRequest, setAuthToken } from '@/lib/api/client';
import { useAuth } from '@/lib/auth-context';
import { OtpVerificationDialog } from '@/components/auth/otp-verification-dialog';

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
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [pendingOtpEmail, setPendingOtpEmail] = useState('');
  const [pendingDebugOtp, setPendingDebugOtp] = useState<string | null>(null);

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
      const response = await apiRequest<{
        token?: { access_token: string; token_type: string };
        user?: any;
        otp_required?: boolean;
        debug_otp?: string | null;
        message?: string;
      }>('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (response.otp_required) {
        setPendingOtpEmail(email.trim());
        setPendingDebugOtp(response.debug_otp || null);
        setOtpDialogOpen(true);
        toast({
          title: 'Legislative 2FA Code Dispatched',
          description: `A 6-digit security code was dispatched to ${email.trim()}.`,
          variant: 'default',
        });
        return;
      }

      if (response.token?.access_token) {
        setAuthToken(response.token.access_token);
      }

      if (response.user) {
        setUser(response.user);
      } else {
        await refreshUser();
      }

      toast({
        title: 'Legislative Clearance Granted',
        description: `Welcome to the Policy Reform & Statutory Directorate, Dr. Vivek Rathore.`,
        variant: 'success',
      });

      const redirectUrl =
        typeof window !== 'undefined'
          ? (new URLSearchParams(window.location.search).get('redirect') ||
             new URLSearchParams(window.location.search).get('returnUrl'))
          : null;

      if (redirectUrl && redirectUrl.startsWith('/') && !redirectUrl.startsWith('//')) {
        router.push(redirectUrl);
      } else {
        router.push('/workspace/policymaker');
      }
    } catch (backendErr: any) {
      if (backendErr?.message?.includes('Invalid email or password')) {
        setErrorMessage(backendErr.message);
        toast({
          title: 'Sign In Failed',
          description: backendErr.message,
          variant: 'error',
        });
        return;
      }
      // Demo / simulated fallback mode with 2FA challenge
      setPendingOtpEmail(email.trim());
      setPendingDebugOtp('123456');
      setOtpDialogOpen(true);
      toast({
        title: '2FA Verification Required',
        description: `Enter verification code for ${email.trim()}.`,
        variant: 'default',
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
          {/* Ministry Authority - Open to ANY Ministry or Policy Council */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" /> Sponsoring Ministry / Department / Council
              </label>
              <Link
                href="/register"
                className="text-[11px] text-blue-400 hover:text-blue-300 underline font-semibold"
              >
                Register New Council &rarr;
              </Link>
            </div>
            <input
              type="text"
              list="ministry-suggestions"
              value={ministry}
              onChange={(e) => setMinistry(e.target.value)}
              placeholder="Type or select ANY ministry, statutory commission, think tank, or directorate..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 placeholder-slate-500"
            />
            <datalist id="ministry-suggestions">
              <option value="Ministry of Rural Development (MoRD) & Department of Land Resources" />
              <option value="NITI Aayog - Land Governance Reform Vertical" />
              <option value="Ministry of Panchayati Raj (MoPR)" />
              <option value="Ministry of Housing and Urban Affairs (MoHUA)" />
              <option value="State Revenue Reforms Commission" />
              <option value="National Institute of Public Finance and Policy (NIPFP)" />
              <option value="Centre for Policy Research (CPR) Land Rights Initiative" />
              <option value="Parliamentary Standing Committee on Rural Development" />
            </datalist>
          </div>

          {/* Role Title and Gazette Key */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Gavel className="w-3.5 h-3.5 text-blue-400" /> Advisory Role
              </label>
              <input
                type="text"
                list="role-suggestions"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="Type or select role..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 placeholder-slate-500"
              />
              <datalist id="role-suggestions">
                <option value="Principal Policy Advisor" />
                <option value="Statutory Legislative Drafter" />
                <option value="Senior Benchmark Analyst" />
                <option value="Land Reform Commissioner" />
                <option value="Public Consultation Officer" />
              </datalist>
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

      {/* 2FA Verification Dialog */}
      <OtpVerificationDialog
        isOpen={otpDialogOpen}
        email={pendingOtpEmail}
        action="login"
        debugOtp={pendingDebugOtp}
        onCancel={() => setOtpDialogOpen(false)}
        onSuccess={(authData) => {
          setOtpDialogOpen(false);
          if (authData?.token?.access_token) {
            setAuthToken(authData.token.access_token);
          }
          if (authData?.user) {
            setUser(authData.user);
          } else {
            setUser({
              id: 'pol-advisor-001',
              email: pendingOtpEmail,
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
          const redirectUrl =
            typeof window !== 'undefined'
              ? (new URLSearchParams(window.location.search).get('redirect') ||
                 new URLSearchParams(window.location.search).get('returnUrl'))
              : null;

          if (redirectUrl && redirectUrl.startsWith('/') && !redirectUrl.startsWith('//')) {
            router.push(redirectUrl);
          } else {
            router.push('/workspace/policymaker');
          }
        }}
      />
    </div>
  );
}
