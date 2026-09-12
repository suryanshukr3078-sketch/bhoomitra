'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormData } from '@/schemas/auth';
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
  ArrowRight,
} from 'lucide-react';
import { apiRequest, setAuthToken } from '@/lib/api/client';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      organization: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  });

  const passwordValue = watch('password', '');

  // Password strength checks
  const hasMinLength = passwordValue.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordValue);
  const hasNumber = /[0-9]/.test(passwordValue);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await apiRequest<{
        token: { access_token: string; token_type: string };
        user: { id: string; email: string; full_name: string; role: string };
      }>('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email.trim(),
          full_name: data.fullName.trim(),
          password: data.password,
        }),
      });

      setAuthToken(response.token.access_token);

      toast({
        title: 'Registration Successful',
        description: `Account created for ${response.user.full_name || data.fullName}. Redirecting to dashboard...`,
        variant: 'success',
      });
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 800);
    } catch (err: any) {
      toast({
        title: 'Registration Error',
        description: err.message || 'Failed to create account. Please check your data and try again.',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-xl w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-slate-200/80 shadow-xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-inner">
            <Landmark className="w-6 h-6" aria-hidden="true" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Register Cadastral Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Join the decentralized land governance and policy research network
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5" noValidate>
          {/* Full name field */}
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
                placeholder="Dr. Aisha Sharma"
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

          {/* Email & Organization row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
              >
                Work Email
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
                  placeholder="aisha@survey.gov"
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

            <div className="space-y-1">
              <label
                htmlFor="organization"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
              >
                Organization / Ministry
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="w-4 h-4" aria-hidden="true" />
                </div>
                <input
                  id="organization"
                  type="text"
                  aria-invalid={!!errors.organization}
                  placeholder="National Land Registry"
                  className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.organization
                      ? 'border-rose-400 bg-rose-50/30 text-rose-900'
                      : 'border-slate-300 bg-white text-slate-900 hover:border-slate-400'
                  }`}
                  {...register('organization')}
                />
              </div>
              {errors.organization && (
                <p role="alert" className="text-xs text-rose-600 font-medium">
                  {errors.organization.message}
                </p>
              )}
            </div>
          </div>

          {/* Password & Confirm Password */}
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
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1.5 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Security criteria:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
              <span className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                <Check className={`w-3.5 h-3.5 ${hasMinLength ? 'text-emerald-600' : 'text-slate-300'}`} /> 8+ characters
              </span>
              <span className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                <Check className={`w-3.5 h-3.5 ${hasUppercase ? 'text-emerald-600' : 'text-slate-300'}`} /> Uppercase letter
              </span>
              <span className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                <Check className={`w-3.5 h-3.5 ${hasNumber ? 'text-emerald-600' : 'text-slate-300'}`} /> One number
              </span>
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="space-y-1 pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-500"
                {...register('agreeToTerms')}
              />
              <span className="text-xs text-slate-600 leading-normal">
                I agree to the Land Governance Code of Conduct, cadastral surveyor guidelines, and open data sharing terms.
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
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                Creating Account...
              </>
            ) : (
              <>
                Create Verified Account
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Already registered with a land agency?{' '}
            <Link
              href="/login"
              className="font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
