import fs from 'fs';
import path from 'path';
import { Plugin } from 'vite';

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

export interface SeoMetadata {
  file: string;
  slug: string;
  link: string;
  fm: Record<string, string>;
}

export function getSeoForUrl(rawUrl: string): SeoMetadata | null {
  const cleanPath = rawUrl.split('?')[0].replace(/\/+$/, '') || '/';
  const pagesDir = path.resolve(process.cwd(), 'src/content/pages');
  if (!fs.existsSync(pagesDir)) return null;

  const files = fs.readdirSync(pagesDir).filter((f) => f.endsWith('.md'));

  const pages: SeoMetadata[] = files.map((file) => {
    const raw = fs.readFileSync(path.join(pagesDir, file), 'utf-8');
    const fm = parseFrontmatter(raw);
    const slug = file.replace(/\.md$/, '');
    let link = fm.link || `/${slug}`;
    if (!link.startsWith('/')) link = `/${link}`;
    return { file, slug, fm, link };
  });

  // 1. Exact link match (matches e.g. /tips/sunpel-prediction, /jackpots/mozzart-super-daily-jackpot-predictions)
  let match = pages.find((p) => p.link.replace(/\/+$/, '') === cleanPath);
  if (match) return match;

  // 2. Slug or jackpotId match (e.g. /jackpots/mozzart-super-daily -> mozzart-super-daily)
  const segments = cleanPath.split('/').filter(Boolean);
  const lastSeg = segments[segments.length - 1];
  if (lastSeg) {
    match = pages.find((p) => p.slug === lastSeg || p.fm.jackpotId === lastSeg);
    if (match) return match;
  }

  // 3. Home match
  if (cleanPath === '/' || cleanPath === '') {
    return pages.find((p) => p.slug === 'home') || null;
  }

  return null;
}

let lastRequestedUrl = '/';

export function htmlSeoPlugin(): Plugin {
  return {
    name: 'html-seo-synchronizer',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const u = req.originalUrl || req.url;
        if (u && !u.startsWith('/@') && !u.startsWith('/src') && !u.startsWith('/node_modules') && !path.extname(u.split('?')[0])) {
          lastRequestedUrl = u;
        }
        next();
      });
    },
    transformIndexHtml(html, ctx) {
      const rawUrl = (ctx.originalUrl && ctx.originalUrl !== '/index.html') ? ctx.originalUrl : (lastRequestedUrl || '/');
      const cleanPath = rawUrl.split('?')[0].replace(/\/+$/, '') || '/';

      const seo = getSeoForUrl(cleanPath);
      if (!seo) return html;

      const title = (seo.fm.title || seo.fm.displayTitle || 'Free Soka Prediction Today and Football Soka Tips')
        .replace(/\s*\|\s*SOKAPREDICTIONS\b/gi, '')
        .replace(/\s*\|\s*SokaPredictions\b/gi, '')
        .trim();

      const description =
        seo.fm.description ||
        "Get Accurate Today and Daily Soka football Predictions and betting tips Right Now. Don't waste time on low quality soka tips. Check SOKAPREDICTIONS for Top Soccer tips.";

      const keywords =
        seo.fm.keywords ||
        'soka prediction, soka prediction today, soka prediction today football, soka tip, soka tips today, soka prediction tips';

      const canonicalPath = (seo.link || cleanPath) === '/' ? '/' : (seo.link || cleanPath).replace(/\/+$/, '');
      const canonicalUrl = `https://www.sokapredictions.com${canonicalPath === '/' ? '/' : canonicalPath}`;

      const escape = (str: string) => str.replace(/"/g, '&quot;');

      let transformed = html;
      transformed = transformed.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
      transformed = transformed.replace(
        /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
        `<link rel="canonical" href="${canonicalUrl}" />`
      );
      transformed = transformed.replace(
        /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
        `<meta name="description" content="${escape(description)}" />`
      );
      transformed = transformed.replace(
        /<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/i,
        `<meta name="keywords" content="${escape(keywords)}" />`
      );
      transformed = transformed.replace(
        /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
        `<meta property="og:title" content="${escape(title)}" />`
      );
      transformed = transformed.replace(
        /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
        `<meta property="og:description" content="${escape(description)}" />`
      );
      transformed = transformed.replace(
        /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
        `<meta property="og:url" content="${canonicalUrl}" />`
      );
      transformed = transformed.replace(
        /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
        `<meta name="twitter:title" content="${escape(title)}" />`
      );
      transformed = transformed.replace(
        /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
        `<meta name="twitter:description" content="${escape(description)}" />`
      );

      return transformed;
    },
  };
}
