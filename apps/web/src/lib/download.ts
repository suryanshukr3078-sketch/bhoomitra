/**
 * Bhoomitra Client Download Utilities
 * 
 * Provides unified, cross-browser file downloads that bypass cross-origin
 * restrictions on the HTML5 `download` attribute by fetching data into client Blobs
 * and creating local object URLs.
 */

/**
 * Triggers an immediate browser file download using Blob and URL.createObjectURL.
 * 
 * @param content The string or Blob content to download.
 * @param filename The name of the file to save (including extension, e.g. 'bhoomitra-map-export.geojson').
 * @param mimeType The MIME type of the file (defaults to 'application/octet-stream').
 */
export function downloadFile(
  content: string | BlobPart,
  filename: string,
  mimeType: string = 'application/octet-stream'
): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = objectUrl;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Revoke object URL after a short delay to free browser memory
  setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 1500);
}

/**
 * Downloads a file from an API or remote URL by fetching the content as a Blob,
 * converting it to a local object URL, and triggering a programmatic download.
 * 
 * This avoids cross-origin restrictions where modern browsers ignore the `download`
 * attribute for URLs hosted on a different origin.
 * 
 * @param url Remote or API endpoint URL to fetch.
 * @param filename Target filename to save locally.
 * @param fallbackMime Default MIME type if response headers do not specify one.
 * @param fallbackGenerator Optional callback to generate synthetic/seed file content if the endpoint fails.
 */
export async function downloadFromUrl(
  url: string,
  filename: string,
  fallbackMime: string = 'application/octet-stream',
  fallbackGenerator?: () => (string | BlobPart) | Promise<string | BlobPart>
): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  if (!url) {
    if (fallbackGenerator) {
      const fallback = await fallbackGenerator();
      downloadFile(fallback, filename, fallbackMime);
      return;
    }
    throw new Error('No download URL provided');
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Download endpoint returned HTTP ${res.status}`);
    }
    const blob = await res.blob();
    const resolvedMime = blob.type && blob.type !== 'application/octet-stream' ? blob.type : fallbackMime;
    downloadFile(blob, filename, resolvedMime);
  } catch (err) {
    if (fallbackGenerator) {
      const fallback = await fallbackGenerator();
      downloadFile(fallback, filename, fallbackMime);
      return;
    }
    throw err;
  }
}
