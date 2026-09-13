/**
 * Triggers a real browser file download using Blob and URL.createObjectURL.
 * 
 * @param content The string or Blob content to download.
 * @param filename The name of the file to save (including extension, e.g. 'bhoomitra-map-export.geojson').
 * @param mimeType The MIME type of the file (defaults to 'application/geo+json;charset=utf-8;').
 */
export function downloadFile(
  content: string | BlobPart,
  filename: string,
  mimeType: string = 'application/geo+json;charset=utf-8;'
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
  }, 1000);
}
