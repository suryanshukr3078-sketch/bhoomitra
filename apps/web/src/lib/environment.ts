const fallbackUrl =
  typeof window !== 'undefined'
    ? '/api/v1'
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}/api/v1`
    : 'https://land-governance-platform-virid.vercel.app/api/v1';

export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || fallbackUrl,
};

if (typeof window === 'undefined') {
  console.log(`[Environment SSR] Resolved API_URL: ${env.apiUrl}`);
}
