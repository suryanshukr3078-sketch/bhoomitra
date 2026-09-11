'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, ContactFormData } from '@/schemas/contact';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, MapPin, Send, Loader2, MessageSquare, Building2, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: '',
      email: '',
      organization: '',
      category: 'registry_partnership',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast({
        title: 'Inquiry Submitted',
        description: `Thank you, ${data.fullName}. Your message regarding "${data.subject}" has been received.`,
        variant: 'success',
      });
      setIsSubmitted(true);
      reset();
    } catch {
      toast({
        title: 'Submission Error',
        description: 'Failed to send inquiry. Please try again or email us directly.',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          <MessageSquare className="w-3.5 h-3.5" />
          Get In Touch
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Contact the Cadastral Governance Team
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Inquire about land registry pilots, surveyor accreditation, open GIS API integration, or academic research collaboration.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-slate-900">Direct Contacts</h2>
            <div className="space-y-3 text-xs sm:text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800">General Inquiries</div>
                  <a href="mailto:info@landgov.platform" className="text-emerald-700 hover:underline">
                    info@landgov.platform
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800">Registry Partnerships</div>
                  <a href="mailto:partnerships@landgov.platform" className="text-emerald-700 hover:underline">
                    partnerships@landgov.platform
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800">Technical Working Group</div>
                  <div>Center for Spatial Land Administration & GIS</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-md space-y-2 text-xs">
            <div className="font-bold text-emerald-400">Response Times</div>
            <p className="text-slate-300 leading-relaxed">
              Standard inquiries are processed within 2 business days. Survey verification and API token requests require agency credential verification.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="lg:col-span-2 bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm">
          {isSubmitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Inquiry Dispatched Successfully</h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Thank you for contacting the Land Governance Platform. A representative from our coordination committee will reach out to you shortly.
              </p>
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="Dr. Aisha Sharma"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    {...register('fullName')}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-rose-600 font-medium">{errors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="aisha@survey.gov"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-xs text-rose-600 font-medium">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">
                    Organization / Ministry
                  </label>
                  <input
                    type="text"
                    placeholder="Department of Land Records"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    {...register('organization')}
                  />
                  {errors.organization && (
                    <p className="text-xs text-rose-600 font-medium">{errors.organization.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">
                    Inquiry Category
                  </label>
                  <select
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    {...register('category')}
                  >
                    <option value="registry_partnership">Registry / Ministry Pilot Partnership</option>
                    <option value="surveyor_accreditation">Surveyor Digital Accreditation</option>
                    <option value="research_submission">Academic Research Contribution</option>
                    <option value="data_inquiry">Spatial Dataset Request</option>
                    <option value="technical_support">Technical / PostGIS API Support</option>
                    <option value="other">General Inquiries</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g., Proposal for Automated TopoGeometry Boundary Audits"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  {...register('subject')}
                />
                {errors.subject && (
                  <p className="text-xs text-rose-600 font-medium">{errors.subject.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Message Content
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe your jurisdiction requirements, research question, or integration timeline..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  {...register('message')}
                />
                {errors.message && (
                  <p className="text-xs text-rose-600 font-medium">{errors.message.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending Inquiry...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Inquiry
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
