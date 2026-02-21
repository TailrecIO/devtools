import type { RequestHandler } from './$types';

const SITE_URL = 'https://devtools.wsgrok.com';

export const GET: RequestHandler = () => {
  const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml`;

  return new Response(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'max-age=0, s-maxage=3600'
    }
  });
};

export const prerender = true;
