import { env } from '@/lib/environment';

/**
 * Resolves an API or file path to a fully qualified, deduplicated URL.
 * Handles data URIs, absolute URLs, and prevents double `/api/v1/api/v1` path prefixes.
 */
export function resolveApiUrl(path?: string | null): string {
  if (!path) return '';

  // Already a data URI
  if (path.startsWith('data:')) {
    return path;
  }

  let cleanPath = path;

  // Handle absolute URLs that wrap query routing, e.g. http://localhost:3000/?path=...
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    try {
      const parsedUrl = new URL(cleanPath);
      const queryParam = parsedUrl.searchParams.get('path');
      if (queryParam) {
        cleanPath = decodeURIComponent(queryParam);
      } else {
        return cleanPath;
      }
    } catch {
      return cleanPath;
    }
  }

  // Handle malformed /api/v1/?path=, /?path=, or ?path= query routing
  if (cleanPath.startsWith('/api/v1/?path=')) {
    cleanPath = decodeURIComponent(cleanPath.slice('/api/v1/?path='.length));
  } else if (cleanPath.startsWith('/?path=')) {
    cleanPath = decodeURIComponent(cleanPath.slice('/?path='.length));
  } else if (cleanPath.startsWith('?path=')) {
    cleanPath = decodeURIComponent(cleanPath.slice('?path='.length));
  }

  if (!cleanPath) return '';

  // Normalize slashes and ensure cleanPath starts with /
  cleanPath = cleanPath.replace(/^\/+/, '/');
  if (!cleanPath.startsWith('/')) {
    cleanPath = `/${cleanPath}`;
  }

  // Deduplicate /api/v1 prefixes if repeated (e.g. /api/v1/api/v1)
  while (cleanPath.startsWith('/api/v1/api/v1')) {
    cleanPath = cleanPath.slice('/api/v1'.length);
  }

  const baseUrl = env.apiUrl.replace(/\/$/, '');

  // If baseUrl already ends with /api/v1 and cleanPath starts with /api/v1, prevent duplication
  if (baseUrl.endsWith('/api/v1') && cleanPath.startsWith('/api/v1')) {
    const origin = baseUrl.slice(0, -7);
    return `${origin}${cleanPath}`;
  }

  return `${baseUrl}${cleanPath}`;
}

export interface ResourceFileInfo {
  filename?: string | null;
  storage_uri?: string | null;
  download_url?: string | null;
  view_url?: string | null;
  mime_type?: string | null;
  size_bytes?: number | null;
  checksum_sha256?: string | null;
}

export interface ResolvedResourceFiles {
  downloadUrl: string;
  viewUrl: string;
  previewUrl: string;
  isImage: boolean;
  isPdf: boolean;
  isGeoJson: boolean;
  mimeType: string;
  filename: string;
  formattedSize: string;
}

/**
 * Determines whether a given MIME type or filename represents an image.
 */
export function isImageMimeOrFilename(mimeType?: string | null, filename?: string | null): boolean {
  if (mimeType && mimeType.toLowerCase().startsWith('image/')) {
    return true;
  }
  if (filename) {
    const lower = filename.toLowerCase();
    return (
      lower.endsWith('.png') ||
      lower.endsWith('.jpg') ||
      lower.endsWith('.jpeg') ||
      lower.endsWith('.webp') ||
      lower.endsWith('.svg') ||
      lower.endsWith('.gif') ||
      lower.endsWith('.tif') ||
      lower.endsWith('.tiff')
    );
  }
  return false;
}

/**
 * Determines whether a given MIME type or filename represents a PDF.
 */
export function isPdfMimeOrFilename(mimeType?: string | null, filename?: string | null): boolean {
  if (mimeType && mimeType.toLowerCase().includes('pdf')) {
    return true;
  }
  if (filename && filename.toLowerCase().endsWith('.pdf')) {
    return true;
  }
  return false;
}

/**
 * Determines whether a given MIME type or filename represents GeoJSON or JSON.
 */
export function isGeoJsonMimeOrFilename(mimeType?: string | null, filename?: string | null): boolean {
  if (mimeType && (mimeType.includes('geo+json') || mimeType === 'application/json')) {
    return true;
  }
  if (filename) {
    const lower = filename.toLowerCase();
    return lower.endsWith('.geojson') || lower.endsWith('.json');
  }
  return false;
}

/**
 * Formats a byte size into human readable string (KB, MB).
 */
export function formatBytes(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Resolves all access URLs and metadata for a resource file attachment.
 */
export function resolveResourceFiles(
  file?: ResourceFileInfo | null,
  resourceId?: string,
  fallbackFilename: string = 'document.pdf',
  fallbackMime: string = 'application/pdf',
): ResolvedResourceFiles {
  const filename = file?.filename || fallbackFilename;
  const mimeType = file?.mime_type || fallbackMime;

  const rawDownload = file?.download_url || (resourceId ? `/api/v1/resources/${resourceId}/download` : '');
  const rawView = file?.view_url || (resourceId ? `/api/v1/resources/${resourceId}/view` : '');

  const downloadUrl = resolveApiUrl(rawDownload);
  const viewUrl = resolveApiUrl(rawView);

  const isImage = isImageMimeOrFilename(mimeType, filename);
  const isPdf = isPdfMimeOrFilename(mimeType, filename);
  const isGeoJson = isGeoJsonMimeOrFilename(mimeType, filename);

  // If storage_uri is a base64 data URI for an image, it can be used directly for instantaneous preview
  let previewUrl = viewUrl;
  if (file?.storage_uri && file.storage_uri.startsWith('data:image/')) {
    previewUrl = file.storage_uri;
  } else if (!previewUrl && file?.storage_uri) {
    previewUrl = resolveApiUrl(file.storage_uri);
  }

  return {
    downloadUrl,
    viewUrl,
    previewUrl,
    isImage,
    isPdf,
    isGeoJson,
    mimeType,
    filename,
    formattedSize: formatBytes(file?.size_bytes),
  };
}
