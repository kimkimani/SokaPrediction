import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  MarkdownPageManager,
  MarkdownPageData,
  resolveSectionsForJackpot,
  MarkdownSection,
} from '../services/markdownManager';
import { MultiDateFixtureService, DateGroupedFixtures } from '../services/multiDateFixtureService';
import { CheerplexApiService } from '../services/api';
import { JackpotItem, VipPackage, OddsPack, PredictionFixture } from '../types';
import { MultiDateFixturesSection } from '../components/MultiDateFixturesSection';
import { VipPackagesSection } from '../components/VipPackagesSection';
import { PremiumOddsSection } from '../components/PremiumOddsSection';
import { FaqAccordion, FaqItem } from '../components/FaqAccordion';
import { MarkdownArticleBlock } from '../components/MarkdownArticleBlock';
import { PageNotFound } from '../components/PageNotFound';
import { ApiLoadingState } from '../components/ApiLoadingState';
import { JackpotDetailPage } from './JackpotDetailPage';

interface DynamicMarkdownPageProps {
  jackpots: JackpotItem[];
  vipPackages: VipPackage[];
  oddsPacks: OddsPack[];
  onOpenPaymentModal: (pkg: { name: string; amount: number; id: string; slug: string; type: string }) => void;
}

export const DynamicMarkdownPage: React.FC<DynamicMarkdownPageProps> = ({
  jackpots,
  vipPackages,
  oddsPacks,
  onOpenPaymentModal,
}) => {
  const location = useLocation();
  const [pageData, setPageData] = useState<MarkdownPageData | null>(null);
  const [groupedFixtures, setGroupedFixtures] = useState<DateGroupedFixtures[]>([]);
  const [resolvedOverviewHtml, setResolvedOverviewHtml] = useState<string>('');
  const [resolvedSections, setResolvedSections] = useState<MarkdownSection[]>([]);
  const [loadingFixtures, setLoadingFixtures] = useState(false);

  useEffect(() => {
    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Find markdown page matching current URL path
    const found = MarkdownPageManager.getPageByPath(location.pathname);
    setPageData(found);

    if (found) {
      // 1. If Jackpot page, resolve jackpot shortcodes
      if (found.frontmatter.type === 'jackpot') {
        const jId = found.frontmatter.jackpotId || found.slug;
        const j = jackpots.find((item) => item.slug === jId || item.id === jId) || null;
        const { overviewHtml, sections } = resolveSectionsForJackpot(found, j);
        setResolvedOverviewHtml(overviewHtml);
        setResolvedSections(sections);
      } else {
        setResolvedOverviewHtml(found.overviewHtml);
        setResolvedSections(found.sections);
      }

      // 2. Multi-Day Categorized Fixtures Engine backed by real sports data
      const cat = found.frontmatter.fixturesCategory || found.slug;
      const dateMode = found.frontmatter.dateMode;
      if (cat && (found.frontmatter.type === 'category' || found.frontmatter.type === 'landing' || found.frontmatter.fixturesCategory)) {
        setLoadingFixtures(true);
        CheerplexApiService.getPredictions(cat)
          .then((apiFixtures: PredictionFixture[]) => {
            const groups = MultiDateFixtureService.getGroupedFixtures(cat, dateMode, apiFixtures);
            setGroupedFixtures(groups);
          })
          .catch((err) => {
            console.error('[DynamicMarkdownPage] Error fetching predictions:', err);
            setGroupedFixtures([]);
          })
          .finally(() => {
            setLoadingFixtures(false);
          });
      } else {
        setGroupedFixtures([]);
      }
    }
  }, [location.pathname, jackpots]);

  if (!pageData) {
    return <PageNotFound path={location.pathname} />;
  }

  // If this markdown page is of type jackpot, render the dedicated JackpotDetailPage
  if (pageData.frontmatter.type === 'jackpot') {
    return (
      <JackpotDetailPage
        jackpots={jackpots}
        onOpenPaymentModal={onOpenPaymentModal}
      />
    );
  }

  const { frontmatter } = pageData;

  const isCompetitor =
    frontmatter.navSection === 'providers' ||
    ['predictz', 'sokapedia', 'sunpel'].some(
      (c) => location.pathname.includes(c) || (frontmatter.fixturesCategory || '').toLowerCase().includes(c)
    );

  const handleScrollToFixtures = () => {
    document.getElementById('fixtures-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Split sections: strategy/analytical sections vs general content vs FAQs
  const strategySections = resolvedSections.filter(
    (s) => s.tag === 'strategy' || s.tag === 'hedges' || s.tag === 'bonuses'
  );
  const faqSections = resolvedSections.filter((s) => s.tag === 'faq');
  const generalSections = resolvedSections.filter(
    (s) => !strategySections.includes(s) && !faqSections.includes(s)
  );

  // Combine all FAQs from markdown
  const collectedFaqs: FaqItem[] = [];
  if (pageData.faqs && pageData.faqs.length > 0) {
    collectedFaqs.push(...pageData.faqs);
  }
  faqSections.forEach((s) => {
    if (s.faqs && s.faqs.length > 0) {
      s.faqs.forEach((item) => {
        if (!collectedFaqs.some((f) => f.question === item.question)) {
          collectedFaqs.push(item);
        }
      });
    }
  });

  return (
    <div className="py-2 space-y-6">
      {/* Hero Header with matching Home Page Title/Intro/Button setup */}
      <div className="bg-white border border-gray-200/90 rounded-xl p-5 md:p-6 shadow-xs">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 text-[#8D0E83] px-2.5 py-1 rounded-md text-xs font-bold mb-3">
            <i className="fas fa-check-circle text-xs"></i>
            <span>
              {frontmatter.badgeText ||
                (isCompetitor
                  ? 'Competitor Form Comparison • Verified 4-Day History'
                  : frontmatter.type === 'jackpot'
                  ? 'Kenyan Football Jackpot Analysis'
                  : frontmatter.type === 'vip'
                  ? 'VIP Membership Club'
                  : "Today's Verified Kenya Football Predictions & Jackpots")}
            </span>
          </div>

          <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight mb-2.5">
            {frontmatter.displayTitle || frontmatter.title}
          </h1>

          {frontmatter.introParagraph && (
            <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-normal mb-4 max-w-3xl">
              {frontmatter.introParagraph}
            </p>
          )}

          {/* Key Info Strip (Hidden on mobile) */}
          <div className="hidden sm:flex flex-wrap items-center gap-2 mb-5 text-[11px] font-semibold text-gray-600">
            <span className="inline-flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded text-gray-700">
              <i className="fas fa-clock text-amber-600"></i>
              Updated: Daily 08:30 EAT
            </span>
            <span className="inline-flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded text-gray-700">
              <i className="fas fa-futbol text-emerald-600"></i>
              Markets: 1X2, GG/NG, Over 2.5, DC
            </span>
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded font-bold">
              <i className="fas fa-check-circle text-emerald-600"></i>
              Always Free
            </span>
          </div>

          {/* Action Buttons setup matching home page */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleScrollToFixtures}
              className="px-4 py-2 rounded-lg bg-[#8D0E83] hover:bg-[#6e0a66] text-white text-xs font-bold shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <i className="fas fa-list-check"></i>
              <span>View Free Match Predictions</span>
            </button>

            <button
              onClick={() =>
                onOpenPaymentModal({
                  name: 'One Day VIP Banker Slip',
                  amount: 200,
                  id: 'vip-1day',
                  slug: 'vip-1day',
                  type: 'vip',
                })
              }
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <i className="fas fa-crown text-amber-200"></i>
              <span>Get VIP Banker Slips (KES 200)</span>
            </button>

            <Link
              to={MarkdownPageManager.getJackpotLink('sportpesa-mega')}
              className="px-3.5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold border border-gray-200 transition flex items-center gap-1.5"
            >
              <i className="fas fa-trophy text-amber-500 text-xs"></i>
              <span>SportPesa Mega Jackpot (17 Games)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION 2: Multi-Date Categorized Matches Render (4 Days only for competitor pages) */}
      {loadingFixtures ? (
        <div className="bg-white rounded-xl border border-gray-200/90 shadow-xs mb-6">
          <ApiLoadingState
            title="Loading verified match predictions..."
            subtitle="Retrieving odds and statistical form picks from API"
          />
        </div>
      ) : groupedFixtures.length > 0 ? (
        <div id="fixtures-section">
          <MultiDateFixturesSection
            groupedFixtures={groupedFixtures}
            title={frontmatter.listTitle || `${frontmatter.displayTitle || frontmatter.title} Matches`}
            subtitle={frontmatter.listSubtitle}
          />
        </div>
      ) : null}

      {/* SECTION 3: VIP Packages Component Render */}
      {frontmatter.type === 'vip' && (
        <VipPackagesSection
          packages={vipPackages}
          onOpenPaymentModal={onOpenPaymentModal}
        />
      )}

      {/* SECTION 4: Odds Packs Component Render */}
      {frontmatter.type === 'odds' && (
        <PremiumOddsSection
          oddsPacks={oddsPacks}
          onOpenPaymentModal={onOpenPaymentModal}
        />
      )}

      {/* SECTION 5: Unified Editorial Content in One Block Section with H2 to H3 hierarchy */}
      <MarkdownArticleBlock
        pageData={pageData}
        sections={resolvedSections}
        overviewHtml={resolvedOverviewHtml}
      />

      {/* SECTION 6: Interactive FAQ Accordion from Markdown */}
      {collectedFaqs.length > 0 && (
        <FaqAccordion
          faqs={collectedFaqs}
          title={frontmatter.faqTitle || pageData.faqTitle || `${frontmatter.shortTitle || frontmatter.title} FAQs`}
          subtitle={frontmatter.faqSubtitle || pageData.faqSubtitle}
        />
      )}
    </div>
  );
};
