'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormData } from '@/schemas/auth';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import {
  Landmark,
  User,
  Mail,
  Building2,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Check,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Clock,
  GraduationCap,
  Scale,
  Users,
  ShieldCheck,
  Briefcase,
  TreePine,
  Globe2,
  Sparkles,
} from 'lucide-react';
import { apiRequest, setAuthToken } from '@/lib/api/client';
import { OtpVerificationDialog } from '@/components/auth/otp-verification-dialog';

interface CategoryOption {
  id: string;
  title: string;
  badge: string;
  isPending: boolean;
  description: string;
  icon: React.ElementType;
  placeholderOrg: string;
}

const CATEGORIES: CategoryOption[] = [
  {
    id: 'academic',
    title: 'Academic Institution / University / College',
    badge: 'Instant Access',
    isPending: false,
    description: 'Any university, college, educational faculty, polytechnic, or school',
    icon: GraduationCap,
    placeholderOrg: 'e.g. National University of Technology, Delhi University, etc.',
  },
  {
    id: 'research',
    title: 'Scientific Research Institute / GIS Lab',
    badge: 'Instant Access',
    isPending: false,
    description: 'Autonomous research centres, geomatics laboratories, and spatial observatories',
    icon: Briefcase,
    placeholderOrg: 'e.g. Centre for Geospatial & Cadastral Analytics',
  },
  {
    id: 'government',
    title: 'Government Agency & Revenue Authority',
    badge: 'Verification Required',
    isPending: true,
    description: 'State revenue departments, land administration directorates, and municipal bodies',
    icon: Landmark,
    placeholderOrg: 'e.g. Directorate of Land Records & Revenue Surveys',
  },
  {
    id: 'policy_maker',
    title: 'Policy Maker, Statutory Body & Think Tank',
    badge: 'Verification Required',
    isPending: true,
    description: 'Legislative committees, statutory policy advisory commissions, and governance councils',
    icon: Scale,
    placeholderOrg: 'e.g. State Land Governance Reform Commission',
  },
  {
    id: 'civil_society',
    title: 'Civil Society Organization / NGO',
    badge: 'Instant Access',
    isPending: false,
    description: 'Public interest NGOs, legal aid foundations, and community rights networks',
    icon: Users,
    placeholderOrg: 'e.g. People’s Land Rights Action Network',
  },
  {
    id: 'community',
    title: 'Community, Tribal Council & Gram Sabha',
    badge: 'Instant Access',
    isPending: false,
    description: 'Gram Sabhas, customary forest tenure collectives, pastoral panchayats',
    icon: TreePine,
    placeholderOrg: 'e.g. Mendha Lekha Gram Sabha Forest Rights Collective',
  },
  {
    id: 'private',
    title: 'Private Enterprise / Geomatics Industry',
    badge: 'Instant Access',
    isPending: false,
    description: 'Drone survey firms, private GIS software providers, and agri-tech consultancies',
    icon: Building2,
    placeholderOrg: 'e.g. Apex Geomatics & Land Survey Solutions Pvt Ltd',
  },
  {
    id: 'international',
    title: 'International / Multilateral Agency',
    badge: 'Instant Access',
    isPending: false,
    description: 'Global land governance networks, multilateral development partners, UN/FAO bodies',
    icon: Globe2,
    placeholderOrg: 'e.g. Global Land Governance & Tenure Initiative',
  },
  {
    id: 'other',
    title: 'Other Custom Institution / Autonomous Body',
    badge: 'Instant Access',
    isPending: false,
    description: 'Any other custom institute, cooperative, or independent institution',
    icon: Sparkles,
    placeholderOrg: 'e.g. Independent Land Rights Cooperative',
  },
];

interface RegistrationSuccessResult {
  requiresVerification: boolean;
  message: string;
  email: string;
  orgName: string;
  categoryTitle: string;
  emailStatus?: string;
  emailMessage?: string;
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registeredResult, setRegisteredResult] = useState<RegistrationSuccessResult | null>(null);
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [pendingOtpEmail, setPendingOtpEmail] = useState('');
  const [pendingDebugOtp, setPendingDebugOtp] = useState<string | null>(null);
  const [pendingFormData, setPendingFormData] = useState<RegisterFormData | null>(null);
  const { toast } = useToast();
  const { setUser, refreshUser } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      organizationCategory: undefined,
      organizationName: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  });

  const selectedCategory = watch('organizationCategory');
  const passwordValue = watch('password', '');

  // Password criteria indicators
  const hasMinLength = passwordValue.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordValue);
  const hasNumber = /[0-9]/.test(passwordValue);

  const selectedCategoryObj = CATEGORIES.find((c) => c.id === selectedCategory);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await apiRequest<{
        token: { access_token: string; token_type: string } | null;
        user: { id: string; email: string; full_name: string; role: string; is_active: boolean } | null;
        status: string;
        message: string;
        requires_verification: boolean;
        otp_required?: boolean;
        debug_otp?: string | null;
        email?: string;
        email_status?: string;
        email_message?: string;
      }>('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email.trim(),
          full_name: data.fullName.trim(),
          password: data.password,
          organization_name: data.organizationName.trim(),
          organization_category: data.organizationCategory,
        }),
      });

      // 2FA Verification step
      if (response.otp_required) {
        setPendingOtpEmail(data.email.trim());
        setPendingDebugOtp(response.debug_otp || null);
        setPendingFormData(data);
        setOtpDialogOpen(true);
        toast({
          title: 'Verification Code Dispatched',
          description: `A 6-digit verification code with Team CodeNova branding was sent to ${data.email.trim()}.`,
          variant: 'default',
        });
        return;
      }

      const categoryTitle = selectedCategoryObj?.title || 'Collaborative Workspace';
      const emailStatus = response?.email_status || 'simulated';
      const emailMessage = response?.email_message || '';

      if (response.requires_verification) {
        // Pending categories (Government Agency, Policy Maker)
        setRegisteredResult({
          requiresVerification: true,
          message: 'Registration submitted for verification, you will be notified once approved.',
          email: data.email.trim(),
          orgName: data.organizationName.trim(),
          categoryTitle,
          emailStatus,
          emailMessage,
        });

        toast({
          title: 'Verification Pending',
          description: emailStatus === 'sent'
            ? `Receipt sent to ${data.email.trim()}. You will be notified once approved.`
            : `Registration submitted. Note: Email service in simulated mode.`,
          variant: 'default',
        });
      } else {
        // Verified categories (Researcher, Civil Society)
        if (response.token?.access_token) {
          setAuthToken(response.token.access_token);
        }

        if (response.user) {
          setUser(response.user);
        } else {
          await refreshUser();
        }

        setRegisteredResult({
          requiresVerification: false,
          message: 'Registration successful, you can now log in',
          email: data.email.trim(),
          orgName: data.organizationName.trim(),
          categoryTitle,
          emailStatus,
          emailMessage,
        });

        toast({
          title: 'Registration Successful',
          description: emailStatus === 'sent'
            ? `Welcome onboarding email dispatched to ${data.email.trim()}.`
            : `Account active! (SMTP email service running in simulated mode).`,
          variant: 'success',
        });
      }
    } catch (err: any) {
      let friendlyError = 'Failed to create account. Please check your details and try again.';
      const rawError = err?.message || '';

      if (rawError.toLowerCase().includes('already exists') || rawError.includes('409')) {
        friendlyError = 'A user with this email address already exists. Please sign in instead.';
      } else if (rawError.toLowerCase().includes('rate limit') || rawError.includes('429')) {
        friendlyError = 'Too many registration attempts. Please wait a minute before trying again.';
      } else if (rawError) {
        friendlyError = rawError;
      }

      setErrorMessage(friendlyError);

      toast({
        title: 'Registration Error',
        description: friendlyError,
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // POST-REGISTRATION SUCCESS OR PENDING SCREEN
  if (registeredResult) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-xl w-full bg-white p-8 sm:p-10 rounded-2xl border border-slate-200/80 shadow-xl space-y-7 text-center">
          {registeredResult.requiresVerification ? (
            <>
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-inner">
                <Clock className="w-8 h-8 text-amber-700" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                  Verification Pending
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Registration Submitted for Verification
                </h1>
                <p className="text-sm text-slate-600 font-medium">
                  Registration submitted for verification, you will be notified once approved.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs text-slate-700">
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500 font-medium">Work Email:</span>
                  <span className="font-semibold text-slate-900">{registeredResult.email}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 py-2">
                  <span className="text-slate-500 font-medium">Organization:</span>
                  <span className="font-semibold text-slate-900">{registeredResult.orgName}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-500 font-medium">Category:</span>
                  <span className="font-semibold text-amber-800">{registeredResult.categoryTitle}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-left text-xs text-amber-900 leading-relaxed space-y-1.5">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700" aria-hidden="true" />
                  Statutory Jurisdictional Approval Protocol
                </p>
                <p>
                  Because this account belongs to a Government Agency or Policy Maker authority, cadastral write
                  privileges and policy enactments require verification by state revenue platform administrators.
                  Login access will be unlocked once verification is complete.
                </p>
              </div>

              <div className={`p-4 rounded-xl text-left text-xs leading-relaxed flex items-start gap-3 ${
                registeredResult.emailStatus === 'sent'
                  ? 'bg-amber-50/80 border border-amber-200 text-amber-900'
                  : registeredResult.emailStatus === 'failed'
                  ? 'bg-red-50 border border-red-200 text-red-900'
                  : 'bg-blue-50/80 border border-blue-200 text-blue-900'
              }`}>
                <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                  registeredResult.emailStatus === 'sent'
                    ? 'bg-amber-100 text-amber-800'
                    : registeredResult.emailStatus === 'failed'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold">
                    {registeredResult.emailStatus === 'sent'
                      ? 'Welcome & Verification Receipt Dispatched'
                      : registeredResult.emailStatus === 'failed'
                      ? 'Verification Summary (Email Notice Not Delivered)'
                      : 'Verification Summary (Simulated Email Mode)'}
                  </p>
                  <p className="mt-0.5 opacity-90">
                    {registeredResult.emailStatus === 'sent' ? (
                      <>A formal verification receipt with your institutional registration summary has been sent to your registered address (<strong className="font-semibold text-slate-900">{registeredResult.email}</strong>). Please check your Gmail / mail inbox and spam folder.</>
                    ) : registeredResult.emailStatus === 'failed' ? (
                      <>Your application has been recorded. Note: Mail notification could not be delivered to <strong>{registeredResult.email}</strong> ({registeredResult.emailMessage || 'SMTP check failed'}). Please contact administrator.</>
                    ) : (
                      <>Your institutional verification request has been safely recorded. Note: Live email transmission is in simulation mode because SMTP credentials (SMTP_USER/SMTP_PASSWORD) are not yet configured on the server.</>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/"
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors text-center"
                >
                  Return to Home
                </Link>
                <Link
                  href="/login"
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors text-center"
                >
                  Sign In
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-8 h-8 text-emerald-700" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Active Account
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Registration Successful
                </h1>
                <p className="text-sm text-slate-600 font-medium">
                  Registration successful, you can now log in
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs text-slate-700">
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500 font-medium">Work Email:</span>
                  <span className="font-semibold text-slate-900">{registeredResult.email}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 py-2">
                  <span className="text-slate-500 font-medium">Organization Workspace:</span>
                  <span className="font-semibold text-slate-900">{registeredResult.orgName}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-500 font-medium">Category:</span>
                  <span className="font-semibold text-emerald-800">{registeredResult.categoryTitle}</span>
                </div>
              </div>

              <div className={`p-4 rounded-xl text-left text-xs leading-relaxed flex items-start gap-3 ${
                registeredResult.emailStatus === 'sent'
                  ? 'bg-emerald-50/80 border border-emerald-200 text-emerald-900'
                  : registeredResult.emailStatus === 'failed'
                  ? 'bg-amber-50 border border-amber-200 text-amber-900'
                  : 'bg-blue-50/80 border border-blue-200 text-blue-900'
              }`}>
                <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                  registeredResult.emailStatus === 'sent'
                    ? 'bg-emerald-100 text-emerald-700'
                    : registeredResult.emailStatus === 'failed'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold">
                    {registeredResult.emailStatus === 'sent'
                      ? 'Welcome Email Dispatched'
                      : registeredResult.emailStatus === 'failed'
                      ? 'Account Active (Email Notice Failed)'
                      : 'Account Active (Simulated Email Mode)'}
                  </p>
                  <p className="mt-0.5 opacity-90">
                    {registeredResult.emailStatus === 'sent' ? (
                      <>A welcome confirmation and platform onboarding briefing has been sent to your registered address (<strong className="font-semibold text-slate-900">{registeredResult.email}</strong>). Please check your Gmail / mail inbox and spam folder.</>
                    ) : registeredResult.emailStatus === 'failed' ? (
                      <>Your account is ready for sign in. Note: Mail notification could not be delivered to <strong>{registeredResult.email}</strong> ({registeredResult.emailMessage || 'SMTP check failed'}).</>
                    ) : (
                      <>Your account is active immediately. Note: Live email transmission is in simulation mode because SMTP credentials (SMTP_USER/SMTP_PASSWORD) are not yet configured on the server.</>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/login"
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors text-center shadow-sm"
                >
                  Sign In to Dashboard
                </Link>
                <Link
                  href="/"
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors text-center"
                >
                  Return to Home
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // MAIN REGISTRATION FORM
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-slate-200/80 shadow-xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-inner">
            <Landmark className="w-6 h-6" aria-hidden="true" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Collaborative Workspace Registration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Sign up to collaborate across cadastral maps, policy registries, and land governance datasets
          </p>
        </div>

        {/* Specific Error Message Alert */}
        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm animate-in fade-in duration-200"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          {/* Section 1: User Identity */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              1. Personal Credentials
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label
                  htmlFor="fullName"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  Full Legal Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    aria-invalid={!!errors.fullName}
                    placeholder="Dr. Rajesh Mehta"
                    className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors.fullName
                        ? 'border-rose-400 bg-rose-50/30 text-rose-900'
                        : 'border-slate-300 bg-white text-slate-900 hover:border-slate-400'
                    }`}
                    {...register('fullName')}
                  />
                </div>
                {errors.fullName && (
                  <p role="alert" className="text-xs text-rose-600 font-medium">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  Work Email Address
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
                    placeholder="rajesh.mehta@cadastre.gov"
                    className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors.email
                        ? 'border-rose-400 bg-rose-50/30 text-rose-900'
                        : 'border-slate-300 bg-white text-slate-900 hover:border-slate-400'
                    }`}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p role="alert" className="text-xs text-rose-600 font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Organization Category Selection */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                2. Organization Category
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">
                Required for workspace assignment
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setValue('organizationCategory', cat.id, { shouldValidate: true });
                    }}
                    className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                          cat.isPending
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {cat.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                        {cat.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                        {cat.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.organizationCategory && (
              <p role="alert" className="text-xs text-rose-600 font-medium">
                {errors.organizationCategory.message}
              </p>
            )}

            {/* Conditional Organization Name Text Field */}
            {selectedCategory && (
              <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-200 space-y-1">
                <label
                  htmlFor="organizationName"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  Institute / University / Organization Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <input
                    id="organizationName"
                    type="text"
                    aria-invalid={!!errors.organizationName}
                    placeholder={
                      selectedCategoryObj?.placeholderOrg || 'Enter any university, college, research institute, or department...'
                    }
                    className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors.organizationName
                        ? 'border-rose-400 bg-rose-50/30 text-rose-900'
                        : 'border-slate-300 bg-white text-slate-900 hover:border-slate-400'
                    }`}
                    {...register('organizationName')}
                  />
                </div>
                <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1.5 pt-0.5">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  All types of new institutes can be registered. Any new university, department, or organization will be created automatically in the platform directory.
                </p>
                {errors.organizationName && (
                  <p role="alert" className="text-xs text-rose-600 font-medium">
                    {errors.organizationName.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Section 3: Password Credentials */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              3. Security & Password
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    aria-invalid={!!errors.password}
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
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
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
                  <p role="alert" className="text-xs text-rose-600 font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    aria-invalid={!!errors.confirmPassword}
                    placeholder="••••••••••••"
                    className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors.confirmPassword
                        ? 'border-rose-400 bg-rose-50/30 text-rose-900'
                        : 'border-slate-300 bg-white text-slate-900 hover:border-slate-400'
                    }`}
                    {...register('confirmPassword')}
                  />
                </div>
                {errors.confirmPassword && (
                  <p role="alert" className="text-xs text-rose-600 font-medium">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {/* Live password requirements checklist */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1 text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Security criteria:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                <span
                  className={`flex items-center gap-1.5 ${
                    hasMinLength ? 'text-emerald-700 font-medium' : 'text-slate-400'
                  }`}
                >
                  <Check
                    className={`w-3.5 h-3.5 ${hasMinLength ? 'text-emerald-600' : 'text-slate-300'}`}
                  />{' '}
                  8+ characters
                </span>
                <span
                  className={`flex items-center gap-1.5 ${
                    hasUppercase ? 'text-emerald-700 font-medium' : 'text-slate-400'
                  }`}
                >
                  <Check
                    className={`w-3.5 h-3.5 ${hasUppercase ? 'text-emerald-600' : 'text-slate-300'}`}
                  />{' '}
                  Uppercase letter
                </span>
                <span
                  className={`flex items-center gap-1.5 ${
                    hasNumber ? 'text-emerald-700 font-medium' : 'text-slate-400'
                  }`}
                >
                  <Check
                    className={`w-3.5 h-3.5 ${hasNumber ? 'text-emerald-600' : 'text-slate-300'}`}
                  />{' '}
                  One number
                </span>
              </div>
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-500 cursor-pointer"
                {...register('agreeToTerms')}
              />
              <span className="text-xs text-slate-600 leading-normal">
                I agree to the Land Governance Collaborative Workspace Code of Conduct, cadastral surveyor guidelines, and open provenance terms.
              </span>
            </label>
            {errors.agreeToTerms && (
              <p role="alert" className="text-xs text-rose-600 font-medium">
                {errors.agreeToTerms.message}
              </p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                Registering Workspace...
              </>
            ) : (
              <>
                Register Account
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Already registered with a cadastral agency?{' '}
            <Link
              href="/login"
              className="font-semibold text-emerald-700 hover:text-emerald-800 transition-colors underline-offset-2 hover:underline"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      {/* 2FA OTP Verification Dialog with Team CodeNova branding */}
      <OtpVerificationDialog
        isOpen={otpDialogOpen}
        email={pendingOtpEmail}
        action="register"
        debugOtp={pendingDebugOtp}
        onCancel={() => setOtpDialogOpen(false)}
        onSuccess={(authData) => {
          setOtpDialogOpen(false);
          const categoryTitle = selectedCategoryObj?.title || 'Collaborative Workspace';
          const emailStatus = authData?.email_status || 'simulated';
          const emailMessage = authData?.email_message || '';

          if (authData.requires_verification) {
            setRegisteredResult({
              requiresVerification: true,
              message: 'Registration submitted for verification, you will be notified once approved.',
              email: pendingOtpEmail,
              orgName: pendingFormData?.organizationName || 'Institutional Organization',
              categoryTitle,
              emailStatus,
              emailMessage,
            });
          } else {
            setRegisteredResult({
              requiresVerification: false,
              message: 'Registration successful, you can now log in',
              email: pendingOtpEmail,
              orgName: pendingFormData?.organizationName || 'Institutional Organization',
              categoryTitle,
              emailStatus,
              emailMessage,
            });
          }
        }}
      />
    </div>
  );
}
