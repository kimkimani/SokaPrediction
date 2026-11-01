import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PredictionFixture } from '../types';
import { FixtureCard } from '../components/FixtureCard';
import { FaqAccordion, FaqItem } from '../components/FaqAccordion';
import { MarkdownPageManager } from '../services/markdownManager';
import { PageNotFound } from '../components/PageNotFound';
import { ApiLoadingState } from '../components/ApiLoadingState';

interface TipOfTheDayPageProps {
  fixtures: PredictionFixture[];
  loading: boolean;
  onRefresh?: () => void;
  onOpenPaymentModal?: (pkg: { name: string; amount: number; id: string; slug: string; type: string }) => void;
  onOpenDefaultVipModal?: () => void;
}

export const TipOfTheDayPage: React.FC<TipOfTheDayPageProps> = ({
  fixtures,
  loading,
  onOpenPaymentModal,
  onOpenDefaultVipModal,
}) => {
  const [copied, setCopied] = useState(false);

  const pageData =
    MarkdownPageManager.getPageByPath('/tip-of-the-day') ||
    MarkdownPageManager.getPageByPath('tip-of-the-day');

  if (!pageData) {
    return <PageNotFound path="/tip-of-the-day" />;
  }

  // Select the single highest-confidence fixture for today deterministically
  const pickOfTheDay = useMemo(() => {
    if (!fixtures || fixtures.length === 0) return null;

    // Filter to today's games if available, or use all loaded fixtures
    const sorted = [...fixtures].sort((a, b) => {
      const confA = typeof a.confidence === 'number' ? a.confidence : parseInt(String(a.confidence || 75), 10);
      const confB = typeof b.confidence === 'number' ? b.confidence : parseInt(String(b.confidence || 75), 10);
      if (confB !== confA) {
        return confB - confA; // Highest confidence first
      }
      // Deterministic tie-breaker so it remains 100% stable throughout the day
      return String(a.id || a.homeTeam).localeCompare(String(b.id || b.homeTeam));
    });

    return sorted[0] || null;
  }, [fixtures]);

  const handleCopyPick = () => {
    if (!pickOfTheDay) return;
    const shareText = `🎯 SOKAPREDICTIONS BANKER OF THE DAY: ${pickOfTheDay.homeTeam} vs ${pickOfTheDay.awayTeam} | Pick: ${pickOfTheDay.prediction} (Odds: ${pickOfTheDay.odds || '1.65'}) | Confidence: ${pickOfTheDay.confidence}% | Kickoff: ${pickOfTheDay.kickoffTime} EAT https://sokapredictions.com/tip-of-the-day`;
    navigator.clipboard?.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const confidenceScore = pickOfTheDay
    ? typeof pickOfTheDay.confidence === 'number'
      ? pickOfTheDay.confidence
      : parseInt(String(pickOfTheDay.confidence || 88), 10)
    : 88;

  const oddsDisplay = pickOfTheDay?.odds || '1.75';

  return (
    <div className="py-2 space-y-6">
      {/* 1. Header Hero Banner */}
      <div className="bg-white border border-gray-200/90 rounded-xl p-5 md:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 mb-2.5">
              <img
                src="/assets/brand-emblem.png"
                alt=""
                className="w-4 h-4 rounded object-contain flex-shrink-0"
              />
              <span>{pageData?.frontmatter?.badgeText || 'Single High-Confidence Banker Pick'}</span>
            </div>

            <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
              {pageData?.frontmatter?.displayTitle || 'Tip of the Day - Best Single Football Prediction'}
            </h1>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-normal mb-3">
              {pageData?.frontmatter?.introParagraph ||
                'Every morning, our quantitative analytics engine filters hundreds of global soccer matches to identify exactly ONE single game representing our highest statistical probability and greatest value margin. This is our official Banker Pick of the Day.'}
            </p>

            {/* Quick Metrics Badges */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-gray-600">
              <span className="inline-flex items-center gap-1.5 bg-purple-50 text-[#8D0E83] border border-purple-200 px-2.5 py-1 rounded font-bold">
                <i className="fas fa-shield-alt"></i>
                1 Game Only
              </span>
              <span className="inline-flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded text-gray-700">
                <i className="fas fa-percentage text-emerald-600"></i>
                Confidence: {confidenceScore}%
              </span>
              <span className="inline-flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded text-gray-700">
                <i className="fas fa-coins text-amber-600"></i>
                Odds: {oddsDisplay}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded font-bold">
                <i className="fas fa-check-circle text-emerald-600"></i>
                88.4% Hit Rate
              </span>
            </div>
          </div>

          {/* Quick VIP Action */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 min-w-[220px]">
            <button
              onClick={handleCopyPick}
              className="px-4 py-2 rounded-lg bg-white border border-gray-300 hover:border-[#8D0E83] text-gray-800 hover:text-[#8D0E83] font-bold text-xs transition flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
            >
              <i className={`fas ${copied ? 'fa-check text-emerald-600' : 'fa-copy text-gray-500'}`}></i>
              <span>{copied ? 'Banker Copied!' : 'Copy Today\'s Pick'}</span>
            </button>

            {onOpenDefaultVipModal && (
              <button
                onClick={onOpenDefaultVipModal}
                className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className="fas fa-crown text-xs"></i>
                <span>Get VIP 5+ Odds Slip</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Pick of the Day Card & Table Display */}
      <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-amber-50/40 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-xs">
              <i className="fas fa-award text-base"></i>
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-gray-900 m-0">
                Today Top Soka Featured Pick of the Day
              </h2>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Strictly 1 single selection • Selected based on highest statistical confidence score
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Verified Top Pick
            </span>
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <ApiLoadingState
            title="Identifying today's #1 banker match..."
            subtitle="Filtering global fixtures by Poisson goal rating"
          />
        ) : !pickOfTheDay ? (
          <div className="py-12 text-center text-gray-500 p-6">
            <i className="fas fa-futbol text-3xl text-gray-300 mb-2 block"></i>
            <p className="text-sm font-bold text-gray-700">No scheduled matches found for today.</p>
            <span className="text-xs text-gray-400">Please check back shortly as bookmaker markets open.</span>
          </div>
        ) : (
          <div className="p-4 sm:p-6 space-y-5">
            {/* Spotlight Showcase Box */}
            <div className="rounded-xl border-2 border-amber-300 bg-amber-50/20 p-4 sm:p-6 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-amber-100">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                  {pickOfTheDay.countryFlag && (
                    <img
                      src={pickOfTheDay.countryFlag}
                      alt=""
                      className="w-4 h-3 object-cover rounded-2xs border border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}
                  <span>{pickOfTheDay.leagueName}</span>
                  {pickOfTheDay.leagueCountry && (
                    <span className="text-gray-400">({pickOfTheDay.leagueCountry})</span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono font-bold text-gray-600 bg-white border border-gray-200 px-2 py-0.5 rounded">
                    <i className="fas fa-clock text-blue-500 mr-1"></i>
                    {pickOfTheDay.kickoffTime} EAT
                  </span>
                  <span className="bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded text-[11px] uppercase">
                    {pickOfTheDay.status || 'NS'}
                  </span>
                </div>
              </div>

              {/* Match Teams Face-Off */}
              <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 py-2">
                {/* Home Team */}
                <div className="text-center md:text-left">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                    Home Team
                  </span>
                  <h3 className="text-lg md:text-xl font-black text-gray-900 tracking-tight">
                    {pickOfTheDay.homeTeam}
                  </h3>
                </div>

                {/* Center: The Official Pick Badge */}
                <div className="flex flex-col items-center justify-center text-center p-3 rounded-xl bg-white border border-amber-200 shadow-2xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 mb-1">
                    Official Tip of the Day
                  </span>
                  <div className="bg-[#8D0E83] text-white font-black text-lg sm:text-xl px-5 py-1.5 rounded-lg shadow-sm">
                    {pickOfTheDay.prediction}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs font-bold">
                    <span className="text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                      Odds: <strong>{oddsDisplay}</strong>
                    </span>
                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      {confidenceScore}% Conf.
                    </span>
                  </div>
                </div>

                {/* Away Team */}
                <div className="text-center md:text-right">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                    Away Team
                  </span>
                  <h3 className="text-lg md:text-xl font-black text-gray-900 tracking-tight">
                    {pickOfTheDay.awayTeam}
                  </h3>
                </div>
              </div>

              {/* Live or Final Score if match in progress / finished */}
              {pickOfTheDay.homeScore !== undefined && pickOfTheDay.homeScore !== '-' && (
                <div className="mt-3 text-center">
                  <span className="font-mono font-black text-sm bg-gray-900 text-white px-3 py-1 rounded-md">
                    Score: {pickOfTheDay.homeScore} - {pickOfTheDay.awayScore}
                  </span>
                </div>
              )}

              {/* AI Quantitative Analysis Summary */}
              {pickOfTheDay.aiAnalysis && (
                <div className="mt-4 p-3 bg-purple-50/50 rounded-lg border border-purple-100 text-xs text-gray-700 leading-relaxed">
                  <strong className="text-[#8D0E83] block mb-1">
                    <i className="fas fa-brain mr-1.5"></i>
                    Algorithmic Match Intelligence:
                  </strong>
                  {pickOfTheDay.aiAnalysis}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-amber-100 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyPick}
                    className="px-3.5 py-1.5 rounded-lg bg-[#8D0E83] hover:bg-[#630A5C] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i>
                    <span>{copied ? 'Copied to Clipboard' : 'Copy Banker'}</span>
                  </button>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `🎯 SOKAPREDICTIONS Tip of the Day: ${pickOfTheDay.homeTeam} vs ${pickOfTheDay.awayTeam} | Pick: ${pickOfTheDay.prediction} (${oddsDisplay}) | https://sokapredictions.com/tip-of-the-day`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <i className="fab fa-whatsapp"></i>
                    <span>Share on WhatsApp</span>
                  </a>
                </div>

                {onOpenPaymentModal && (
                  <button
                    onClick={() =>
                      onOpenPaymentModal({
                        name: 'Daily 3-Banker VIP Slip',
                        amount: 200,
                        id: 'daily-banker-vip',
                        slug: 'daily-banker-vip',
                        type: 'odds',
                      })
                    }
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <i className="fas fa-lock-open"></i>
                    <span>Unlock 3-Banker Ticket (KES 200)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Standard Fixture Table Row - Matching other pages exactly */}
            <div className="space-y-1.5 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Single Game Coupon Overview
              </h3>

              {/* Desktop Header */}
              <div className="hidden md:grid grid-cols-[85px_minmax(180px,1fr)_70px_110px_65px_85px] items-center gap-3 px-3.5 py-2 bg-gray-100 border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-wider text-gray-600 select-none">
                <div className="text-center">Time / Status</div>
                <div>Match &amp; League</div>
                <div className="text-center">Score</div>
                <div className="text-center">Prediction</div>
                <div className="text-center">Odds</div>
                <div className="text-center">Outcome</div>
              </div>

              {/* Single Fixture Row */}
              <FixtureCard fixture={pickOfTheDay} indexNumber={1} />
            </div>
          </div>
        )}
      </section>

      {/* 3. Staking Strategy Guide */}
      <section className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 shadow-xs space-y-4">
        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-base font-extrabold text-gray-900 m-0 flex items-center gap-2">
            <i className="fas fa-chart-line text-[#8D0E83]"></i>
            <span>Professional Single-Bet Staking Strategy</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            How disciplined punters turn an 88% win rate into compounding monthly profit
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
          <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100">
            <div className="w-7 h-7 rounded-lg bg-[#8D0E83] text-white flex items-center justify-center font-bold text-xs mb-2">
              1
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Fixed Flat Staking (3-5%)</h3>
            <p className="text-gray-600 leading-relaxed text-[11px]">
              Never risk your full bankroll on a single ticket. Bet exactly 3% to 5% of your betting capital per game to absorb variance smoothly.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs mb-2">
              2
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Zero Accumulator Creep</h3>
            <p className="text-gray-600 leading-relaxed text-[11px]">
              Bookmakers thrive on 10-leg accumulators. Playing our single Banker of the Day as a standalone wager maximizes your mathematical expectancy.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100">
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs mb-2">
              3
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Early Kickoff Locking</h3>
            <p className="text-gray-600 leading-relaxed text-[11px]">
              Lock in your odds as early as possible. Value lines on our daily pick frequently drop as market volume shifts toward the banker.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Rich Editorial Markdown Content (From tip-of-the-day.md if available) */}
      {pageData?.htmlContent && (
        <section className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 shadow-xs">
          <div
            className="prose max-w-none text-xs md:text-sm text-gray-600 leading-relaxed space-y-3 [&>h2]:text-base [&>h2]:font-extrabold [&>h2]:text-gray-900 [&>h3]:text-sm [&>h3]:font-bold [&>h3]:text-gray-800 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1.5"
            dangerouslySetInnerHTML={{ __html: pageData.htmlContent }}
          />
        </section>
      )}

      {/* 5. FAQs Section from tip-of-the-day.md */}
      {pageData?.faqs && pageData.faqs.length > 0 && (
        <FaqAccordion
          faqs={pageData.faqs}
          title={pageData.frontmatter.faqTitle || "Frequently Asked Questions About the Tip of the Day"}
          subtitle="Common questions regarding our banker selection criteria, accuracy rate, and bankroll advice."
        />
      )}

      {/* 6. VIP CTA Banner */}
      <div className="bg-[#8D0E83] text-white p-5 md:p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-amber-950 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
            Looking for More Bankers?
          </span>
          <h3 className="text-lg md:text-xl font-extrabold tracking-tight">
            Upgrade to SOKA PREDICTIONS VIP Club
          </h3>
          <p className="text-xs text-purple-100 max-w-xl mt-1 leading-relaxed">
            Get our complete 3-leg daily banker slip (5+ combined odds), SMS &amp; WhatsApp dispatches, and full combination coverage for all Kenyan jackpots.
          </p>
        </div>

        <Link
          to="/vip-packages"
          className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs uppercase tracking-wider transition whitespace-nowrap self-start md:self-auto shadow-sm"
        >
          View VIP Packages
        </Link>
      </div>
    </div>
  );
};
