'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/schemas/auth';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Landmark, Lock, Mail, Eye, EyeOff, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/api/client';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
      // Calls backend POST /api/v1/auth/login endpoint.
      // The backend sets the secure, HttpOnly access_token cookie in the Set-Cookie response header.
      const response = await apiRequest<{
        token: { access_token: string; token_type: string };
        user: { id: string; email: string; full_name: string; role: string; is_active: boolean };
      }>('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email.trim(),
          password: data.password,
        }),
      });

      if (response.user) {
        setUser(response.user);
      } else {
        await refreshUser();
      }

      toast({
        title: 'Authentication Successful',
        description: `Welcome back, ${response.user?.full_name || data.email}. Redirecting to dashboard...`,
        variant: 'success',
      });

      router.push('/dashboard');
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
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-slate-200/80 shadow-xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-inner">
            <Landmark className="w-6 h-6" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign In to LandGov
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Access cadastral administration, deed mutations, and policy records
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
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
                placeholder="surveyor@registry.gov"
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
                    title: 'Password Reset',
                    description: 'Please contact your cadastral jurisdiction administrator.',
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
              <p id="password-error" role="alert" className="text-xs text-rose-600 font-medium">
                {errors.password.message}
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
                Authenticating...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        {/* Visible link to Register page */}
        <div className="pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Don&apos;t have an authenticated account?{' '}
            <Link
              href="/register"
              className="font-semibold text-emerald-700 hover:text-emerald-800 transition-colors underline-offset-2 hover:underline"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
