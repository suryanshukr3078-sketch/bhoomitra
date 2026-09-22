import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://web-rho-gules-89.vercel.app';

  const routes = [
    '',
    '/maps',
    '/digitization',
    '/watershed',
    '/acquisition',
    '/policies',
    '/research',
    '/datasets',
    '/workspace',
    '/workspace/government',
    '/workspace/researcher',
    '/workspace/policymaker',
    '/workspace/civil-society',
    '/dashboard',
    '/assistant',
    '/evidence',
    '/developers',
    '/innovation',
    '/contribute',
    '/about',
    '/faq',
    '/contact',
    '/login',
    '/register',
    '/sitemap',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route === '/maps' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/maps' ? 0.9 : 0.7,
  }));
}
