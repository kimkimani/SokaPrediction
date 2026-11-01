import React from 'react';
import { Link } from 'react-router-dom';
import { JackpotItem } from '../types';
import { FaqAccordion } from '../components/FaqAccordion';
import { MarkdownArticleBlock } from '../components/MarkdownArticleBlock';
import { ApiLoadingState } from '../components/ApiLoadingState';

interface JackpotsListPageProps {
  jackpots: JackpotItem[];
  loading: boolean;
  onOpenPaymentModal: (pkg: { name: string; amount: number; id: string; slug: string; type: string }) => void;
}

import { MarkdownPageManager } from '../services/markdownManager';
import { PageNotFound } from '../components/PageNotFound';

export const JackpotsListPage: React.FC<JackpotsListPageProps> = ({
  jackpots,
  loading,
  onOpenPaymentModal,
}) => {
  const pageData =
    MarkdownPageManager.getPageByPath('/jackpot-predictions') ||
    MarkdownPageManager.getPageByPath('/jackpots') ||
    MarkdownPageManager.getPageByPath('/jackpot-list');

  if (!pageData) {
    return <PageNotFound path="/jackpot-predictions" />;
  }

  const title =
    pageData?.frontmatter?.displayTitle ||
    pageData?.frontmatter?.title ||
    'Kenyan Football Jackpot Predictions & Coupons';

  const intro =
    pageData?.frontmatter?.introParagraph ||
    'Select any of the 5 primary Kenyan jackpots below to view the complete fixture coupon, algorithm outcome distributions, variance hedges, and kickoff windows.';

  const badge =
    pageData?.frontmatter?.badgeText ||
    'Kenyan Football Jackpots Hub';

  return (
    <div className="py-2 space-y-6">
      {/* Header - Clean Betwinner360 style */}
      <div className="bg-white border border-gray-200/90 rounded-xl p-5 md:p-6 shadow-xs">
        <span className="inline-block text-[11px] font-bold tracking-wide bg-purple-50 text-[#8D0E83] border border-purple-100 px-2.5 py-1 rounded-md mb-2.5">
          {badge}
        </span>
        <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
          {title}
        </h1>
        <p className="text-xs md:text-sm text-gray-600 max-w-2xl leading-relaxed">
          {intro}
        </p>

        <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] font-semibold text-gray-600">
          <span className="inline-flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded text-gray-700">
            <i className="fas fa-clock text-amber-600"></i>
            Updated: Weekly Coupons
          </span>
          <span className="inline-flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded text-gray-700">
            <i className="fas fa-futbol text-emerald-600"></i>
            5 Active Kenyan Jackpots
          </span>
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded font-bold">
            <i className="fas fa-check-circle text-emerald-600"></i>
            Always Free
          </span>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200">
          <ApiLoadingState
            title="Loading verified jackpot coupons..."
            subtitle="Retrieving active Kenyan jackpot matches and odds analysis"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jackpots.map((jp) => {
            const fixtures = jp.fixtures || jp.games || [];
            return (
              <div
                key={jp.id || jp.slug}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Card Header (solid background, no gradients) */}
                  <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#8D0E83] text-white flex items-center justify-center text-lg font-black shadow-xs">
                        <i className="fas fa-trophy"></i>
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-gray-900 m-0">
                          {jp.name}
                        </h2>
                        <span className="text-xs text-emerald-700 font-extrabold">
                          {jp.estimatedPool} Pool
                        </span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-[#8D0E83]">
                      {jp.gamesCount} Games
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-3 text-xs">
                    <div className="flex items-center justify-between text-gray-500 pb-2 border-b border-gray-100">
                      <span>Schedule Window:</span>
                      <strong className="text-gray-800">{jp.nextGameStartTime || 'Weekend: 16:30 EAT'}</strong>
                    </div>

                    <div className="flex items-center justify-between text-gray-500 pb-2 border-b border-gray-100">
                      <span>Bookmaker Entry:</span>
                      <strong className="text-gray-800">{jp.entryFee || 'KES 99'}</strong>
                    </div>

                    {/* Preview first 3 games */}
                    <div className="pt-1">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1.5">
                        Top Fixtures ({Math.min(fixtures.length, 3)} of {jp.gamesCount}):
                      </span>
                      <div className="space-y-1">
                        {fixtures.slice(0, 3).map((f, i) => (
                          <div
                            key={f.id || i}
                            className="p-1.5 px-2 rounded bg-gray-50 text-[11px] flex items-center justify-between text-gray-700"
                          >
                            <span className="truncate">
                              {f.position || i + 1}. {f.homeTeam} vs {f.awayTeam}
                            </span>
                            <span className="font-extrabold text-[#8D0E83] ml-2">
                              {f.prediction || '1'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 px-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
                  <Link
                    to={`/jackpots/${jp.slug || jp.id}`}
                    className="flex-1 py-2.5 px-3 rounded-lg border border-[#8D0E83] text-[#8D0E83] hover:bg-purple-50 font-bold text-xs text-center transition flex items-center justify-center gap-1.5"
                  >
                    <i className="fas fa-eye text-xs"></i>
                    <span>View Tips</span>
                  </Link>

                  <button
                    onClick={() =>
                      onOpenPaymentModal({
                        name: jp.name,
                        amount: jp.price || 150,
                        id: jp.id,
                        slug: jp.slug,
                        type: 'jackpot',
                      })
                    }
                    className="flex-1 py-2.5 px-3 rounded-lg bg-[#8D0E83] hover:bg-[#630A5C] text-white font-bold text-xs text-center transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <i className="fas fa-lock-open text-xs"></i>
                    <span>Unlock (KES {jp.price || 150})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Editorial Content / Meat of the Article in One Block Section from jackpot-list.md */}
      <MarkdownArticleBlock pageData={pageData} />

      {/* Kenyan Jackpots FAQs from jackpot-list.md */}
      {pageData?.faqs && pageData.faqs.length > 0 && (
        <FaqAccordion
          faqs={pageData.faqs}
          title={pageData.frontmatter.faqTitle || pageData.faqTitle || "Kenyan Football Jackpots - Frequently Asked Questions"}
          subtitle={pageData.frontmatter.faqSubtitle || pageData.faqSubtitle}
        />
      )}
    </div>
  );
};
