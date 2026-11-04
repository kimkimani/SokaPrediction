import { marked } from 'marked';
import { JackpotItem } from '../types';

export interface MarkdownFrontmatter {
  title: string;
  displayTitle?: string;
  shortTitle?: string;
  badgeText?: string;
  description: string;
  keywords?: string;
  link: string;
  slug?: string;
  type: 'jackpot' | 'category' | 'landing' | 'vip' | 'odds' | 'static';
  jackpotId?: string;
  fixturesCategory?: string;
  dateMode?: 'today' | 'yesterday' | 'tomorrow' | 'multi_date_3_plus_1' | 'multi_date_4_plus_1';
  navSection?: 'main' | 'categories' | 'providers' | 'dates' | 'tools' | 'legal';
  sortOrder?: number;
  authorId?: string;
  introParagraph?: string;
  listTitle?: string;
  listSubtitle?: string;
  sectionTitle?: string;
  sectionDescription?: string;
  faqTitle?: string;
  faqSubtitle?: string;
  tags?: string[];
  lastmod?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  answerHtml?: string;
}

export interface MarkdownSection {
  id: string;
  title: string;
  level: number;
  rawContent: string;
  htmlContent: string;
  tag: 'schedule' | 'hedges' | 'bonuses' | 'strategy' | 'faq' | 'general';
  faqs?: FaqItem[];
}

export interface MarkdownPageData {
  slug: string;
  filename: string;
  frontmatter: MarkdownFrontmatter;
  rawContent: string;
  htmlContent: string;
  overview: string;
  overviewHtml: string;
  sections: MarkdownSection[];
  faqs?: FaqItem[];
  faqTitle?: string;
  faqSubtitle?: string;
}

// Simple, robust frontmatter parser that runs in browser & Node without external native deps
export function parseFrontmatter(rawText: string): { frontmatter: Record<string, any>; body: string } {
  const trimmed = rawText.trim();
  if (!trimmed.startsWith('---')) {
    return { frontmatter: {}, body: trimmed };
  }

  const endIdx = trimmed.indexOf('---', 3);
  if (endIdx === -1) {
    return { frontmatter: {}, body: trimmed };
  }

  const yamlBlock = trimmed.substring(3, endIdx).trim();
  const body = trimmed.substring(endIdx + 3).trim();
  const frontmatter: Record<string, any> = {};

  const lines = yamlBlock.split('\n');
  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const key = line.substring(0, colonIdx).trim();
    let val = line.substring(colonIdx + 1).trim();

    // Strip enclosing quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1);
    }

    // Handle array like ["a", "b"]
    if (val.startsWith('[') && val.endsWith(']')) {
      const items = val
        .substring(1, val.length - 1)
        .split(',')
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean);
      frontmatter[key] = items;
    } else {
      frontmatter[key] = val;
    }
  }

  return { frontmatter, body };
}

// Splits markdown body into an introductory overview and separate sections by heading (## or ###)
export function splitMarkdownIntoSections(rawBody: string): {
  overview: string;
  overviewHtml: string;
  sections: MarkdownSection[];
  faqs?: FaqItem[];
  faqTitle?: string;
  faqSubtitle?: string;
} {
  const lines = rawBody.split('\n');
  const sections: MarkdownSection[] = [];
  let overviewLines: string[] = [];
  let currentSection: {
    title: string;
    level: number;
    lines: string[];
  } | null = null;

  let detectedFaqTitle: string | undefined;
  let detectedFaqSubtitle: string | undefined;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^(#{2})\s+(.+)$/);

    if (match) {
      if (currentSection) {
        const rawContent = currentSection.lines.join('\n').trim();
        const tag = categorizeSection(currentSection.title);
        const { faqs, subtitle } = tag === 'faq' ? extractFaqsFromMarkdown(rawContent) : { faqs: undefined, subtitle: undefined };
        if (tag === 'faq') {
          detectedFaqTitle = currentSection.title;
          if (subtitle) detectedFaqSubtitle = subtitle;
        }
        sections.push({
          id: slugify(currentSection.title),
          title: currentSection.title,
          level: currentSection.level,
          rawContent,
          htmlContent: marked.parse(rawContent) as string,
          tag,
          faqs,
        });
      }
      currentSection = {
        title: match[2].trim(),
        level: match[1].length,
        lines: [],
      };
    } else {
      if (currentSection) {
        currentSection.lines.push(line);
      } else {
        overviewLines.push(line);
      }
    }
  }

  if (currentSection) {
    const rawContent = currentSection.lines.join('\n').trim();
    const tag = categorizeSection(currentSection.title);
    const { faqs, subtitle } = tag === 'faq' ? extractFaqsFromMarkdown(rawContent) : { faqs: undefined, subtitle: undefined };
    if (tag === 'faq') {
      detectedFaqTitle = currentSection.title;
      if (subtitle) detectedFaqSubtitle = subtitle;
    }
    sections.push({
      id: slugify(currentSection.title),
      title: currentSection.title,
      level: currentSection.level,
      rawContent,
      htmlContent: marked.parse(rawContent) as string,
      tag,
      faqs,
    });
  }

  const overview = overviewLines.join('\n').trim();
  const overviewHtml = overview ? (marked.parse(overview) as string) : '';

  // Extract all FAQs across any section or top level
  const allFaqs: FaqItem[] = [];
  sections.forEach((s) => {
    if (s.faqs && s.faqs.length > 0) {
      allFaqs.push(...s.faqs);
    }
  });

  return {
    overview,
    overviewHtml,
    sections,
    faqs: allFaqs.length > 0 ? allFaqs : undefined,
    faqTitle: detectedFaqTitle,
    faqSubtitle: detectedFaqSubtitle,
  };
}

export function extractFaqsFromMarkdown(rawContent: string): { faqs: FaqItem[]; subtitle?: string } {
  const lines = rawContent.split('\n');
  const faqs: FaqItem[] = [];
  let currentQuestion = '';
  let currentAnswerLines: string[] = [];
  let introLines: string[] = [];

  const pushCurrentFaq = () => {
    if (currentQuestion && currentAnswerLines.length > 0) {
      const answer = currentAnswerLines.join('\n').trim();
      if (answer) {
        faqs.push({
          question: currentQuestion.replace(/^Q:\s*/i, '').trim(),
          answer,
          answerHtml: marked.parse(answer) as string,
        });
      }
    }
  };

  for (const line of lines) {
    const headingMatch = line.match(/^#{3,4}\s+(.+)$/);
    const boldMatch = !headingMatch ? line.match(/^\*\*(?:Q:\s*)?([^*?]+\?)\*\*:?\s*$/i) : null;
    const match = headingMatch || boldMatch;

    if (match) {
      pushCurrentFaq();
      currentQuestion = match[1].trim();
      currentAnswerLines = [];
    } else if (currentQuestion) {
      currentAnswerLines.push(line);
    } else {
      if (line.trim()) {
        introLines.push(line.trim());
      }
    }
  }

  pushCurrentFaq();

  const subtitle = introLines.join(' ').trim() || undefined;
  return { faqs, subtitle };
}

function categorizeSection(title: string): MarkdownSection['tag'] {
  const t = title.toLowerCase();
  if (t.includes('schedule') || t.includes('timing') || t.includes('window')) return 'schedule';
  if (t.includes('upset') || t.includes('hedge') || t.includes('double-chance') || t.includes('variance')) return 'hedges';
  if (t.includes('bonus') || t.includes('qualify') || t.includes('tier') || t.includes('payout')) return 'bonuses';
  if (t.includes('strategy') || t.includes('advantage') || t.includes('factor') || t.includes('why') || t.includes('mathematical')) return 'strategy';
  if (t.includes('faq') || t.includes('question') || t.includes('frequently')) return 'faq';
  return 'general';
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// Helper to replace dynamic shortcodes for jackpot pages matching Cheerplex README
export function resolveJackpotShortcodes(content: string, jackpot: JackpotItem | null): string {
  if (!jackpot) return content;

  const fixtures = jackpot.fixtures || jackpot.games || [];
  const homeCount = fixtures.filter((f) => f.prediction === '1' || f.prediction === 'Home Win (1)').length;
  const drawCount = fixtures.filter((f) => f.prediction === 'X' || f.prediction === 'Draw (X)').length;
  const awayCount = fixtures.filter((f) => f.prediction === '2' || f.prediction === 'Away Win (2)').length;
  const dcFixtures = fixtures.filter((f) => ['1X', 'X2', '12', 'DC12', 'DC1X', 'DCX2'].includes(f.prediction));
  const dcCount = dcFixtures.length;

  const leagues = Array.from(new Set(fixtures.map((f) => f.leagueName).filter(Boolean))).slice(0, 5);
  const leaguesStr = leagues.length > 0 ? leagues.join(', ') : 'Premier League, La Liga, Serie A';

  const scheduleStr = jackpot.nextGameStartTime || 'Saturday: 16:30 EAT';
  const selectionsIncludeStr = `selections include ${homeCount} home wins, ${drawCount} draws, ${awayCount} away wins and ${dcCount} double chances`;
  const upsetAlertStr = dcFixtures.length > 0
    ? dcFixtures.map((f) => `${f.homeTeam} vs ${f.awayTeam} (${f.prediction})`).join('; ')
    : 'All coupon fixtures calibrated for maximum bonus qualification.';

  return content
    .replace(/\{\{JACKPOT_SCHEDULE\}\}/g, scheduleStr)
    .replace(/\{\{JACKPOT_LEAGUES\}\}/g, leaguesStr)
    .replace(/\{\{JACKPOT_SELECTIONS_INCLUDE\}\}/g, selectionsIncludeStr)
    .replace(/\{\{JACKPOT_SELECTIONS\}\}/g, `${homeCount} Home, ${drawCount} Draw, ${awayCount} Away, ${dcCount} Double Chance`)
    .replace(/\{\{JACKPOT_DOUBLE_CHANCES_COUNT\}\}/g, `${dcCount} Double Chance Picks`)
    .replace(/\{\{JACKPOT_UPSET_ALERT\}\}/g, upsetAlertStr)
    .replace(/\{\{UI_TIMER\}\}/g, `<div class="p-3 bg-purple-50 text-purple-900 font-bold rounded-lg my-3 border border-purple-200">⏳ Coupon Kickoff: ${scheduleStr}</div>`);
}

// Resolves shortcodes inside all sections of a page
export function resolveSectionsForJackpot(
  page: MarkdownPageData,
  jackpot: JackpotItem | null
): { overviewHtml: string; sections: MarkdownSection[] } {
  if (!jackpot) {
    return { overviewHtml: page.overviewHtml, sections: page.sections };
  }

  const resolvedOverview = resolveJackpotShortcodes(page.overview, jackpot);
  const overviewHtml = marked.parse(resolvedOverview) as string;

  const sections = page.sections.map((sec) => {
    const resolvedContent = resolveJackpotShortcodes(sec.rawContent, jackpot);
    return {
      ...sec,
      rawContent: resolvedContent,
      htmlContent: marked.parse(resolvedContent) as string,
    };
  });

  return { overviewHtml, sections };
}

// Load all markdown files dynamically via Vite's import.meta.glob across root, tips/, and jackpots/
const rawMarkdownFiles = import.meta.glob('/src/content/pages/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

export class MarkdownPageManager {
  private static cachedPages: MarkdownPageData[] | null = null;

  static getAllPages(): MarkdownPageData[] {
    if (this.cachedPages) return this.cachedPages;

    const pages: MarkdownPageData[] = [];

    for (const [path, rawText] of Object.entries(rawMarkdownFiles)) {
      const filename = path.split('/').pop() || '';
      const slug = filename.replace(/\.md$/, '');
      const { frontmatter, body } = parseFrontmatter(rawText);

      // Determine directory category: tips, jackpots, or root
      const relPath = path.replace(/^\/src\/content\/pages\//, '');
      const parts = relPath.split('/');
      const dirName = parts.length > 1 ? parts[0] : '';

      // Clean link: folder structure dictates default path if not explicitly overridden
      let link = frontmatter.link;
      if (!link) {
        if (dirName === 'tips') {
          link = `/tips/${slug}`;
        } else if (dirName === 'jackpots') {
          link = `/jackpots/${slug}`;
        } else {
          link = slug === 'home' ? '/' : `/${slug}`;
        }
      }
      if (!link.startsWith('/')) link = `/${link}`;
      link = link === '/' ? '/' : link.replace(/\/+$/, '');

      // Determine default type from folder structure if not set
      let defaultType: MarkdownFrontmatter['type'] = 'static';
      if (dirName === 'jackpots') defaultType = 'jackpot';
      else if (dirName === 'tips') defaultType = 'category';

      const cleanTitle = (frontmatter.title || slug.replace(/-/g, ' ')).replace(/\s*\|\s*SOKAPREDICTIONS/gi, '').trim();
      const cleanDisplayTitle = (frontmatter.displayTitle || cleanTitle).replace(/\s*\|\s*SOKAPREDICTIONS/gi, '').trim();

      const html = marked.parse(body) as string;
      const { overview, overviewHtml, sections, faqs, faqTitle, faqSubtitle } = splitMarkdownIntoSections(body);

      const effectiveFaqTitle = frontmatter.faqTitle || faqTitle;
      const effectiveFaqSubtitle = frontmatter.faqSubtitle || faqSubtitle;

      const fm: MarkdownFrontmatter = {
        title: cleanTitle,
        displayTitle: cleanDisplayTitle,
        shortTitle: (frontmatter.shortTitle || cleanDisplayTitle).replace(/\s*\|\s*SOKAPREDICTIONS/gi, '').trim(),
        badgeText: frontmatter.badgeText,
        description: frontmatter.description || 'Verified football predictions and betting tips.',
        keywords: frontmatter.keywords,
        link,
        slug,
        type: frontmatter.type || defaultType,
        jackpotId: frontmatter.jackpotId || slug,
        fixturesCategory: frontmatter.fixturesCategory,
        dateMode: frontmatter.dateMode,
        navSection: frontmatter.navSection,
        sortOrder: frontmatter.sortOrder ? parseInt(String(frontmatter.sortOrder), 10) : 99,
        authorId: frontmatter.authorId,
        introParagraph: frontmatter.introParagraph,
        listTitle: frontmatter.listTitle,
        listSubtitle: frontmatter.listSubtitle,
        sectionTitle: frontmatter.sectionTitle,
        sectionDescription: frontmatter.sectionDescription,
        faqTitle: effectiveFaqTitle,
        faqSubtitle: effectiveFaqSubtitle,
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        lastmod: frontmatter.lastmod || '2026-10-31',
      };

      pages.push({
        slug,
        filename,
        frontmatter: fm,
        rawContent: body,
        htmlContent: html,
        overview,
        overviewHtml,
        sections,
        faqs,
        faqTitle: effectiveFaqTitle,
        faqSubtitle: effectiveFaqSubtitle,
      });
    }

    // Sort pages by sortOrder, then by title
    pages.sort((a, b) => {
      const orderA = a.frontmatter.sortOrder ?? 99;
      const orderB = b.frontmatter.sortOrder ?? 99;
      if (orderA !== orderB) return orderA - orderB;
      return (a.frontmatter.shortTitle || a.frontmatter.title).localeCompare(
        b.frontmatter.shortTitle || b.frontmatter.title
      );
    });

    this.cachedPages = pages;
    return pages;
  }

  static getPageByPath(path: string): MarkdownPageData | null {
    const all = this.getAllPages();
    const cleanPath = path.split('?')[0].replace(/\/+$/, '') || '/';

    // 1. Strict exact link match against frontmatter link
    const match = all.find((p) => p.frontmatter.link.replace(/\/+$/, '') === cleanPath);
    if (match) return match;

    // 2. Special root match
    if (cleanPath === '/' || cleanPath === '') {
      return all.find((p) => p.slug === 'home') || null;
    }

    return null;
  }

  // Look up page by slug or jackpotId for redirecting non-canonical / misplaced paths
  static getPageBySlug(slug: string): MarkdownPageData | null {
    if (!slug) return null;
    const clean = slug.toLowerCase().replace(/^\/+|\/+$/g, '');
    const all = this.getAllPages();
    return (
      all.find(
        (p) =>
          p.slug.toLowerCase() === clean ||
          p.frontmatter.jackpotId?.toLowerCase() === clean
      ) || null
    );
  }

  static getPagesByType(type: MarkdownFrontmatter['type']): MarkdownPageData[] {
    return this.getAllPages().filter((p) => p.frontmatter.type === type);
  }

  // Returns all tips category pages (e.g. Over 1.5, Over 2.5, BTTS, Double Chance, 1X2)
  static getCategoryPages(): MarkdownPageData[] {
    return this.getAllPages().filter(
      (p) =>
        p.frontmatter.navSection === 'categories' ||
        (p.frontmatter.type === 'category' && !p.frontmatter.navSection)
    );
  }

  // Returns all external provider / community tips pages (e.g. Sunpel, Sokapedia, PredictZ)
  static getProviderPages(): MarkdownPageData[] {
    return this.getAllPages().filter(
      (p) =>
        p.frontmatter.navSection === 'providers' ||
        p.frontmatter.fixturesCategory?.includes('sunpel') ||
        p.frontmatter.fixturesCategory?.includes('sokapedia') ||
        p.frontmatter.fixturesCategory?.includes('predictz')
    );
  }

  // Returns all date-based landing pages (Today, Tomorrow, Yesterday)
  static getDatePages(): MarkdownPageData[] {
    return this.getAllPages().filter(
      (p) =>
        p.frontmatter.navSection === 'dates' ||
        ['today', 'tomorrow', 'yesterday'].includes(p.frontmatter.fixturesCategory || '')
    );
  }

  // Checks whether a page exists in the markdown pages collection
  static hasPage(pathOrSlug: string): boolean {
    return this.getPageByPath(pathOrSlug) !== null;
  }

  // Returns main navigation items ONLY for pages that currently exist as markdown files
  static getMainNavigationPages(): Array<{
    label: string;
    path: string;
    icon: string;
    badge?: string;
    page: MarkdownPageData;
  }> {
    const candidates = [
      { label: 'Home', path: '/', icon: 'fa-home', slug: 'home' },
      { label: 'Jackpots Hub', path: '/jackpot-predictions', icon: 'fa-trophy', slug: 'jackpot-list' },
      { label: 'Tip of the Day', path: '/tip-of-the-day', icon: 'fa-star', slug: 'tip-of-the-day', badge: 'Banker' },
      { label: 'VIP Packages', path: '/vip-packages', icon: 'fa-crown', slug: 'vip-packages', badge: '85% Win' },
      { label: 'Mega JP', path: '/jackpots/sportpesa-mega', icon: 'fa-trophy', slug: 'sportpesa-mega', badge: '17 Games' },
      { label: 'Sure Odds Packs', path: '/sure-premium-odds-and-tips', icon: 'fa-gem', slug: 'sure-odds-packs' },
      { label: 'Free Predictions', path: '/free-sure-tips-and-predictions', icon: 'fa-futbol', slug: 'free-predictions' },
    ];

    const result: Array<{
      label: string;
      path: string;
      icon: string;
      badge?: string;
      page: MarkdownPageData;
    }> = [];

    for (const c of candidates) {
      const page = this.getPageByPath(c.path);
      if (page) {
        result.push({
          label: page.frontmatter.shortTitle || c.label,
          path: page.frontmatter.link || c.path,
          icon: c.icon,
          badge: c.badge,
          page,
        });
      }
    }

    // Also include any user-created markdown page that explicitly set navSection: 'main'
    const customMainPages = this.getAllPages().filter(
      (p) => p.frontmatter.navSection === 'main' && !result.some((r) => r.path === p.frontmatter.link)
    );
    for (const p of customMainPages) {
      result.push({
        label: p.frontmatter.shortTitle || p.frontmatter.displayTitle || p.frontmatter.title,
        path: p.frontmatter.link,
        icon: 'fa-link',
        badge: p.frontmatter.badgeText,
        page: p,
      });
    }

    return result;
  }

  // Returns desktop header navigation items ONLY for existing markdown pages
  static getHeaderNavPages(): Array<{
    label: string;
    path: string;
    icon?: string;
    badge?: string;
    badgeColor?: string;
  }> {
    const items: Array<{
      label: string;
      path: string;
      icon?: string;
      badge?: string;
      badgeColor?: string;
    }> = [];

    const homePage = this.getPageByPath('/');
    if (homePage) {
      items.push({ label: 'Home', path: '/' });
    }

    const jackpotsPage = this.getPageByPath('/jackpot-predictions');
    if (jackpotsPage) {
      const jpCount = this.getJackpotPages().length;
      items.push({
        label: 'Jackpots',
        path: '/jackpot-predictions',
        badge: jpCount > 0 ? String(jpCount) : undefined,
        badgeColor: 'bg-amber-100 text-amber-800',
      });
    }

    const tipOfDayPage = this.getPageByPath('/tip-of-the-day');
    if (tipOfDayPage) {
      items.push({
        label: 'Tip of the Day',
        path: '/tip-of-the-day',
        icon: 'fas fa-star text-amber-500 text-[10px]',
      });
    }

    const vipPage = this.getPageByPath('/vip-packages');
    if (vipPage) {
      items.push({
        label: 'VIP Packages',
        path: '/vip-packages',
        badge: '85%',
        badgeColor: 'bg-purple-100 text-[#8D0E83]',
      });
    }

    const megaJpPage = this.getJackpotPage('sportpesa-mega');
    if (megaJpPage) {
      items.push({
        label: 'Mega JP',
        path: megaJpPage.frontmatter.link,
        icon: 'fas fa-trophy text-amber-500 text-[10px]',
      });
    }

    const sureOddsPage =
      this.getPageByPath('/sure-premium-odds-and-tips') ||
      this.getPageByPath('/sure-odds-packs');
    if (sureOddsPage) {
      items.push({
        label: 'Sure Odds',
        path: '/sure-premium-odds-and-tips',
      });
    }

    // Dynamically include category pages from markdown (Over 1.5, BTTS, Double Chance, etc.)
    const categoryPages = this.getCategoryPages();
    for (const cp of categoryPages.slice(0, 4)) {
      items.push({
        label: cp.frontmatter.shortTitle || cp.frontmatter.displayTitle || cp.slug,
        path: cp.frontmatter.link,
      });
    }

    return items;
  }

  // Returns jackpot pages
  static getJackpotPages(): MarkdownPageData[] {
    return this.getAllPages().filter((p) => p.frontmatter.type === 'jackpot');
  }

  // Finds the markdown page for a given jackpot ID or slug
  static getJackpotPage(jackpotIdOrSlug: string): MarkdownPageData | null {
    if (!jackpotIdOrSlug) return null;
    const cleanId = jackpotIdOrSlug.toLowerCase().trim();
    const all = this.getAllPages();
    return (
      all.find(
        (p) =>
          p.frontmatter.type === 'jackpot' &&
          ((p.frontmatter.jackpotId && p.frontmatter.jackpotId.toLowerCase() === cleanId) ||
            p.slug.toLowerCase() === cleanId ||
            p.frontmatter.link.toLowerCase().endsWith(`/${cleanId}`))
      ) || null
    );
  }

  // Resolves the link for any jackpot ID or slug dynamically from markdown files
  static getJackpotLink(jackpotIdOrSlug: string): string {
    const page = this.getJackpotPage(jackpotIdOrSlug);
    if (page?.frontmatter?.link) {
      return page.frontmatter.link.replace(/\/+$/, '');
    }
    return `/jackpots/${jackpotIdOrSlug}`.replace(/\/+$/, '');
  }

  static generateSitemapXml(): string {
    const pages = this.getAllPages();
    const baseUrl = 'https://www.sokapredictions.com';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const p of pages) {
      const loc = `${baseUrl}${p.frontmatter.link}`;
      const lastmod = p.frontmatter.lastmod || '2026-10-31';
      const priority = p.slug === 'home' ? '1.0' : p.frontmatter.type === 'jackpot' ? '0.9' : '0.8';

      xml += `  <url>\n`;
      xml += `    <loc>${loc}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>${priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;
    return xml;
  }
}
