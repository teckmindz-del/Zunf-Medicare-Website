import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://zunfmedicare.com';

const pages = [
  '',
  '/about',
  '/contact',
  '/login',
  '/signup',
  '/services/labs',
  '/services/health-program',
  '/services/school-health-program',
  '/services/corporate-health-screening',
  '/clients',
];

// Add dynamic routes placeholders or fetch from API if needed
// For now, focusing on static routes as requested "for each page"

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map((page) => {
      return `
  <url>
    <loc>${BASE_URL}${page}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`;
    })
    .join('')}
</urlset>`;

const outputPath = path.resolve('public/sitemap.xml');
fs.writeFileSync(outputPath, sitemap.trim());

console.log(`Sitemap generated at: ${outputPath}`);
