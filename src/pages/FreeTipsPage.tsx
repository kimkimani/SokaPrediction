import React, { useState } from 'react';
import { PredictionFixture } from '../types';
import { FixtureCard } from '../components/FixtureCard';
import { FaqAccordion, FaqItem } from '../components/FaqAccordion';
import { ApiLoadingState } from '../components/ApiLoadingState';

import { MarkdownPageManager } from '../services/markdownManager';
import { PageNotFound } from '../components/PageNotFound';

interface FreeTipsPageProps {
  fixtures: PredictionFixture[];
  loading: boolean;
  onRefresh: () => void;
}

export const FreeTipsPage: React.FC<FreeTipsPageProps> = ({
  fixtures,
  loading,
  onRefresh: _onRefresh,
}) => {
  const [filter, setFilter] = useState<'all' | 'over25' | 'btts' | 'doublechance'>('all');
  const pageData =
    MarkdownPageManager.getPageByPath('/free-sure-tips-and-predictions') ||
    MarkdownPageManager.getPageByPath('/free-predictions');

  if (!pageData) {
    return <PageNotFound path="/free-sure-tips-and-predictions" />;
  }

  const filtered = fixtures.filter((f) => {
    if (filter === 'over25') return f.prediction.includes('Over') || f.prediction.includes('OV');
    if (filter === 'btts') return f.prediction.includes('GG') || f.prediction.includes('BTTS');
    if (filter === 'doublechance') return ['1X', 'X2', '12', 'DC1X', 'DCX2'].includes(f.prediction);
    return true;
  });

  return (
    <div className="py-2 space-y-6">
      <div className="bg-white border border-gray-200/90 rounded-xl p-5 md:p-6 shadow-xs">
        <span className="inline-block text-[11px] font-bold tracking-wide bg-purple-50 text-[#8D0E83] border border-purple-100 px-2.5 py-1 rounded-md mb-2.5">
          {pageData?.frontmatter?.badgeText || 'Free Daily Football Picks'}
        </span>
        <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
          {pageData?.frontmatter?.displayTitle || 'Free Sure Tips & Football Betting Predictions'}
        </h1>
        <p className="text-xs md:text-sm text-gray-600 max-w-2xl leading-relaxed">
          {pageData?.frontmatter?.introParagraph ||
            'Daily verified football betting selections covering 1X2 match winners, Over/Under 2.5 goals, Both Teams to Score (GG/NG), and Double Chance. Sourced from recent team form and verified matchday stats.'}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'All Free Tips' },
              { id: 'over25', label: 'Over 2.5 Goals' },
              { id: 'btts', label: 'Both Teams to Score' },
              { id: 'doublechance', label: 'Double Chance' },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setFilter(c.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filter === c.id
                    ? 'bg-[#8D0E83] text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <ApiLoadingState
            title="Loading verified match predictions..."
            subtitle="Retrieving verified free odds and statistical form picks"
          />
        ) : (
          <div className="space-y-1.5">
            {/* Master Table Header Row for Desktop (md+) */}
            <div className="hidden md:grid grid-cols-[85px_minmax(180px,1fr)_70px_110px_65px_85px] items-center gap-3 px-3.5 py-2 bg-gray-100 border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-wider text-gray-600 select-none">
              <div className="text-center">Time / Status</div>
              <div>Match &amp; League</div>
              <div className="text-center">Score</div>
              <div className="text-center">Prediction</div>
              <div className="text-center">Odds</div>
              <div className="text-center">Outcome</div>
            </div>

            {filtered.map((f, i) => (
              <FixtureCard key={f.id || i} fixture={f} indexNumber={i + 1} />
            ))}
          </div>
        )}
      </div>

      {/* Free Tips FAQ Accordion from free-predictions.md */}
      {pageData?.faqs && pageData.faqs.length > 0 && (
        <FaqAccordion
          faqs={pageData.faqs}
          title={pageData.frontmatter.faqTitle || "Free Football Predictions - FAQs"}
          subtitle="Frequently asked questions about our free daily selections, accuracy rates, and bankroll advice."
        />
      )}
    </div>
  );
};
