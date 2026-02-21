import type { RequestHandler } from './$types';

const SITE_URL = 'https://devtools.wsgrok.com';

const routes = [
  { path: '', priority: '1.0', changefreq: 'weekly' },
  { path: 'base64', priority: '0.8', changefreq: 'monthly' },
  { path: 'url', priority: '0.8', changefreq: 'monthly' },
  { path: 'json', priority: '0.8', changefreq: 'monthly' },
  { path: 'json-escape', priority: '0.8', changefreq: 'monthly' },
  { path: 'regex', priority: '0.8', changefreq: 'monthly' },
  { path: 'jwt', priority: '0.8', changefreq: 'monthly' },
  { path: 'jwt-rsa', priority: '0.8', changefreq: 'monthly' },
  { path: 'hex', priority: '0.8', changefreq: 'monthly' },
  { path: 'hash', priority: '0.8', changefreq: 'monthly' },
  { path: 'uuid', priority: '0.8', changefreq: 'monthly' }
];

export const GET: RequestHandler = () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${SITE_URL}/${route.path}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=0, s-maxage=3600'
    }
  });
};

export const prerender = true;
