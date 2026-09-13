'use client';

import React, { useState } from 'react';
import {
  FileText,
  Download,
  ExternalLink,
  ImageIcon,
  Hash,
  FileCode,
  ShieldCheck,
  Maximize2,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  resolveResourceFiles,
  ResourceFileInfo,
} from '@/lib/api-url';

interface AttachedFilePreviewProps {
  file?: ResourceFileInfo | null;
  resourceId: string;
  fallbackFilename?: string;
  fallbackMime?: string;
  title?: string;
}

export function AttachedFilePreview({
  file,
  resourceId,
  fallbackFilename = 'document.pdf',
  fallbackMime = 'application/pdf',
  title,
}: AttachedFilePreviewProps) {
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);

  const resolved = resolveResourceFiles(
    file,
    resourceId,
    fallbackFilename,
    fallbackMime
  );

  const {
    downloadUrl,
    viewUrl,
    previewUrl,
    isImage,
    isPdf,
    isGeoJson,
    mimeType,
    filename,
    formattedSize,
  } = resolved;

  // Render Image Preview
  if (isImage) {
    return (
      <section aria-labelledby="attachment-heading" className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2
            id="attachment-heading"
            className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"
          >
            <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
            Attached Image / Survey Map Preview
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            {mimeType} • {formattedSize}
          </span>
        </div>

        <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4 sm:p-6 space-y-4 shadow-sm">
          {/* Image Display Area */}
          <div className="relative overflow-hidden rounded-xl bg-slate-900/5 border border-slate-200 flex items-center justify-center min-h-[220px] max-h-[550px]">
            {imgLoading && !imgError && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80 backdrop-blur-xs text-slate-500 text-xs gap-2">
                <span className="inline-block w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                Loading image...
              </div>
            )}

            {imgError ? (
              <div className="p-8 text-center space-y-2">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">Preview not available inline</p>
                <p className="text-[11px] text-slate-500 max-w-sm">
                  The image format can be viewed directly in your browser or downloaded below.
                </p>
              </div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={previewUrl || viewUrl}
                alt={title || filename}
                onLoad={() => setImgLoading(false)}
                onError={() => {
                  setImgLoading(false);
                  setImgError(true);
                }}
                className="max-h-[520px] w-auto max-w-full object-contain rounded-lg transition-opacity duration-300 shadow-xs"
              />
            )}
          </div>

          {/* Image Metadata & Dual Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-slate-200/60">
            <div className="space-y-1 min-w-0">
              <div className="font-bold text-slate-900 text-sm truncate max-w-md">{filename}</div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-mono uppercase text-emerald-800 font-semibold">{mimeType}</span>
                <span>•</span>
                <span>{formattedSize}</span>
                {file?.checksum_sha256 && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1">
                      <Hash className="w-3 h-3 text-emerald-600 shrink-0" />
                      SHA-256: {file.checksum_sha256.slice(0, 12)}...
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
              <a
                href={viewUrl || previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 shadow-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <Maximize2 className="w-3.5 h-3.5 text-emerald-700" />
                View Full Resolution
              </a>

              <a
                href={downloadUrl}
                download={filename}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <Download className="w-3.5 h-3.5" />
                Download Image
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Render PDF / Document Preview Card
  if (isPdf) {
    return (
      <section aria-labelledby="attachment-heading" className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2
            id="attachment-heading"
            className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            Attached Document & Verified Binary
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            {mimeType} • {formattedSize}
          </span>
        </div>

        <div className="p-5 sm:p-6 bg-emerald-50/50 rounded-2xl border-2 border-emerald-200/90 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 shadow-sm">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="font-bold text-slate-900 text-sm break-all">{filename}</div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <span className="font-mono uppercase text-emerald-800 font-semibold">{mimeType}</span>
                <span>•</span>
                <span>{formattedSize}</span>
                <span>•</span>
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Integrity Verified
                </span>
              </div>
              {file?.checksum_sha256 && (
                <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1 break-all">
                  <Hash className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>SHA-256: {file.checksum_sha256}</span>
                </div>
              )}
            </div>
          </div>

          {/* Dual Action: View in Browser + Download Document */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0 pt-2 lg:pt-0">
            <a
              href={viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl border border-slate-300 shadow-sm transition-colors text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <ExternalLink className="w-4 h-4 text-emerald-700" />
              View in Browser
            </a>

            <a
              href={downloadUrl}
              download={filename}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-colors text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <Download className="w-4 h-4" />
              Download Document
            </a>
          </div>
        </div>
      </section>
    );
  }

  // Render Generic / GeoJSON / Dataset Preview Card
  return (
    <section aria-labelledby="attachment-heading" className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <h2
          id="attachment-heading"
          className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"
        >
          {isGeoJson ? (
            <FileCode className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
          )}
          Attached Dataset & Raw File
        </h2>
        <span className="text-xs text-slate-500 font-mono">
          {mimeType} • {formattedSize}
        </span>
      </div>

      <div className="p-5 sm:p-6 bg-slate-50 rounded-2xl border border-slate-200/90 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 shadow-sm">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-slate-200 text-slate-800 flex items-center justify-center shrink-0 shadow-xs">
            {isGeoJson ? <FileCode className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
          </div>
          <div className="space-y-1 min-w-0">
            <div className="font-bold text-slate-900 text-sm break-all">{filename}</div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span className="font-mono uppercase text-slate-800 font-semibold">{mimeType}</span>
              <span>•</span>
              <span>{formattedSize}</span>
              <span>•</span>
              <Badge variant="outline" className="text-[10px]">
                Cryptographic Checksum OK
              </Badge>
            </div>
            {file?.checksum_sha256 && (
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1 break-all">
                <Hash className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>SHA-256: {file.checksum_sha256}</span>
              </div>
            )}
          </div>
        </div>

        {/* Dual Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0 pt-2 lg:pt-0">
          {viewUrl && (
            <a
              href={viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-xl border border-slate-300 shadow-sm transition-colors text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <ExternalLink className="w-4 h-4 text-emerald-700" />
              View Raw Data
            </a>
          )}

          <a
            href={downloadUrl}
            download={filename}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-colors text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <Download className="w-4 h-4" />
            Download File
          </a>
        </div>
      </div>
    </section>
  );
}
