'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/schemas/auth';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import {
  GraduationCap,
  Scale,
  Landmark,
  Users,
  ShieldAlert,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { apiRequest, setAuthToken } from '@/lib/api/client';
import { OtpVerificationDialog } from '@/components/auth/otp-verification-dialog';

const PORTAL_SHORTCUTS = [
  {
    id: 'researcher',
    title: 'Researcher & Academic',
    desc: 'Cadastral GIS data, BibTeX citations, peer-reviewed research papers',
    href: '/login/researcher',
    icon: GraduationCap,
    badge: 'Academic',
    borderColor: 'hover:border-emerald-500 hover:bg-emerald-50/50',
    iconColor: 'text-emerald-700 bg-emerald-100',
  },
  {
    id: 'policymaker',
    title: 'Policy Maker & Analyst',
    desc: 'Statutory compliance tracking, state indicators, legislative drafts',
    href: '/login/policymaker',
    icon: Scale,
    badge: 'Policy',
    borderColor: 'hover:border-blue-500 hover:bg-blue-50/50',
    iconColor: 'text-blue-700 bg-blue-100',
  },
  {
    id: 'government',
    title: 'Government Agency',
    desc: 'Cadastral registry, title mutations, boundary verification & disputes',
    href: '/login/government',
    icon: Landmark,
    badge: 'Official',
    borderColor: 'hover:border-amber-500 hover:bg-amber-50/50',
    iconColor: 'text-amber-700 bg-amber-100',
  },
  {
    id: 'civil-society',
    title: 'Civil Society & Advocate',
    desc: 'Community tenure mapping, public interest watchdog, rights monitoring',
    href: '/login/civil-society',
    icon: Users,
    badge: 'Advocacy',
    borderColor: 'hover:border-teal-500 hover:bg-teal-50/50',
    iconColor: 'text-teal-700 bg-teal-100',
  },
  {
    id: 'admin',
    title: 'Platform Administrator',
    desc: 'Privileged console for user approvals, security audits & node control',
    href: '/login/admin',
    icon: ShieldAlert,
    badge: 'Superuser',
    borderColor: 'hover:border-purple-500 hover:bg-purple-50/50',
    iconColor: 'text-purple-700 bg-purple-100',
  },
];

export default function CentralLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [redirectParam, setRedirectParam] = useState<string | null>(null);
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [pendingOtpEmail, setPendingOtpEmail] = useState('');
  const [pendingDebugOtp, setPendingDebugOtp] = useState<string | null>(null);
  const { toast } = useToast();
  const { setUser, refreshUser } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const dest = sp.get('redirect') || sp.get('returnUrl');
      if (dest && dest.startsWith('/') && !dest.startsWith('//')) {
        setRedirectParam(dest);
      }
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await apiRequest<{
        token?: { access_token: string; token_type: string };
        user?: { id: string; email: string; full_name: string; role: string; is_active: boolean; is_superuser?: boolean };
        status?: string;
        message?: string;
        otp_required?: boolean;
        debug_otp?: string | null;
        email?: string;
      }>('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email.trim(),
          password: data.password,
        }),
      });

      if (response.otp_required) {
        setPendingOtpEmail(data.email.trim());
        setPendingDebugOtp(response.debug_otp || null);
        setOtpDialogOpen(true);
        toast({
          title: 'Two-Factor Authentication Code Sent',
          description: `A 6-digit security code with Team CodeNova branding was dispatched to ${data.email.trim()}.`,
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
        title: 'Authentication Successful',
        description: `Welcome back, ${response.user?.full_name || data.email}.`,
        variant: 'success',
      });

      const redirectUrl =
        redirectParam ||
        (typeof window !== 'undefined'
          ? (new URLSearchParams(window.location.search).get('redirect') ||
             new URLSearchParams(window.location.search).get('returnUrl'))
          : null);

      if (redirectUrl && redirectUrl.startsWith('/') && !redirectUrl.startsWith('//')) {
        router.push(redirectUrl);
      } else if (response.user?.is_superuser) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      let friendlyError = 'Invalid email or password. Please verify your credentials and try again.';
      const rawError = err?.message || '';

      if (rawError.toLowerCase().includes('inactive') || rawError.toLowerCase().includes('suspended')) {
        friendlyError = 'Your account is inactive or suspended. Please contact platform administrators.';
      } else if (rawError.toLowerCase().includes('rate limit') || rawError.includes('429')) {
        friendlyError = 'Too many sign-in attempts. Please wait a minute before trying again.';
      } else if (rawError && !rawError.includes('status 401') && !rawError.includes('Invalid email')) {
        friendlyError = rawError;
      }

      setErrorMessage(friendlyError);

      toast({
        title: 'Sign In Failed',
        description: friendlyError,
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
      {/* Page Title & Category Callout */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Role-Based Institutional Access
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Land Governance Authentication Hub
        </h1>
        <p className="text-sm text-slate-600">
          Sign in directly via the unified portal below, or select your dedicated institutional category portal for tailored workflows.
        </p>
        {redirectParam && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-center gap-2 max-w-lg mx-auto shadow-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Authentication required to access <strong className="font-semibold">{redirectParam}</strong>. Please sign in below to continue.
            </span>
          </div>
        )}
      </div>

      {/* Dedicated Category Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Dedicated Category Login Portals
          </h2>
          <Link
            href={redirectParam ? `/login/admin?redirect=${encodeURIComponent(redirectParam)}` : "/login/admin"}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:text-purple-900 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Administrator Portal
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {PORTAL_SHORTCUTS.map((portal) => {
            const Icon = portal.icon;
            const targetHref = redirectParam ? `${portal.href}?redirect=${encodeURIComponent(redirectParam)}` : portal.href;
            return (
              <Link
                key={portal.id}
                href={targetHref}
                className={`group p-5 rounded-2xl bg-white border border-slate-200 shadow-sm transition-all duration-200 flex flex-col justify-between ${portal.borderColor} hover:shadow-md hover:-translate-y-0.5`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${portal.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80">
                      {portal.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-slate-950">
                      {portal.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {portal.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-slate-950">
                  <span>Enter Portal</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Central Unified Form */}
      <div className="max-w-md mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xl space-y-6">
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center shadow-inner border border-slate-200">
            <Landmark className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Universal Sign In
          </h2>
          <p className="text-xs text-slate-500">
            Valid across all registered organizations, researchers, and departments
          </p>
        </div>

        {/* Error Message Alert */}
        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm animate-in fade-in duration-200"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Email field */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" aria-hidden="true" />
              </div>
              <input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                placeholder="registered.user@agency.gov"
                className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.email
                    ? 'border-rose-400 bg-rose-50/30 text-rose-900'
                    : 'border-slate-300 bg-white text-slate-900 hover:border-slate-400'
                }`}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p id="email-error" role="alert" className="text-xs text-rose-600 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
              >
                Password
              </label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  toast({
                    title: 'Password Reset Assistance',
                    description: 'Please contact your jurisdictional administrator or node manager.',
                    variant: 'default',
                  });
                }}
                className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" aria-hidden="true" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                placeholder="••••••••••••"
                className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.password
                    ? 'border-rose-400 bg-rose-50/30 text-rose-900'
                    : 'border-slate-300 bg-white text-slate-900 hover:border-slate-400'
                }`}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Eye className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" role="alert" className="text-xs text-rose-600 font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 active:bg-black shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                Authenticating...
              </>
            ) : (
              <>
                Sign In to LandGov
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        {/* Registration link */}
        <div className="pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Don&apos;t have an account yet?{' '}
            <Link
              href="/register"
              className="font-semibold text-emerald-700 hover:text-emerald-800 transition-colors underline-offset-2 hover:underline"
            >
              Register your organization here
            </Link>
          </p>
        </div>
      </div>

      {/* 2FA Verification Dialog with Team CodeNova branding */}
      <OtpVerificationDialog
        isOpen={otpDialogOpen}
        email={pendingOtpEmail}
        action="login"
        debugOtp={pendingDebugOtp}
        onCancel={() => setOtpDialogOpen(false)}
        onSuccess={(authData) => {
          setOtpDialogOpen(false);
          const redirectUrl =
            redirectParam ||
            (typeof window !== 'undefined'
              ? (new URLSearchParams(window.location.search).get('redirect') ||
                 new URLSearchParams(window.location.search).get('returnUrl'))
              : null);

          if (redirectUrl && redirectUrl.startsWith('/') && !redirectUrl.startsWith('//')) {
            router.push(redirectUrl);
          } else if (authData.user?.is_superuser) {
            router.push('/admin');
          } else {
            router.push('/dashboard');
          }
        }}
      />
    </div>
  );
}
