import fs from 'fs';
import path from 'path';

export interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
}

const BASE_URL = 'https://www.sokapredictions.com';
const TODAY_STR = new Date().toISOString().split('T')[0];

function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const lines = match[1].split('\n');
  const result: Record<string, string> = {};
  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx !== -1) {
      const key = line.slice(0, colonIdx).trim();
      let val = line.slice(colonIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      result[key] = val;
    }
  }
  return result;
}

export function generateSitemapXml(entries: SitemapEntry[]): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n`;
  xml += `        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n`;
  xml += `        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n`;

  for (const entry of entries) {
    xml += `  <url>\n`;
    xml += `    <loc>${entry.loc}</loc>\n`;
    xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
    xml += `    <priority>${entry.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;
  return xml;
}

export function buildSitemapList(): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  const visitedPaths = new Set<string>();

  const addEntry = (
    urlPath: string,
    priority: string,
    changefreq: SitemapEntry['changefreq'] = 'daily',
    lastmod: string = TODAY_STR
  ) => {
    const rawClean = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;
    const cleanPath = rawClean === '/' ? '/' : rawClean.replace(/\/+$/, '');
    if (visitedPaths.has(cleanPath)) return;
    visitedPaths.add(cleanPath);

    const fullUrl = cleanPath === '/' ? `${BASE_URL}/` : `${BASE_URL}${cleanPath}`;
    entries.push({
      loc: fullUrl,
      lastmod,
      changefreq,
      priority,
    });
  };

  // Dynamic Markdown Discovery: Every single URL is generated ONLY from an existing file in src/content/pages/*.md
  // If a markdown file is deleted, it is completely removed from sitemaps!
  const pagesDir = path.resolve(process.cwd(), 'src/content/pages');
  if (fs.existsSync(pagesDir)) {
    const mdFiles = fs.readdirSync(pagesDir).filter((f) => f.endsWith('.md'));
    for (const file of mdFiles) {
      try {
        const filePath = path.join(pagesDir, file);
        const raw = fs.readFileSync(filePath, 'utf-8');
        const fm = parseFrontmatter(raw);
        const slug = file.replace(/\.md$/, '');
        let link = fm.link || `/${slug}`;
        if (!link.startsWith('/')) link = `/${link}`;

        // Don't add legacy /254-sure redirect path to public sitemap
        if (link.includes('254-sure')) continue;

        const type = fm.type || 'static';
        const isHome = slug === 'home' || link === '/';
        const isHighValue = ['tip-of-the-day', 'jackpot-list', 'vip-packages', 'free-predictions', 'sure-odds-packs'].includes(slug);
        const priority =
          isHome
            ? '1.0'
            : isHighValue
            ? '0.95'
            : type === 'jackpot'
            ? '0.85'
            : type === 'vip' || type === 'odds'
            ? '0.9'
            : type === 'static'
            ? '0.6'
            : '0.85';

        const changefreq: SitemapEntry['changefreq'] =
          type === 'static'
            ? 'monthly'
            : isHome || link.includes('today')
            ? 'hourly'
            : 'daily';

        addEntry(link, priority, changefreq, fm.lastmod || TODAY_STR);
      } catch (err) {
        console.warn(`[Sitemap] Skipping ${file} due to read error:`, err);
      }
    }
  }

  // 7. Informational & Legal
  addEntry('/about-us', '0.6', 'monthly');
  addEntry('/contact-us', '0.6', 'monthly');
  addEntry('/terms-and-conditions', '0.5', 'monthly');
  addEntry('/responsible-gambling', '0.5', 'monthly');

  return entries;
}

export function writeSitemaps() {
  const entries = buildSitemapList();
  const xml = generateSitemapXml(entries);

  // Targets to write to
  const publicDir = path.resolve(process.cwd(), 'public');
  const distDir = path.resolve(process.cwd(), 'dist');

  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. Write public/sitemap.xml and public/sitemaps.xml
  const sitemapXmlPath = path.join(publicDir, 'sitemap.xml');
  const sitemapsXmlPath = path.join(publicDir, 'sitemaps.xml');
  fs.writeFileSync(sitemapXmlPath, xml, 'utf-8');
  fs.writeFileSync(sitemapsXmlPath, xml, 'utf-8');
  console.log(`[Sitemap Generator] Generated ${entries.length} URLs in ${sitemapXmlPath} & ${sitemapsXmlPath}`);

  // 2. Also write directly to dist/ if dist already exists
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'sitemap.xml'), xml, 'utf-8');
    fs.writeFileSync(path.join(distDir, 'sitemaps.xml'), xml, 'utf-8');
    console.log(`[Sitemap Generator] Mirrored sitemaps to ${distDir}`);
  }
}

// Run immediately if executed directly via CLI
if (process.argv[1] && process.argv[1].includes('generate-sitemap')) {
  writeSitemaps();
}
