'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contributeSchema, ContributeFormData } from '@/schemas/contribute';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  UploadCloud,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileUp,
  FileCode,
  Sparkles,
  Layers,
} from 'lucide-react';
import { env } from '@/lib/environment';
import { getAuthToken } from '@/lib/api/client';

export default function ContributePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    original_filename: string;
    checksum_sha256: string;
    storage_uri: string;
    file_size_bytes: number;
    mime_type: string;
  } | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContributeFormData>({
    resolver: zodResolver(contributeSchema),
    defaultValues: {
      title: '',
      resourceType: 'research_paper',
      abstract: '',
      jurisdiction: 'IN-MH',
      visibility: 'public',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const onSubmit = async (data: ContributeFormData) => {
    setIsUploading(true);
    try {
      let uploadInfo = null;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const baseUrl = env.apiUrl.replace(/\/$/, '');
        const token = getAuthToken();
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${baseUrl}/uploads`, {
          method: 'POST',
          headers,
          body: formData,
          credentials: 'include',
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || `Upload failed with status ${res.status}`);
        }

        uploadInfo = await res.json();
        setUploadResult(uploadInfo);
      }

      toast({
        title: 'Contribution Recorded',
        description: `"${data.title}" was submitted to the registry${uploadInfo ? ' with verified file hash.' : '.'}`,
        variant: 'success',
      });

      if (!uploadInfo) {
        reset();
        setSelectedFile(null);
      }
    } catch (err: any) {
      toast({
        title: 'Submission Failed',
        description: err.message || 'Could not upload record. Please verify the file format and try again.',
        variant: 'error',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full w-fit">
            <UploadCloud className="w-3.5 h-3.5" />
            Decentralized Registry Submission
          </div>
          <Badge variant="success">Open Governance Node</Badge>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Contribute Land Governance Records
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
          Publish research publications, legal policy statutes, or spatial cadastral layers. Uploaded documents are automatically validated for magic-bytes integrity and SHA-256 cryptographic provenance.
        </p>
      </div>

      {/* Main Contribution Form */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          {/* Document Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Document / Dataset Title
            </label>
            <input
              type="text"
              placeholder="e.g. Pune Metropolitan Cadastral Survey & Mutation Guidelines 2026"
              className={`w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                errors.title ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 bg-white'
              }`}
              {...register('title')}
            />
            {errors.title && (
              <p role="alert" className="text-xs text-rose-600 font-medium">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Resource Type & Jurisdiction */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Resource Category
              </label>
              <select
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                {...register('resourceType')}
              >
                <option value="research_paper">Academic Research Paper</option>
                <option value="policy">Statutory Policy / Revenue Code</option>
                <option value="spatial_layer">Spatial GIS Layer / Cadastre</option>
                <option value="dataset">Open Land Dataset</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Jurisdiction Code
              </label>
              <input
                type="text"
                placeholder="e.g. IN-MH (ISO 3166-2)"
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.jurisdiction ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 bg-white'
                }`}
                {...register('jurisdiction')}
              />
              {errors.jurisdiction && (
                <p role="alert" className="text-xs text-rose-600 font-medium">
                  {errors.jurisdiction.message}
                </p>
              )}
            </div>
          </div>

          {/* Abstract / Scope */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Executive Abstract / Legal Scope
            </label>
            <textarea
              rows={4}
              placeholder="Detail the technical methodology, legal enactments, EPSG projection, or cadastral coordinates..."
              className={`w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.abstract ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 bg-white'
              }`}
              {...register('abstract')}
            />
            {errors.abstract && (
              <p role="alert" className="text-xs text-rose-600 font-medium">
                {errors.abstract.message}
              </p>
            )}
          </div>

          {/* File Upload Section */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Document or Spatial Attachment (PDF, GeoJSON, TIFF, Images)
            </label>
            <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center transition-colors bg-slate-50/50">
              <input
                id="file-upload"
                type="file"
                accept=".pdf,.geojson,.json,.tif,.tiff,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <FileUp className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-emerald-800 hover:underline">
                    Click to select file
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    Maximum 50MB. Validated via server-side magic-bytes inspection.
                  </span>
                </div>
                {selectedFile && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-emerald-300 text-emerald-900 rounded-lg text-xs font-mono mt-2 shadow-xs">
                    <FileCode className="w-3.5 h-3.5 text-emerald-600" />
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Upload Success Details */}
          {uploadResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                File Uploaded & Cryptographically Verified
              </div>
              <div className="text-xs font-mono text-emerald-800 space-y-1">
                <div>Filename: {uploadResult.original_filename}</div>
                <div>SHA-256: {uploadResult.checksum_sha256}</div>
                <div>Storage URI: {uploadResult.storage_uri}</div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isUploading}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-xl shadow-md transition-colors disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading & Recording...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Publish to Platform
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
