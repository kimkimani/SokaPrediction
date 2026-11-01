import React, { useEffect } from 'react';
import { PredictionFixture } from '../types';
import { FixtureCard } from '../components/FixtureCard';
import { ApiLoadingState } from '../components/ApiLoadingState';
import { FaqAccordion } from '../components/FaqAccordion';
import { MarkdownArticleBlock } from '../components/MarkdownArticleBlock';
import { MarkdownPageManager } from '../services/markdownManager';

interface DatePredictionsPageProps {
  mode: 'today' | 'tomorrow' | 'yesterday';
  fixtures: PredictionFixture[];
  loading: boolean;
  onRefresh: (mode: 'today' | 'tomorrow' | 'yesterday') => void;
}

export const DatePredictionsPage: React.FC<DatePredictionsPageProps> = ({
  mode,
  fixtures,
  loading,
  onRefresh,
}) => {
  useEffect(() => {
    onRefresh(mode);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [mode, onRefresh]);

  const mdPath =
    mode === 'today'
      ? '/today-tips-and-predictions'
      : mode === 'tomorrow'
      ? '/tomorrow-tips-and-predictions'
      : '/yesterday-match-results-and-predictions';

  const pageData = MarkdownPageManager.getPageByPath(mdPath);

  const title =
    pageData?.frontmatter?.displayTitle ||
    pageData?.frontmatter?.title ||
    (mode === 'today'
      ? "Today's Football Tips & Predictions"
      : mode === 'tomorrow'
      ? "Tomorrow's Football Tips & Predictions"
      : 'Yesterday Match Results & Predictions History');

  const intro =
    pageData?.frontmatter?.introParagraph ||
    (mode === 'today'
      ? 'All matches scheduled for kickoff today with verified statistical ratings and outcomes.'
      : mode === 'tomorrow'
      ? 'Early value analysis and odds discrepancies for upcoming matches tomorrow.'
      : 'Verified final scores and evaluation of yesterday’s tips (Won / Lost).');

  const badge =
    pageData?.frontmatter?.badgeText ||
    (mode === 'today'
      ? 'Today’s Fixture Schedule'
      : mode === 'tomorrow'
      ? 'Tomorrow’s Early Lines'
      : 'Archived Match Results');

  return (
    <div className="py-2 space-y-6">
      <div className="bg-white border border-gray-200/90 rounded-xl p-5 md:p-6 shadow-xs">
        <span className="inline-block text-[11px] font-bold tracking-wide bg-purple-50 text-[#8D0E83] border border-purple-100 px-2.5 py-1 rounded-md mb-2.5">
          {badge}
        </span>
        <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">{title}</h1>
        <p className="text-xs md:text-sm text-gray-600 max-w-2xl leading-relaxed">{intro}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <div className="text-xs font-bold text-gray-700">
            {fixtures.length} matches listed
          </div>
        </div>

        {loading ? (
          <ApiLoadingState
            title="Loading verified match predictions..."
            subtitle={`Retrieving ${mode} fixture odds and verified statistical picks`}
          />
        ) : fixtures.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-xs">
            No matches found for {mode}.
          </div>
        ) : (
          <div className="space-y-1">
            {fixtures.map((f, i) => (
              <FixtureCard key={f.id || i} fixture={f} indexNumber={i + 1} />
            ))}
          </div>
        )}
      </div>

      {/* Editorial Content / Meat of the Article in One Block Section from date markdown file */}
      <MarkdownArticleBlock pageData={pageData} />

      {/* Date Predictions FAQs from markdown file */}
      {pageData?.faqs && pageData.faqs.length > 0 && (
        <FaqAccordion
          faqs={pageData.faqs}
          title={pageData.frontmatter.faqTitle || pageData.faqTitle || `${pageData.frontmatter.shortTitle || pageData.frontmatter.title} - FAQs`}
          subtitle={pageData.frontmatter.faqSubtitle || pageData.faqSubtitle}
        />
      )}
    </div>
  );
};
