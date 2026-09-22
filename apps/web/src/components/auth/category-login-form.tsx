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
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Globe2,
} from 'lucide-react';
import { apiRequest, setAuthToken } from '@/lib/api/client';
import { OtpVerificationDialog } from '@/components/auth/otp-verification-dialog';

export type PortalCategory = 'researcher' | 'policymaker' | 'government' | 'civil-society' | 'admin';

interface PortalConfig {
  id: PortalCategory;
  categoryParam: string;
  name: string;
  badge: string;
  title: string;
  subtitle: string;
  placeholder: string;
  primaryColor: string;
  accentBg: string;
  badgeBg: string;
  buttonBg: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  redirectPath: string;
}

export const PORTAL_CONFIGS: Record<PortalCategory, PortalConfig> = {
  researcher: {
    id: 'researcher',
    categoryParam: 'academic',
    name: 'Researcher & Academic',
    badge: 'Academic & Scientific Clearance',
    title: 'Researcher Login Portal',
    subtitle: 'Access cadastral research repositories, peer-reviewed spatial datasets, and geospatial analytics',
    placeholder: 'scholar@university.ac.in',
    primaryColor: 'text-emerald-700',
    accentBg: 'bg-emerald-50/70 border-emerald-200/80',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    buttonBg: 'bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 focus-visible:ring-emerald-500',
    icon: GraduationCap,
    features: [
      'Cadastral geospatial datasets & GIS boundary vectors',
      'Peer-reviewed land tenure research repository',
      'Direct BibTeX citation metadata & full-text download',
    ],
    redirectPath: '/workspace/researcher',
  },
  policymaker: {
    id: 'policymaker',
    categoryParam: 'policy_maker',
    name: 'Policy Maker & Analyst',
    badge: 'Legislative & Policy Clearance',
    title: 'Policy Maker Login Portal',
    subtitle: 'Analyze statutory compliance indicators, gazette enactments, and regulatory performance metrics',
    placeholder: 'analyst@policycouncil.gov.in',
    primaryColor: 'text-blue-700',
    accentBg: 'bg-blue-50/70 border-blue-200/80',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
    buttonBg: 'bg-blue-700 hover:bg-blue-800 active:bg-blue-900 focus-visible:ring-blue-500',
    icon: Scale,
    features: [
      'Comparative state land reform analytics & compliance scores',
      'Statutory gazette enactments & legislative drafts',
      'Inter-jurisdictional policy impact tracking',
    ],
    redirectPath: '/workspace/policymaker',
  },
  government: {
    id: 'government',
    categoryParam: 'government',
    name: 'Government Agency',
    badge: 'Official Cadastral Clearance',
    title: 'Government Agency Portal',
    subtitle: 'Manage land registries, deed mutations, revenue surveys, and official dispute resolution workflows',
    placeholder: 'officer@revenue.gov.in',
    primaryColor: 'text-amber-700',
    accentBg: 'bg-amber-50/70 border-amber-200/80',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-200',
    buttonBg: 'bg-amber-700 hover:bg-amber-800 active:bg-amber-900 focus-visible:ring-amber-500',
    icon: Landmark,
    features: [
      'Official cadastral boundaries & spatial parcel registries',
      'Deed mutation & title verification audit pipelines',
      'Unmasked high-priority land dispute hotspots',
    ],
    redirectPath: '/workspace/government',
  },
  'civil-society': {
    id: 'civil-society',
    categoryParam: 'civil_society',
    name: 'Civil Society & Advocate',
    badge: 'Public Interest & NGO Clearance',
    title: 'Civil Society Login Portal',
    subtitle: 'Support grassroots land tenure rights, public advocacy monitoring, and community tenure mapping',
    placeholder: 'advocate@landaction.org',
    primaryColor: 'text-teal-700',
    accentBg: 'bg-teal-50/70 border-teal-200/80',
    badgeBg: 'bg-teal-100 text-teal-800 border-teal-200',
    buttonBg: 'bg-teal-700 hover:bg-teal-800 active:bg-teal-900 focus-visible:ring-teal-500',
    icon: Users,
    features: [
      'Community tenure & customary land rights mapping',
      'Public land governance watchdog alerts',
      'Grassroots grievance escalation tracking',
    ],
    redirectPath: '/workspace/civil-society',
  },
  admin: {
    id: 'admin',
    categoryParam: '',
    name: 'Platform Administrator',
    badge: 'Superuser / Security Clearance',
    title: 'Administrator Login Portal',
    subtitle: 'System configuration, pending organizational approvals, credential audits, and role governance',
    placeholder: 'admin@landgov.gov.in',
    primaryColor: 'text-purple-700',
    accentBg: 'bg-purple-50/70 border-purple-200/80',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
    buttonBg: 'bg-purple-700 hover:bg-purple-800 active:bg-purple-900 focus-visible:ring-purple-500',
    icon: ShieldAlert,
    features: [
      'Pending organization membership approvals queue',
      'User access control, suspension & role governance',
      'System-wide audit logs & RLS policy enforcement',
    ],
    redirectPath: '/admin',
  },
};

interface CategoryLoginFormProps {
  portal: PortalCategory;
}

export function CategoryLoginForm({ portal }: CategoryLoginFormProps) {
  const config = PORTAL_CONFIGS[portal];
  const IconComponent = config.icon;

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [pendingOtpEmail, setPendingOtpEmail] = useState('');
  const [pendingDebugOtp, setPendingDebugOtp] = useState<string | null>(null);
  const { toast } = useToast();
  const { setUser, refreshUser } = useAuth();
  const router = useRouter();

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
        user?: {
          id: string;
          email: string;
          full_name: string;
          role: string;
          is_active: boolean;
          is_superuser?: boolean;
        };
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
        description: `Welcome back to the ${config.name} Portal, ${response.user?.full_name || data.email}.`,
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
        router.push(config.redirectPath);
      }
    } catch (err: any) {
      let friendlyError = 'Invalid email or password. Please verify your credentials and try again.';
      const rawError = err?.message || '';

      if (rawError.toLowerCase().includes('inactive') || rawError.toLowerCase().includes('suspended')) {
        friendlyError = 'Your account is currently inactive or suspended. Please contact platform administrators.';
      } else if (rawError.toLowerCase().includes('rate limit') || rawError.includes('429')) {
        friendlyError = 'Too many sign-in attempts. Please wait a moment before trying again.';
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

  const portalKeys: PortalCategory[] = ['researcher', 'policymaker', 'government', 'civil-society', 'admin'];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Category Navigation Ribbon */}
      <div className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-1 shadow-sm">
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 px-1 max-w-full">
          <Link
            href="/login"
            className="px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors text-slate-600 hover:text-slate-900 hover:bg-white"
          >
            All Portals
          </Link>
          {portalKeys.map((key) => {
            const isCurrent = key === portal;
            const p = PORTAL_CONFIGS[key];
            const PIcon = p.icon;
            return (
              <Link
                key={key}
                href={`/login/${key}`}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <PIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{p.name}</span>
                <span className="sm:hidden">{p.id.charAt(0).toUpperCase() + p.id.slice(1)}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
        {/* Left Side: Category Branding & Highlights */}
        <div className={`lg:col-span-5 p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200/80 ${config.accentBg}`}>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.badgeBg}`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                {config.badge}
              </span>
            </div>

            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-md border border-slate-200/80 flex items-center justify-center">
                <IconComponent className={`w-8 h-8 ${config.primaryColor}`} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {config.name} Portal
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {config.subtitle}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200/60 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Portal Capabilities
              </p>
              <ul className="space-y-2.5">
                {config.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${config.primaryColor}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Globe2 className="w-3.5 h-3.5" />
              Land Governance Trust Framework
            </span>
            <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200">
              v2.4
            </span>
          </div>
        </div>

        {/* Right Side: Secure Login Form */}
        <div className="lg:col-span-7 p-8 lg:p-10 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div className="space-y-1.5">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Institutional Sign In
              </h1>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 mt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                2FA Verification Mandatory
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Enter your credentials registered with the cadastral governance directory
              </p>
            </div>

            {/* Error Alert */}
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
                  Institutional Email
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
                    placeholder={config.placeholder}
                    className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none focus:ring-2 ${
                      errors.email
                        ? 'border-rose-400 bg-rose-50/30 text-rose-900'
                        : 'border-slate-300 bg-white text-slate-900 hover:border-slate-400 focus:ring-slate-500'
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
                        title: 'Credential Reset',
                        description: `Please contact your ${config.name} nodal jurisdiction administrator.`,
                        variant: 'default',
                      });
                    }}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900"
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
                    className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none focus:ring-2 ${
                      errors.password
                        ? 'border-rose-400 bg-rose-50/30 text-rose-900'
                        : 'border-slate-300 bg-white text-slate-900 hover:border-slate-400 focus:ring-slate-500'
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
                className={`w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white shadow-md transition-all focus:outline-none focus-visible:ring-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer ${config.buttonBg}`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    Verifying Credentials...
                  </>
                ) : (
                  <>
                    Access {config.name}
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </form>

            {/* Registration link */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <span>Need institutional credentials?</span>
              <Link
                href={
                  config.categoryParam
                    ? `/register?category=${config.categoryParam}`
                    : '/register'
                }
                className="font-semibold text-slate-800 hover:text-slate-950 inline-flex items-center gap-1 group"
              >
                Register as {config.name}
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2FA Verification Dialog with Team CodeNova branding */}
      <OtpVerificationDialog
        isOpen={otpDialogOpen}
        email={pendingOtpEmail}
        action="login"
        debugOtp={pendingDebugOtp}
        onCancel={() => setOtpDialogOpen(false)}
        onSuccess={() => {
          setOtpDialogOpen(false);
          const redirectUrl =
            typeof window !== 'undefined'
              ? (new URLSearchParams(window.location.search).get('redirect') ||
                 new URLSearchParams(window.location.search).get('returnUrl'))
              : null;

          if (redirectUrl && redirectUrl.startsWith('/') && !redirectUrl.startsWith('//')) {
            router.push(redirectUrl);
          } else {
            router.push(config.redirectPath);
          }
        }}
      />
    </div>
  );
}
