import fs from 'fs';
import path from 'path';
import { marked } from 'marked';

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
  introParagraph?: string;
  badgeText?: string;
  faqTitle?: string;
  faqSubtitle?: string;
  [key: string]: any;
}

interface FaqItem {
  question: string;
  answer: string;
}

function parseFrontmatterAndFaqs(rawContent: string): { fm: Frontmatter; body: string; faqs: FaqItem[] } {
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

  return { fm, body, faqs };
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

function renderPrerenderedShell(
  title: string,
  intro: string,
  badge: string,
  bodyMarkdown: string,
  faqs?: FaqItem[],
  faqTitle?: string
): string {
  const parsedBodyHtml = bodyMarkdown ? (marked.parse(bodyMarkdown) as string) : '';

  const faqSectionHtml =
    faqs && faqs.length > 0
      ? `
      <section class="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 md:p-8 shadow-xs my-6">
        <h2 class="text-xl md:text-2xl font-black text-gray-900 tracking-tight mb-2">
          ${escapeHtmlAttr(faqTitle || 'Frequently Asked Questions')}
        </h2>
        <p class="text-xs text-gray-500 mb-6">Expert answers to top punter questions.</p>
        <div class="space-y-3">
          ${faqs
            .map(
              (f) => `
            <div class="border border-gray-200 rounded-xl overflow-hidden p-4 bg-gray-50/50">
              <h3 class="text-sm md:text-base font-bold text-gray-900 mb-2">
                ${escapeHtmlAttr(f.question)}
              </h3>
              <p class="text-xs md:text-sm text-gray-700 leading-relaxed">
                ${escapeHtmlAttr(f.answer)}
              </p>
            </div>
          `
            )
            .join('')}
        </div>
      </section>
    `
      : '';

  return `
    <div class="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
        <div class="max-w-[1260px] 2xl:max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 h-14 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5 flex-shrink-0">
            <a href="/" class="logo-brand text-base sm:text-lg font-black tracking-tight flex items-center gap-2 text-decoration-none">
              <img src="/assets/brand-emblem.png" alt="Soka Predictions Emblem" class="w-8 h-8 rounded-lg object-contain shadow-xs flex-shrink-0" />
              <span class="text-[#8D0E83]">SOKA PREDICTIONS</span>
            </a>
          </div>
          <nav class="hidden lg:flex items-center gap-1 text-xs font-bold text-gray-700">
            <a href="/" class="px-3 py-1.5 rounded-md hover:text-[#8D0E83] hover:bg-gray-50 transition">Home</a>
            <a href="/jackpot-predictions" class="px-3 py-1.5 rounded-md hover:text-[#8D0E83] hover:bg-gray-50 transition">Jackpots</a>
            <a href="/tip-of-the-day" class="px-3 py-1.5 rounded-md hover:text-[#8D0E83] hover:bg-gray-50 transition">Tip of the Day</a>
            <a href="/vip-packages" class="px-3 py-1.5 rounded-md hover:text-[#8D0E83] hover:bg-gray-50 transition">VIP Packages</a>
            <a href="/sure-premium-odds-and-tips" class="px-3 py-1.5 rounded-md hover:text-[#8D0E83] hover:bg-gray-50 transition">Sure Odds</a>
            <a href="/free-sure-tips-and-predictions" class="px-3 py-1.5 rounded-md hover:text-[#8D0E83] hover:bg-gray-50 transition">Free Predictions</a>
          </nav>
          <div class="flex items-center gap-2 flex-shrink-0">
            <a href="/vip-packages" class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider transition shadow-sm">
              <i class="fas fa-crown text-xs"></i>
              <span>Go VIP</span>
            </a>
          </div>
        </div>
      </header>

      <main class="main-content min-w-0 pb-16 lg:pb-12 px-3 sm:px-4 lg:px-5 pt-3 md:pt-4 w-full max-w-[1260px] 2xl:max-w-[1360px] mx-auto flex-1">
        <div class="py-2 space-y-6">
          <div class="bg-white border border-gray-200/90 rounded-xl p-5 md:p-6 shadow-xs">
            <div class="max-w-4xl">
              <div class="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 text-[#8D0E83] px-2.5 py-1 rounded-md text-xs font-bold mb-3">
                <i class="fas fa-check-circle text-xs"></i>
                <span>${escapeHtmlAttr(badge)}</span>
              </div>
              <h1 class="text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight mb-2.5">
                ${escapeHtmlAttr(title)}
              </h1>
              ${
                intro
                  ? `<p class="text-xs md:text-sm text-gray-600 leading-relaxed font-normal mb-4 max-w-3xl">${escapeHtmlAttr(
                      intro
                    )}</p>`
                  : ''
              }
              <div class="flex flex-wrap items-center gap-3 mt-4">
                <a href="#predictions" class="px-4 py-2 rounded-lg bg-[#8D0E83] hover:bg-[#6e0a66] text-white text-xs font-bold shadow-xs transition flex items-center gap-2">
                  <i class="fas fa-list-check"></i>
                  <span>View Free Match Predictions</span>
                </a>
                <a href="/vip-packages" class="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-2">
                  <i class="fas fa-crown text-amber-200"></i>
                  <span>Get VIP Banker Slips (KES 200)</span>
                </a>
              </div>
            </div>
          </div>

          ${
            parsedBodyHtml
              ? `
            <article class="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 md:p-8 shadow-xs my-6">
              <div class="max-w-4xl mx-auto space-y-4 text-gray-700 leading-relaxed text-xs md:text-sm prose max-w-none">
                ${parsedBodyHtml}
              </div>
            </article>
          `
              : ''
          }

          ${faqSectionHtml}
        </div>
      </main>

      <footer class="bg-gray-900 text-gray-300 border-t border-gray-800 py-10 px-4 mt-auto">
        <div class="max-w-[1260px] 2xl:max-w-[1360px] mx-auto text-center space-y-3">
          <div class="flex items-center justify-center gap-2 text-white font-extrabold text-base">
            <img src="/assets/brand-emblem.png" alt="Soka Predictions" class="w-6 h-6 rounded object-contain" />
            <span>SOKA PREDICTIONS</span>
          </div>
          <p class="text-xs text-gray-400 max-w-xl mx-auto leading-relaxed">
            Kenya's premier data-driven football prediction intelligence platform. Accurate form guides, jackpot combinations, and daily bankers.
          </p>
          <div class="text-[11px] text-gray-500 pt-2 border-t border-gray-800">
            &copy; ${new Date().getFullYear()} SokaPredictions.com. All rights reserved. 18+ Play Responsibly.
          </div>
        </div>
      </footer>
    </div>
  `.trim();
}

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

  // Safely strip ONLY the FAQPage JSON-LD tag WITHOUT crossing any script boundaries
  baseTemplate = baseTemplate.replace(
    /\s*<script\s+id="soka-faq-schema"[\s\S]*?<\/script>\s*/gi,
    '\n'
  );
  baseTemplate = baseTemplate.replace(
    /\s*<script\s+type="application\/ld\+json"[^>]*>(?:(?!<\/script>)[\s\S])*?"@type":\s*"FAQPage"(?:(?!<\/script>)[\s\S])*?<\/script>\s*/gi,
    '\n'
  );

  const pagesDir = path.resolve(process.cwd(), 'src/content/pages');

  interface RouteToRender {
    path: string;
    title: string;
    displayTitle: string;
    description: string;
    keywords: string;
    canonical: string;
    badgeText?: string;
    introParagraph?: string;
    bodyMarkdown?: string;
    faqs?: FaqItem[];
    faqTitle?: string;
  }

  const routesMap = new Map<string, RouteToRender>();

  // 2. Ingest all Markdown pages from src/content/pages/
  if (fs.existsSync(pagesDir)) {
    const files = fs.readdirSync(pagesDir).filter((f) => f.endsWith('.md'));
    for (const file of files) {
      const raw = fs.readFileSync(path.join(pagesDir, file), 'utf-8');
      const { fm, body, faqs } = parseFrontmatterAndFaqs(raw);
      const slug = file.replace(/\.md$/, '');

      let link = fm.link || `/${slug}`;
      if (!link.startsWith('/')) link = `/${link}`;

      const title = cleanTitle(fm.title || fm.displayTitle || 'Free Soka Prediction Today and Football Soka Tips');
      const displayTitle = cleanTitle(fm.displayTitle || fm.title || title);
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
        displayTitle,
        description,
        keywords,
        canonical,
        badgeText: fm.badgeText || "Today's Verified Kenya Football Predictions & Jackpots",
        introParagraph: fm.introParagraph,
        bodyMarkdown: body,
        faqs: faqs.length > 0 ? faqs : undefined,
        faqTitle: fm.faqTitle,
      });

      // If jackpot has a specific jackpotId distinct from link, also map it
      if (fm.jackpotId && fm.jackpotId !== slug) {
        const altJackpotPath = `/jackpots/${fm.jackpotId}`;
        if (!routesMap.has(altJackpotPath)) {
          routesMap.set(altJackpotPath, {
            path: altJackpotPath,
            title,
            displayTitle,
            description,
            keywords,
            canonical: `${BASE_URL}${altJackpotPath}`,
            badgeText: fm.badgeText || 'Kenyan Football Jackpot Analysis',
            introParagraph: fm.introParagraph,
            bodyMarkdown: body,
            faqs: faqs.length > 0 ? faqs : undefined,
            faqTitle: fm.faqTitle,
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
            displayTitle,
            description,
            keywords,
            canonical: `${BASE_URL}${slugJackpotPath}`,
            badgeText: fm.badgeText || 'Kenyan Football Jackpot Analysis',
            introParagraph: fm.introParagraph,
            bodyMarkdown: body,
            faqs: faqs.length > 0 ? faqs : undefined,
            faqTitle: fm.faqTitle,
          });
        }
      }
    }
  }

  // 3. Ensure core static and aliased routes are mapped
  const fallbackRoutes: Record<string, { title: string; description: string; keywords: string; badge: string; intro: string }> = {
    '/about-us': {
      title: 'About Soka Predictions - Kenya Premier Sports Analytics',
      description: "Learn about SokaPredictions, Kenya's premier data-driven football prediction intelligence platform.",
      keywords: 'about soka predictions, kenya betting analysis, soccer prediction engine, sokaking',
      badge: 'About Us',
      intro: "SokaPredictions is Kenya's premier data-driven football prediction intelligence platform, powered by advanced predictive modeling.",
    },
    '/contact-us': {
      title: 'Contact Us & WhatsApp VIP Support',
      description: 'Get in touch with SokaPredictions support team or join our exclusive VIP Telegram and WhatsApp channels.',
      keywords: 'contact soka predictions, soka predictions whatsapp, vip predictions customer support',
      badge: 'Contact & Support',
      intro: 'Get in touch with the SokaPredictions team for VIP tips support, payment confirmation, and sports analytics inquiries.',
    },
    '/jackpot-predictions': {
      title: 'All Kenya Football Jackpot Predictions & Tips',
      description: 'Comprehensive analysis and combination tips for top football jackpots including SportPesa, Betika, and Mozzart.',
      keywords: 'jackpot predictions, sportpesa mega jackpot, betika midweek jackpot, mozzart grand jackpot',
      badge: 'All Kenya Jackpots',
      intro: 'Access verified combination predictions and form analysis for major weekly and daily Kenyan football jackpots.',
    },
    '/tip-of-the-day': {
      title: 'Tip of the Day - Best Single Football Prediction & Banker',
      description: "Today's highest confidence single football banker pick with verified statistics and form analysis.",
      keywords: 'tip of the day, banker bet, single bet of the day, sure win prediction',
      badge: 'Single Banker Pick',
      intro: "Today's highest confidence single football banker selection backed by quantitative form analysis and expected goals.",
    },
    '/vip-packages': {
      title: 'VIP Prediction Packages & Premium Tips',
      description: 'Join SokaPredictions VIP packages for high-accuracy football tips, mega jackpot combinations, and daily bankers.',
      keywords: 'vip predictions, premium betting tips, accurate football tips, soka vip',
      badge: 'VIP Membership',
      intro: 'Upgrade to SokaPredictions VIP membership for exclusive 5+ odds daily banker slips and tailored jackpot combinations.',
    },
    '/free-sure-tips-and-predictions': {
      title: 'Free Sure Football Betting Tips and Predictions Today',
      description: '100% free daily football betting predictions covering 1X2, Over/Under, Both Teams to Score, and Double Chance.',
      keywords: 'free football tips, sure predictions today, free soccer betting tips',
      badge: '100% Free Predictions',
      intro: 'Explore daily free football betting predictions across top leagues worldwide with verified form ratings.',
    },
    '/sure-premium-odds-and-tips': {
      title: 'Soka Sure Premium Odds Shortlists',
      description: 'Curated 2+ Odds, 5+ Odds, and 10+ Multi-bet odds tickets for smart accumulator betting.',
      keywords: '2 odds banker, 5 odds ticket, multi bet tips, accumulator predictions',
      badge: 'Sure Odds Tickets',
      intro: 'Curated accumulator shortlists designed for consistent returns with calculated risk management.',
    },
  };

  for (const [rPath, meta] of Object.entries(fallbackRoutes)) {
    if (!routesMap.has(rPath)) {
      routesMap.set(rPath, {
        path: rPath,
        title: meta.title,
        displayTitle: meta.title,
        description: meta.description,
        keywords: meta.keywords,
        canonical: `${BASE_URL}${rPath}`,
        badgeText: meta.badge,
        introParagraph: meta.intro,
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

    // 7. Inject Schema.org FAQPage if FAQs exist (with safe identifier id="soka-faq-schema")
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

    // 8. Inject Prerendered Shell inside <div id="root">...</div> so the page is NEVER blank on Cloudflare!
    const shellMarkup = renderPrerenderedShell(
      data.displayTitle || data.title,
      data.introParagraph || data.description,
      data.badgeText || "Today's Verified Kenya Football Predictions & Jackpots",
      data.bodyMarkdown || '',
      data.faqs,
      data.faqTitle
    );

    if (/<div id="root">[\s\S]*?<\/div>/i.test(html)) {
      html = html.replace(/<div id="root">[\s\S]*?<\/div>/i, `<div id="root">${shellMarkup}</div>`);
    } else {
      html = html.replace('<body>', `<body>\n    <div id="root">${shellMarkup}</div>`);
    }

    // 9. GUARANTEE CSS stylesheet is linked in <head>
    if (cssAssetPath && !html.includes(cssAssetPath)) {
      html = html.replace('</head>', `    <link rel="stylesheet" crossorigin href="${cssAssetPath}">\n  </head>`);
    }

    // 10. GUARANTEE JS bundle script is present before </body>
    if (jsAssetPath && !html.includes(jsAssetPath)) {
      html = html.replace('</body>', `    <script type="module" crossorigin src="${jsAssetPath}"></script>\n  </body>`);
    }

    // 11. Write static HTML files to dist/
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

  // Clean any old flat .html files in dist root to prevent Cloudflare redirect loops
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

  console.log(`[Prerender Engine] Successfully generated ${renderedCount} static HTML pages in ${distDir}!`);
}

// Run directly from CLI if invoked as main module
if (process.argv[1] && process.argv[1].includes('prerender-pages')) {
  prerenderAllPages();
}
