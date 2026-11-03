import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://www.sokapredictions.com';

interface Frontmatter {
  title?: string;
  displayTitle?: string;
  shortTitle?: string;
  description?: string;
  metaDescription?: string;
  keywords?: string;
  tags?: string[];
  link?: string;
  canonical?: string;
  type?: string;
  jackpotId?: string;
  lastmod?: string;
  [key: string]: any;
}

interface FaqItem {
  question: string;
  answer: string;
}

function parseFrontmatterAndFaqs(rawContent: string): { fm: Frontmatter; faqs: FaqItem[] } {
  const match = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fm: Frontmatter = {};
  const faqs: FaqItem[] = [];

  if (match) {
    const lines = match[1].split('\n');
    for (const line of lines) {
      const colonIdx = line.indexOf(':');
      if (colonIdx !== -1) {
        const key = line.slice(0, colonIdx).trim();
        let val = line.slice(colonIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        } else if (val.startsWith('[') && val.endsWith(']')) {
          val = val
            .slice(1, -1)
            .split(',')
            .map((s) => s.trim().replace(/^['"]|['"]$/g, '')) as any;
        }
        fm[key] = val;
      }
    }
  }

  const body = match ? rawContent.slice(match[0].length).trim() : rawContent.trim();
  const lines = body.split('\n');
  let inFaqSection = false;
  let currentQ = '';
  let currentA: string[] = [];

  const pushFaq = () => {
    if (currentQ && currentA.length > 0) {
      const answer = currentA.join(' ').replace(/<[^>]*>/g, '').trim();
      if (answer) {
        faqs.push({ question: currentQ.replace(/^Q:\s*/i, '').trim(), answer });
      }
    }
  };

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      pushFaq();
      currentQ = '';
      currentA = [];
      const titleLower = h2Match[1].toLowerCase();
      inFaqSection = titleLower.includes('faq') || titleLower.includes('frequently') || titleLower.includes('questions');
      continue;
    }

    if (inFaqSection) {
      const h3Match = line.match(/^###\s+(.+)$/);
      const boldQMatch = !h3Match ? line.match(/^\*\*(?:Q:\s*)?([^*?]+\?)\*\*:?\s*$/i) : null;
      const qMatch = h3Match || boldQMatch;

      if (qMatch) {
        pushFaq();
        currentQ = qMatch[1].trim();
        currentA = [];
      } else if (currentQ) {
        if (line.trim()) {
          currentA.push(line.trim());
        }
      }
    }
  }
  pushFaq();

  return { fm, faqs };
}

function cleanTitle(rawTitle: string): string {
  return rawTitle
    .replace(/\s*\|\s*SOKAPREDICTIONS\b/gi, '')
    .replace(/\s*\|\s*SokaPredictions\b/gi, '')
    .trim();
}

const escapeHtmlAttr = (str: string) =>
  str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

export function prerenderAllPages() {
  const distDir = path.resolve(process.cwd(), 'dist');
  const templatePath = path.join(distDir, 'index.html');

  if (!fs.existsSync(templatePath)) {
    console.warn('[Prerender] dist/index.html not found. Run "vite build" first.');
    return;
  }

  // 1. Locate the built JS bundle and CSS files in dist/assets
  const assetsDir = path.join(distDir, 'assets');
  let jsAssetPath = '';
  let cssAssetPath = '';

  if (fs.existsSync(assetsDir)) {
    const files = fs.readdirSync(assetsDir);
    const jsFile = files.find((f) => f.startsWith('index-') && f.endsWith('.js'));
    const cssFile = files.find((f) => f.startsWith('index-') && f.endsWith('.css'));
    if (jsFile) jsAssetPath = `/assets/${jsFile}`;
    if (cssFile) cssAssetPath = `/assets/${cssFile}`;
  }

  let baseTemplate = fs.readFileSync(templatePath, 'utf-8');

  // Safely strip ONLY injected FAQPage JSON-LD scripts without touching other scripts or links
  baseTemplate = baseTemplate.replace(
    /\s*<script\s+id="soka-faq-schema"[\s\S]*?<\/script>\s*/gi,
    '\n'
  );
  baseTemplate = baseTemplate.replace(
    /\s*<script\s+type="application\/ld\+json"[^>]*>(?:(?!<\/script>)[\s\S])*?"@type":\s*"FAQPage"(?:(?!<\/script>)[\s\S])*?<\/script>\s*/gi,
    '\n'
  );

  // 2. Ensure the body has only a clean <div id="root"></div> and the module script tag
  // This completely eliminates any duplicated page markup or extra footers!
  const scriptTag = jsAssetPath ? `    <script type="module" crossorigin src="${jsAssetPath}"></script>` : '';
  baseTemplate = baseTemplate.replace(
    /<body>[\s\S]*?<\/body>/i,
    `<body>\n    <div id="root"></div>\n${scriptTag}\n  </body>`
  );

  // 3. Ensure the CSS stylesheet link is present in <head>
  if (cssAssetPath && !baseTemplate.includes(cssAssetPath)) {
    baseTemplate = baseTemplate.replace(
      '</head>',
      `    <link rel="stylesheet" crossorigin href="${cssAssetPath}">\n  </head>`
    );
  }

  const pagesDir = path.resolve(process.cwd(), 'src/content/pages');

  interface RouteToRender {
    path: string;
    title: string;
    description: string;
    keywords: string;
    canonical: string;
    faqs?: FaqItem[];
  }

  const routesMap = new Map<string, RouteToRender>();

  // 4. Ingest all Markdown pages from src/content/pages/
  if (fs.existsSync(pagesDir)) {
    const files = fs.readdirSync(pagesDir).filter((f) => f.endsWith('.md'));
    for (const file of files) {
      const raw = fs.readFileSync(path.join(pagesDir, file), 'utf-8');
      const { fm, faqs } = parseFrontmatterAndFaqs(raw);
      const slug = file.replace(/\.md$/, '');

      let link = fm.link || `/${slug}`;
      if (!link.startsWith('/')) link = `/${link}`;

      const title = cleanTitle(fm.title || fm.displayTitle || 'Free Soka Prediction Today and Football Soka Tips');
      const description =
        fm.description ||
        fm.metaDescription ||
        "Get Accurate Today and Daily Soka football Predictions and betting tips Right Now. Don't waste time on low quality soka tips. Check SOKAPREDICTIONS for Top Soccer tips.";

      const keywords =
        fm.keywords ||
        (Array.isArray(fm.tags) ? fm.tags.join(', ') : 'soka prediction, soka tips today, football betting predictions');

      const canonicalPath = link === '/' ? '/' : link.replace(/\/+$/, '');
      const canonical = `${BASE_URL}${canonicalPath === '/' ? '/' : canonicalPath}`;

      routesMap.set(canonicalPath, {
        path: canonicalPath,
        title,
        description,
        keywords,
        canonical,
        faqs: faqs.length > 0 ? faqs : undefined,
      });

      // If jackpot has a specific jackpotId distinct from link, also map it
      if (fm.jackpotId && fm.jackpotId !== slug) {
        const altJackpotPath = `/jackpots/${fm.jackpotId}`;
        if (!routesMap.has(altJackpotPath)) {
          routesMap.set(altJackpotPath, {
            path: altJackpotPath,
            title,
            description,
            keywords,
            canonical: `${BASE_URL}${altJackpotPath}`,
            faqs: faqs.length > 0 ? faqs : undefined,
          });
        }
      }

      // Also support direct /jackpots/{slug}
      if (fm.type === 'jackpot') {
        const slugJackpotPath = `/jackpots/${slug}`;
        if (!routesMap.has(slugJackpotPath)) {
          routesMap.set(slugJackpotPath, {
            path: slugJackpotPath,
            title,
            description,
            keywords,
            canonical: `${BASE_URL}${slugJackpotPath}`,
            faqs: faqs.length > 0 ? faqs : undefined,
          });
        }
      }
    }
  }

  // 5. Ensure core static routes are mapped
  const fallbackRoutes: Record<string, { title: string; description: string; keywords: string }> = {
    '/about-us': {
      title: 'About Soka Predictions - Kenya Premier Sports Analytics',
      description: "Learn about SokaPredictions, Kenya's premier data-driven football prediction intelligence platform.",
      keywords: 'about soka predictions, kenya betting analysis, soccer prediction engine, sokaking',
    },
    '/contact-us': {
      title: 'Contact Us & WhatsApp VIP Support',
      description: 'Get in touch with SokaPredictions support team or join our exclusive VIP Telegram and WhatsApp channels.',
      keywords: 'contact soka predictions, soka predictions whatsapp, vip predictions customer support',
    },
    '/jackpot-predictions': {
      title: 'All Kenya Football Jackpot Predictions & Tips',
      description: 'Comprehensive analysis and combination tips for top football jackpots including SportPesa, Betika, and Mozzart.',
      keywords: 'jackpot predictions, sportpesa mega jackpot, betika midweek jackpot, mozzart grand jackpot',
    },
    '/tip-of-the-day': {
      title: 'Tip of the Day - Best Single Football Prediction & Banker',
      description: "Today's highest confidence single football banker pick with verified statistics and form analysis.",
      keywords: 'tip of the day, banker bet, single bet of the day, sure win prediction',
    },
    '/vip-packages': {
      title: 'VIP Prediction Packages & Premium Tips',
      description: 'Join SokaPredictions VIP packages for high-accuracy football tips, mega jackpot combinations, and daily bankers.',
      keywords: 'vip predictions, premium betting tips, accurate football tips, soka vip',
    },
    '/free-sure-tips-and-predictions': {
      title: 'Free Sure Football Betting Tips and Predictions Today',
      description: '100% free daily football betting predictions covering 1X2, Over/Under, Both Teams to Score, and Double Chance.',
      keywords: 'free football tips, sure predictions today, free soccer betting tips',
    },
    '/sure-premium-odds-and-tips': {
      title: 'Soka Sure Premium Odds Shortlists',
      description: 'Curated 2+ Odds, 5+ Odds, and 10+ Multi-bet odds tickets for smart accumulator betting.',
      keywords: '2 odds banker, 5 odds ticket, multi bet tips, accumulator predictions',
    },
  };

  for (const [rPath, meta] of Object.entries(fallbackRoutes)) {
    if (!routesMap.has(rPath)) {
      routesMap.set(rPath, {
        path: rPath,
        title: meta.title,
        description: meta.description,
        keywords: meta.keywords,
        canonical: `${BASE_URL}${rPath}`,
      });
    }
  }

  console.log(`[Prerender Engine] Prerendering ${routesMap.size} unique routes for static production dist...`);

  let renderedCount = 0;

  for (const [routePath, data] of routesMap.entries()) {
    let html = baseTemplate;

    // 1. Replace Title
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${data.title}</title>`);

    // 2. Replace Canonical
    html = html.replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
      `<link rel="canonical" href="${data.canonical}" />`
    );

    // 3. Replace Description
    html = html.replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="description" content="${escapeHtmlAttr(data.description)}" />`
    );

    // 4. Replace Keywords
    html = html.replace(
      /<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="keywords" content="${escapeHtmlAttr(data.keywords)}" />`
    );

    // 5. Replace OpenGraph Tags
    html = html.replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:title" content="${escapeHtmlAttr(data.title)}" />`
    );
    html = html.replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:description" content="${escapeHtmlAttr(data.description)}" />`
    );
    html = html.replace(
      /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:url" content="${data.canonical}" />`
    );

    // 6. Replace Twitter Tags
    html = html.replace(
      /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:title" content="${escapeHtmlAttr(data.title)}" />`
    );
    html = html.replace(
      /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:description" content="${escapeHtmlAttr(data.description)}" />`
    );

    // 7. Inject Schema.org FAQPage if FAQs exist (clean isolated script tag)
    if (data.faqs && data.faqs.length > 0) {
      const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: data.faqs.slice(0, 10).map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.answer,
          },
        })),
      };
      const schemaTag = `\n    <script id="soka-faq-schema" type="application/ld+json">\n    ${JSON.stringify(faqSchema, null, 2)}\n    </script>`;
      html = html.replace('</head>', `${schemaTag}\n  </head>`);
    }

    // 8. Write clean static HTML file with <div id="root"></div>
    if (routePath === '/' || routePath === '') {
      fs.writeFileSync(templatePath, html, 'utf-8');
    } else {
      const cleanRelPath = routePath.replace(/^\/+/, '').replace(/\/+$/, '');
      const targetDir = path.join(distDir, cleanRelPath);
      fs.mkdirSync(targetDir, { recursive: true });

      // Generate dist/<path>/index.html
      fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf-8');
    }

    renderedCount++;
  }

  // Clean any legacy flat .html files in dist root to prevent Cloudflare redirect loops
  try {
    const legacyFiles = fs.readdirSync(distDir);
    for (const f of legacyFiles) {
      if (f.endsWith('.html') && f !== 'index.html') {
        const fullP = path.join(distDir, f);
        if (fs.statSync(fullP).isFile()) {
          fs.unlinkSync(fullP);
        }
      }
    }
  } catch (err) {
    console.warn('[Prerender Engine] Warning cleaning legacy flat HTML files:', err);
  }

  console.log(`[Prerender Engine] Successfully generated ${renderedCount} clean static HTML pages in ${distDir}!`);
}

// Run directly from CLI if invoked as main module
if (process.argv[1] && process.argv[1].includes('prerender-pages')) {
  prerenderAllPages();
}
