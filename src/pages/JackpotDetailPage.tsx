import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { JackpotItem, PredictionFixture } from '../types';
import { CheerplexApiService } from '../services/api';
import {
  MarkdownPageManager,
  resolveSectionsForJackpot,
  MarkdownPageData,
  MarkdownSection,
} from '../services/markdownManager';
import { FaqAccordion } from '../components/FaqAccordion';
import { PageNotFound } from '../components/PageNotFound';
import { ApiLoadingState } from '../components/ApiLoadingState';

interface JackpotDetailPageProps {
  jackpots: JackpotItem[];
  onOpenPaymentModal: (pkg: { name: string; amount: number; id: string; slug: string; type: string }) => void;
}

export const JackpotDetailPage: React.FC<JackpotDetailPageProps> = ({
  jackpots,
  onOpenPaymentModal,
}) => {
  const { slug } = useParams<{ slug: string }>();
  const [jackpot, setJackpot] = useState<JackpotItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<'all' | 'hedges' | 'home' | 'draw' | 'away' | 'finished'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copyToast, setCopyToast] = useState<boolean>(false);

  // Markdown Content states
  const [markdownPage, setMarkdownPage] = useState<MarkdownPageData | null>(null);
  const [resolvedOverviewHtml, setResolvedOverviewHtml] = useState<string>('');
  const [resolvedSections, setResolvedSections] = useState<MarkdownSection[]>([]);

  // 1. Fetch Jackpot and associated Markdown file
  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    const loadData = async () => {
      // Find Markdown Page
      const allPages = MarkdownPageManager.getAllPages();
      const page =
        MarkdownPageManager.getPageByPath(`/jackpots/${slug}`) ||
        allPages.find(
          (p) => p.slug === slug || p.frontmatter.jackpotId === slug
        ) ||
        null;
      setMarkdownPage(page);

      // Find Jackpot Item
      try {
        const found = await CheerplexApiService.getJackpotById(slug);
        if (found) {
          setJackpot(found);
          if (page) {
            const { overviewHtml, sections } = resolveSectionsForJackpot(page, found);
            setResolvedOverviewHtml(overviewHtml);
            setResolvedSections(sections);
          }
        } else {
          const fallback = jackpots.find((j) => j.slug === slug || j.id === slug);
          if (fallback) {
            setJackpot(fallback);
            if (page) {
              const { overviewHtml, sections } = resolveSectionsForJackpot(page, fallback);
              setResolvedOverviewHtml(overviewHtml);
              setResolvedSections(sections);
            }
          }
        }
      } catch (err) {
        console.warn('Failed loading single jackpot', err);
        const fallback = jackpots.find((j) => j.slug === slug || j.id === slug);
        if (fallback) {
          setJackpot(fallback);
          if (page) {
            const { overviewHtml, sections } = resolveSectionsForJackpot(page, fallback);
            setResolvedOverviewHtml(overviewHtml);
            setResolvedSections(sections);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug, jackpots]);

  const fixtures = useMemo(() => {
    return jackpot?.fixtures || jackpot?.games || [];
  }, [jackpot]);

  // Outcome statistics
  const homeCount = useMemo(
    () => fixtures.filter((f) => f.prediction === '1' || f.prediction === 'Home').length,
    [fixtures]
  );
  const drawCount = useMemo(
    () => fixtures.filter((f) => f.prediction === 'X' || f.prediction === 'Draw').length,
    [fixtures]
  );
  const awayCount = useMemo(
    () => fixtures.filter((f) => f.prediction === '2' || f.prediction === 'Away').length,
    [fixtures]
  );
  const dcCount = useMemo(
    () =>
      fixtures.filter((f) =>
        ['1X', 'X2', '12', 'DC12', 'DC1X', 'DCX2'].includes(f.prediction)
      ).length,
    [fixtures]
  );

  // Filtered fixtures
  const filteredFixtures = useMemo(() => {
    return fixtures.filter((f) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mHome = f.homeTeam.toLowerCase().includes(q);
        const mAway = f.awayTeam.toLowerCase().includes(q);
        const mLeague = (f.leagueName || '').toLowerCase().includes(q);
        if (!mHome && !mAway && !mLeague) return false;
      }

      // Filter chips
      if (filterType === 'hedges') {
        return ['1X', 'X2', '12', 'DC12', 'DC1X', 'DCX2'].includes(f.prediction);
      }
      if (filterType === 'home') {
        return f.prediction === '1' || f.prediction === 'Home';
      }
      if (filterType === 'draw') {
        return f.prediction === 'X' || f.prediction === 'Draw';
      }
      if (filterType === 'away') {
        return f.prediction === '2' || f.prediction === 'Away';
      }
      if (filterType === 'finished') {
        return f.status === 'FT';
      }

      return true;
    });
  }, [fixtures, filterType, searchQuery]);

  // Copy Full Coupon
  const handleCopySlip = () => {
    if (!jackpot || fixtures.length === 0) return;
    const lines = [
      `SOKAPREDICTIONS - ${jackpot.name} Predictions (${fixtures.length} Matches)`,
      `Pool: ${jackpot.estimatedPool} | Stake: ${jackpot.entryFee}`,
      '----------------------------------------',
      ...fixtures.map(
        (f, idx) =>
          `${f.position || idx + 1}. [${f.kickoffTime}] ${f.homeTeam} vs ${f.awayTeam} -> PICK: ${f.prediction}`
      ),
      '----------------------------------------',
      'Get all 3 hedged combinations on https://www.sokapredictions.com/jackpot-predictions',
    ];
    navigator.clipboard?.writeText(lines.join('\n'));
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2500);
  };

  // Extract Sections by category
  const scheduleSection = resolvedSections.find((s) => s.tag === 'schedule');
  const hedgesSection = resolvedSections.find((s) => s.tag === 'hedges');
  const bonusesSection = resolvedSections.find((s) => s.tag === 'bonuses');
  const faqSections = resolvedSections.filter((s) => s.tag === 'faq');
  const otherSections = resolvedSections.filter(
    (s) =>
      s.tag !== 'schedule' &&
      s.tag !== 'hedges' &&
      s.tag !== 'bonuses' &&
      s.tag !== 'faq'
  );

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 my-4">
        <ApiLoadingState
          title={`Loading ${slug} coupon and match predictions...`}
          subtitle="Loading match schedule and verified odds from API"
        />
      </div>
    );
  }

  if (!markdownPage) {
    return <PageNotFound path={`/jackpots/${slug}`} />;
  }

  if (!jackpot) {
    return (
      <div className="py-12 text-center bg-gray-50 rounded-2xl border border-gray-200 p-8 my-6">
        <i className="fas fa-exclamation-circle text-4xl text-amber-500 mb-3 block"></i>
        <h2 className="text-lg font-bold text-gray-800 mb-2">Jackpot Not Found</h2>
        <p className="text-xs text-gray-500 mb-4">
          The requested jackpot coupon &quot;{slug}&quot; could not be retrieved. Please check back shortly.
        </p>
        <Link
          to="/jackpot-predictions"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#8D0E83] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-[#630A5C] transition"
        >
          <i className="fas fa-arrow-left"></i>
          <span>View All Active Jackpots</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-2 space-y-6">
      {/* Toast Notification for Copying Slip (Calm, no bounce animation) */}
      {copyToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-gray-700">
          <i className="fas fa-check-circle text-emerald-400 text-sm"></i>
          <span>Jackpot slip copied! Ready to paste into bookmaker coupon.</span>
        </div>
      )}

      {/* 1. Main Jackpot Page Top Header: Title / Intro / Buttons Section */}
      <div className="bg-white border border-gray-200/90 rounded-xl p-5 md:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-bold bg-purple-50 text-[#8D0E83] border border-purple-100 mb-2.5">
              <i className="fas fa-trophy text-amber-500"></i>
              <span>{jackpot.gamesCount || fixtures.length}-Match Coupon Preview</span>
            </div>

            <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
              {markdownPage?.frontmatter.displayTitle || `${jackpot.name} Predictions & Analysis`}
            </h1>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-normal mb-3">
              {markdownPage?.frontmatter.introParagraph ||
                `Full ${fixtures.length}-game coupon breakdown with verified 1X2 probability ratings, form indicators, and double-chance hedging strategies. Kickoff schedules calibrated to East Africa Time (EAT).`}
            </p>

            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-gray-600">
              <span className="inline-flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded text-gray-700">
                <i className="fas fa-coins text-amber-600"></i>
                Pool: {jackpot.estimatedPool}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded text-gray-700">
                <i className="fas fa-ticket-alt text-emerald-600"></i>
                Stake: {jackpot.entryFee || 'KES 99'}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded text-gray-700">
                <i className="fas fa-clock text-blue-600"></i>
                {jackpot.nextGameStartTime || 'Weekend Kickoff: 16:30 EAT'}
              </span>
            </div>
          </div>

          {/* Quick Metrics & Unlock CTA */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[240px]">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center">
              <span className="text-[10px] uppercase font-bold text-gray-500 block">
                Estimated Cash Pool
              </span>
              <strong className="text-xl font-extrabold text-[#8D0E83] tracking-tight">
                {jackpot.estimatedPool}
              </strong>
            </div>

            <button
              onClick={() =>
                onOpenPaymentModal({
                  name: `${jackpot.name} 3 Hedged Slips`,
                  amount: jackpot.price || 150,
                  id: jackpot.id,
                  slug: jackpot.slug,
                  type: 'jackpot',
                })
              }
              className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="fas fa-lock-open text-xs"></i>
              <span>Get 3 Slips (KES {jackpot.price || 150})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. THE FIXTURES TABLE COMES FIRST BEFORE SEO SECTION (Directly below Title/Intro/Button Section) */}
      <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Table & Coupon Header with Controls */}
        <div className="p-4 md:p-5 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base md:text-lg font-black text-gray-900 flex items-center gap-2 m-0">
              <i className="fas fa-list-ol text-[#8D0E83]"></i>
              <span>{jackpot.name} Match Coupon</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Showing {filteredFixtures.length} of {fixtures.length} matches • Kickoff in East Africa Time (EAT)
            </p>
          </div>

          {/* Action buttons: Copy Slip & Unlock */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySlip}
              className="px-3.5 py-1.5 rounded-lg bg-white border border-gray-300 hover:border-[#8D0E83] text-gray-700 hover:text-[#8D0E83] text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Copy all matches and picks to clipboard"
            >
              <i className="fas fa-copy text-xs"></i>
              <span>Copy Slip</span>
            </button>
            <button
              onClick={() =>
                onOpenPaymentModal({
                  name: jackpot.name,
                  amount: jackpot.price || 150,
                  id: jackpot.id,
                  slug: jackpot.slug,
                  type: 'jackpot',
                })
              }
              className="px-3.5 py-1.5 rounded-lg bg-[#8D0E83] hover:bg-[#630A5C] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <i className="fas fa-lock-open text-xs"></i>
              <span>Unlock 3 Combinations</span>
            </button>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="p-3 md:px-5 bg-gray-50/70 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-full font-bold transition cursor-pointer ${
                filterType === 'all'
                  ? 'bg-[#8D0E83] text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              All ({fixtures.length})
            </button>
            <button
              onClick={() => setFilterType('hedges')}
              className={`px-3 py-1 rounded-full font-bold transition cursor-pointer ${
                filterType === 'hedges'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-amber-800 hover:bg-amber-50'
              }`}
            >
              Hedges ({dcCount})
            </button>
            <button
              onClick={() => setFilterType('home')}
              className={`px-2.5 py-1 rounded-full font-semibold transition cursor-pointer ${
                filterType === 'home'
                  ? 'bg-purple-100 text-[#8D0E83] border border-[#8D0E83]'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Home ({homeCount})
            </button>
            <button
              onClick={() => setFilterType('draw')}
              className={`px-2.5 py-1 rounded-full font-semibold transition cursor-pointer ${
                filterType === 'draw'
                  ? 'bg-purple-100 text-[#8D0E83] border border-[#8D0E83]'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Draw ({drawCount})
            </button>
            <button
              onClick={() => setFilterType('away')}
              className={`px-2.5 py-1 rounded-full font-semibold transition cursor-pointer ${
                filterType === 'away'
                  ? 'bg-purple-100 text-[#8D0E83] border border-[#8D0E83]'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Away ({awayCount})
            </button>
            {fixtures.some((f) => f.status === 'FT') && (
              <button
                onClick={() => setFilterType('finished')}
                className={`px-2.5 py-1 rounded-full font-semibold transition cursor-pointer ${
                  filterType === 'finished'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Finished ({fixtures.filter((f) => f.status === 'FT').length})
              </button>
            )}
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-48">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team or league..."
              className="w-full bg-white border border-gray-200 rounded-lg pl-7 pr-3 py-1 text-xs focus:outline-none focus:border-[#8D0E83]"
            />
            <i className="fas fa-search absolute left-2.5 top-2 text-gray-400 text-[10px]"></i>
          </div>
        </div>

        {/* NEAT JACKPOT FIXTURES UI (Matching high-clarity layout like Homepage FixtureCard) */}
        <div className="p-3 sm:p-5 space-y-2">
          {/* Master Table Header Row for Desktop (md+) */}
          <div className="hidden md:grid grid-cols-[50px_90px_minmax(180px,1fr)_75px_100px_85px] items-center gap-3 px-3.5 py-2 bg-gray-100 border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-wider text-gray-600 select-none">
            <div className="text-center">#</div>
            <div className="text-center">Time / Status</div>
            <div>Match &amp; League</div>
            <div className="text-center">Score</div>
            <div className="text-center">Tip / Hedge</div>
            <div className="text-center">Win Prob.</div>
          </div>

          {filteredFixtures.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <i className="fas fa-filter text-2xl text-gray-300 mb-2 block"></i>
              <p className="text-xs font-semibold">No matches matching this filter.</p>
            </div>
          ) : (
            filteredFixtures.map((f, idx) => {
              const isDC = ['1X', 'X2', '12', 'DC12', 'DC1X', 'DCX2'].includes(f.prediction);
              const pos = f.position || idx + 1;
              const statusRaw = (f.status || 'NS').toUpperCase();
              const confidenceNum = typeof f.confidence === 'number' ? f.confidence : 78;

              return (
                <div
                  key={f.id || idx}
                  className={`border border-gray-200/90 rounded-lg overflow-hidden transition-all bg-white hover:border-[#8D0E83] hover:shadow-xs ${
                    isDC ? 'border-l-4 border-l-amber-500 bg-amber-50/15' : 'border-l-4 border-l-[#8D0E83]'
                  }`}
                >
                  {/* 1. DESKTOP VIEW: High-Clarity Table Row (md+) */}
                  <div className="hidden md:grid grid-cols-[50px_90px_minmax(180px,1fr)_75px_100px_85px] items-center gap-3 px-3.5 py-2.5">
                    {/* Index Column */}
                    <div className="text-center">
                      <span className="w-6 h-6 rounded-full bg-[#8D0E83] text-white inline-flex items-center justify-center font-black text-xs shadow-2xs">
                        {pos}
                      </span>
                    </div>

                    {/* Kickoff & Status (No pulsing) */}
                    <div className="flex flex-col items-center justify-center text-center">
                      <span className="font-mono text-xs font-black text-gray-900 tracking-tight leading-none">
                        {f.kickoffTime}
                      </span>
                      <span
                        className={`mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          statusRaw === 'FT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : statusRaw === 'LIVE'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {statusRaw}
                      </span>
                    </div>

                    {/* League & Teams */}
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-0.5 truncate">
                        {f.countryFlag && (
                          <img
                            src={f.countryFlag}
                            alt=""
                            className="w-3.5 h-2.5 object-cover rounded-2xs flex-shrink-0 border border-gray-200"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        )}
                        <span className="font-semibold text-gray-600 truncate">
                          {f.leagueName || 'League Match'}
                        </span>
                        {f.leagueCountry && (
                          <span className="text-gray-400">({f.leagueCountry})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 font-bold text-xs text-gray-900 truncate">
                        <span className="truncate">{f.homeTeam}</span>
                        <span className="text-gray-400 font-normal text-[11px] flex-shrink-0">vs</span>
                        <span className="truncate text-gray-800">{f.awayTeam}</span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="flex items-center justify-center">
                      {f.homeScore !== undefined && f.homeScore !== '-' && f.homeScore !== null ? (
                        <div className="font-mono text-xs font-black text-gray-900 bg-gray-100/80 border border-gray-200 px-2 py-0.5 rounded text-center whitespace-nowrap">
                          {f.homeScore} - {f.awayScore}
                        </div>
                      ) : (
                        <span className="text-xs font-mono font-bold text-gray-400 text-center">-</span>
                      )}
                    </div>

                    {/* Tip / Hedge Badge */}
                    <div className="flex items-center justify-center">
                      <div className="inline-flex flex-col items-center">
                        <span
                          className={`text-xs font-black py-1 px-3 rounded-md min-w-[55px] text-center shadow-2xs ${
                            isDC ? 'bg-amber-500 text-white' : 'bg-[#8D0E83] text-white'
                          }`}
                        >
                          {f.prediction || '1'}
                        </span>
                        {isDC && (
                          <span className="text-[9px] font-bold text-amber-700 uppercase tracking-tighter mt-0.5">
                            Hedge
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Confidence / Probability */}
                    <div className="flex items-center justify-center">
                      <span className="text-[10px] font-bold text-[#8D0E83] bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                        {confidenceNum}% Win
                      </span>
                    </div>
                  </div>

                  {/* 2. MOBILE VIEW: Neat Card Layout (< md) */}
                  <div className="md:hidden p-3 space-y-2">
                    {/* Header: Index, League, Kickoff Time, Status */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#8D0E83] text-white inline-flex items-center justify-center font-black text-[10px]">
                          {pos}
                        </span>
                        {f.countryFlag && (
                          <img
                            src={f.countryFlag}
                            alt=""
                            className="w-3.5 h-2.5 object-cover rounded-2xs border border-gray-200"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        )}
                        <span className="font-bold text-gray-700 text-[11px] truncate max-w-[130px]">
                          {f.leagueName || 'League Match'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                        <i className="fas fa-clock text-gray-400 text-[10px]"></i>
                        <span>{f.kickoffTime}</span>
                        <span
                          className={`text-[9px] font-bold px-1 rounded uppercase ${
                            statusRaw === 'FT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : statusRaw === 'LIVE'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {statusRaw}
                        </span>
                      </div>
                    </div>

                    {/* Teams, Score & Tip */}
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <div className="flex-1 min-w-0">
                        <div className="font-extrabold text-gray-900 text-xs truncate">
                          {f.homeTeam}
                        </div>
                        <div className="font-extrabold text-gray-800 text-xs truncate">
                          {f.awayTeam}
                        </div>
                      </div>

                      {f.homeScore !== undefined && f.homeScore !== '-' && f.homeScore !== null && (
                        <div className="font-mono font-black text-xs bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                          {f.homeScore} - {f.awayScore}
                        </div>
                      )}

                      <div className="flex flex-col items-end flex-shrink-0">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-black shadow-2xs inline-block min-w-[42px] text-center ${
                            isDC ? 'bg-amber-500 text-white' : 'bg-[#8D0E83] text-white'
                          }`}
                        >
                          {f.prediction || '1'}
                        </span>
                        {isDC && (
                          <span className="text-[9px] font-bold text-amber-700 uppercase tracking-tighter mt-0.5">
                            Hedge
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Jackpot Slip CTA */}
        <div className="p-5 md:p-6 bg-gray-50 border-t border-gray-200 text-center">
          <h3 className="text-sm md:text-base font-black text-gray-900 mb-1.5">
            Want All 3 Optimized Hedged Combinations for {jackpot.name}?
          </h3>
          <p className="text-xs text-gray-500 max-w-xl mx-auto mb-3.5 leading-relaxed">
            Get our complete 3-slip accumulator package with double-chance protection. Delivered instantly to your phone via SMS &amp; WhatsApp upon M-Pesa confirmation.
          </p>
          <button
            onClick={() =>
              onOpenPaymentModal({
                name: `${jackpot.name} 3 Combinations`,
                amount: jackpot.price || 150,
                id: jackpot.id,
                slug: jackpot.slug,
                type: 'jackpot',
              })
            }
            className="px-6 py-2.5 rounded-xl bg-[#8D0E83] hover:bg-[#630A5C] text-white font-black text-xs uppercase tracking-wider transition shadow-md inline-flex items-center gap-2 cursor-pointer"
          >
            <i className="fas fa-lock-open"></i>
            <span>Unlock All 3 Combinations (KES {jackpot.price || 150})</span>
          </button>
        </div>
      </section>

      {/* 3. SEO & EDITORIAL SECTIONS (Placed directly AFTER the Fixtures table) */}
      {(scheduleSection || resolvedOverviewHtml) && (
        <section className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
            <h2 className="text-sm md:text-base font-black text-gray-900 m-0 flex items-center gap-2">
              <i className="fas fa-calendar-alt text-[#8D0E83]"></i>
              <span>{scheduleSection?.title || 'Key Jackpot Schedule & Timing'}</span>
            </h2>
            <span className="text-xs font-mono font-bold text-gray-500 flex items-center gap-1.5">
              <i className="fas fa-clock text-amber-500"></i>
              <span>{jackpot.nextGameStartTime || 'Weekend: 16:30 EAT'}</span>
            </span>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-center">
              <span className="text-[10px] uppercase font-bold text-gray-500 block">Home Wins</span>
              <strong className="text-base font-black text-[#8D0E83]">{homeCount}</strong>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center">
              <span className="text-[10px] uppercase font-bold text-gray-500 block">Draws</span>
              <strong className="text-base font-black text-gray-800">{drawCount}</strong>
            </div>
            <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-center">
              <span className="text-[10px] uppercase font-bold text-gray-500 block">Away Wins</span>
              <strong className="text-base font-black text-[#8D0E83]">{awayCount}</strong>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-800 block">Hedges</span>
              <strong className="text-base font-black text-amber-900">{dcCount}</strong>
            </div>
          </div>

          {/* Markdown schedule text or overview text */}
          <div
            className="prose max-w-none text-xs md:text-sm text-gray-600 leading-relaxed space-y-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1 [&>p]:leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: scheduleSection?.htmlContent || resolvedOverviewHtml,
            }}
          />
        </section>
      )}

      {/* Upset Alerts & Double-Chance Hedge Notice (From Markdown) */}
      {hedgesSection && (
        <section className="bg-amber-50/70 border border-amber-300 rounded-2xl p-5 md:p-6 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg font-black flex-shrink-0 shadow-xs">
              <i className="fas fa-shield-alt"></i>
            </div>
            <div className="flex-1">
              <h2 className="text-base font-black text-amber-950 mb-1">
                {hedgesSection.title}
              </h2>
              <div
                className="prose max-w-none text-xs md:text-sm text-amber-900/90 leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1"
                dangerouslySetInnerHTML={{ __html: hedgesSection.htmlContent }}
              />
            </div>
          </div>
        </section>
      )}

      {/* How to Qualify for Cash Bonuses & Tier Payouts (From Markdown) */}
      {bonusesSection && (
        <section className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 shadow-xs">
          <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              <i className="fas fa-coins"></i>
            </div>
            <h2 className="text-base font-black text-gray-900 m-0">
              {bonusesSection.title}
            </h2>
          </div>
          <div
            className="prose max-w-none text-xs md:text-sm text-gray-700 leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-1"
            dangerouslySetInnerHTML={{ __html: bonusesSection.htmlContent }}
          />
        </section>
      )}

      {/* Additional Strategic Sections (From Markdown) */}
      {otherSections.map((sec) => (
        <section
          key={sec.id}
          className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 shadow-xs"
        >
          <h2 className="text-base font-black text-gray-900 mb-2 border-b pb-2 border-gray-100">
            {sec.title}
          </h2>
          <div
            className="prose max-w-none text-xs md:text-sm text-gray-700 leading-relaxed space-y-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1"
            dangerouslySetInnerHTML={{ __html: sec.htmlContent }}
          />
        </section>
      ))}

      {/* FAQs from respective jackpot markdown file */}
      {((markdownPage?.faqs && markdownPage.faqs.length > 0) || faqSections.length > 0) && (
        <FaqAccordion
          faqs={
            markdownPage?.faqs && markdownPage.faqs.length > 0
              ? markdownPage.faqs
              : faqSections.flatMap((f) => f.faqs || [])
          }
          title={markdownPage?.frontmatter.faqTitle || markdownPage?.faqTitle || faqSections[0]?.title || `${jackpot.name} - Frequently Asked Questions (FAQ)`}
          subtitle={markdownPage?.frontmatter.faqSubtitle || markdownPage?.faqSubtitle}
        />
      )}

      {/* Switch to Other Active Kenyan Jackpots Footer Links */}
      <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Explore Other Active Kenyan Jackpots
        </h4>
        <div className="flex flex-wrap gap-2">
          {jackpots
            .filter((j) => j.slug !== jackpot.slug)
            .map((other) => (
              <Link
                key={other.id || other.slug}
                to={`/jackpots/${other.slug || other.id}`}
                className="px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-[#8D0E83] text-xs font-bold text-gray-800 hover:text-[#8D0E83] transition flex items-center gap-2 shadow-2xs"
              >
                <i className="fas fa-trophy text-amber-500 text-[10px]"></i>
                <span>{other.name}</span>
                <span className="text-[10px] text-gray-400">({other.gamesCount} games)</span>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
};
