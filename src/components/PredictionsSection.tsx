import React, { useState, useMemo } from 'react';
import { PredictionFixture } from '../types';
import { FixtureCard } from './FixtureCard';
import { ApiLoadingState } from './ApiLoadingState';

interface PredictionsSectionProps {
  fixtures: PredictionFixture[];
  loading: boolean;
  dateFilter: 'yesterday' | 'today' | 'tomorrow';
  setDateFilter: (filter: 'yesterday' | 'today' | 'tomorrow') => void;
  categoryFilter: string;
  setCategoryFilter: (cat: string) => void;
  onRefresh?: () => void;
  title?: string;
  subtitle?: string;
}

export const PredictionsSection: React.FC<PredictionsSectionProps> = ({
  fixtures,
  loading,
  dateFilter,
  setDateFilter,
  categoryFilter,
  setCategoryFilter,
  title = 'Football Match Predictions & Tips',
  subtitle,
}) => {
  const [selectedLeague, setSelectedLeague] = useState('all');

  // Extract unique leagues for quick filtering dropdown
  const uniqueLeagues = useMemo(() => {
    const leagues = new Set<string>();
    fixtures.forEach((f) => {
      if (f.leagueName) leagues.add(f.leagueName);
    });
    return Array.from(leagues).sort();
  }, [fixtures]);

  // Filter fixtures by market category and league (Search input removed as requested)
  const filteredFixtures = useMemo(() => {
    return fixtures.filter((f) => {
      // 1. League filter
      if (selectedLeague !== 'all' && f.leagueName !== selectedLeague) {
        return false;
      }

      // 2. Market/category filter
      if (categoryFilter === 'over15') {
        const pred = (f.prediction || '').toLowerCase();
        if (!pred.includes('over 1.5') && !pred.includes('ov 1.5') && !pred.includes('1.5')) return false;
      } else if (categoryFilter === 'over25') {
        const pred = (f.prediction || '').toLowerCase();
        if (!pred.includes('over 2.5') && !pred.includes('ov 2.5') && !pred.includes('2.5')) return false;
      } else if (categoryFilter === 'btts') {
        const pred = (f.prediction || '').toLowerCase();
        if (!pred.includes('gg') && !pred.includes('btts') && !pred.includes('yes')) return false;
      } else if (categoryFilter === 'doublechance') {
        const pred = (f.prediction || '').toLowerCase();
        if (!pred.includes('1x') && !pred.includes('x2') && !pred.includes('12') && !pred.includes('dc')) return false;
      } else if (categoryFilter === 'vip') {
        const conf = typeof f.confidence === 'number' ? f.confidence : parseInt(String(f.confidence || 70), 10);
        if (conf < 80) return false;
      }

      return true;
    });
  }, [fixtures, selectedLeague, categoryFilter]);

  return (
    <section id="predictions" className="prediction-section mb-6 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
      {/* 1. Header Bar: Date Switcher & League Selector */}
      <div className="p-3.5 sm:p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#8D0E83] text-white flex items-center justify-center font-black shadow-xs">
              <i className="fas fa-futbol text-sm"></i>
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-gray-900 tracking-tight leading-snug">
                {title}
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium">
                <span className="flex items-center gap-1 text-emerald-700 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Live Matchday
                </span>
                <span>•</span>
                <span>{filteredFixtures.length} Matches Found</span>
                {subtitle && (
                  <>
                    <span className="hidden md:inline">•</span>
                    <span className="hidden md:inline text-gray-400">{subtitle}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Date Segmented Control */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl self-start sm:self-auto border border-gray-200/80">
            <button
              onClick={() => setDateFilter('yesterday')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                dateFilter === 'yesterday'
                  ? 'bg-white text-[#8D0E83] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="fas fa-history text-[11px]"></i>
              <span>Yesterday</span>
            </button>
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                dateFilter === 'today'
                  ? 'bg-[#8D0E83] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Today</span>
            </button>
            <button
              onClick={() => setDateFilter('tomorrow')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                dateFilter === 'tomorrow'
                  ? 'bg-white text-[#8D0E83] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="fas fa-calendar-plus text-[11px]"></i>
              <span>Tomorrow</span>
            </button>
          </div>
        </div>

        {/* 2. Fast Market Filter Strip + League Selector (Search and Sync removed) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
          {/* Market Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Markets', icon: 'fa-globe' },
              { id: 'vip', label: '80%+ Banker', icon: 'fa-fire text-amber-500' },
              { id: 'over15', label: 'Over 1.5 Goals', icon: 'fa-futbol text-emerald-600' },
              { id: 'over25', label: 'Over 2.5 Goals', icon: 'fa-bullseye text-purple-600' },
              { id: 'btts', label: 'BTTS / GG', icon: 'fa-exchange-alt text-cyan-600' },
              { id: 'doublechance', label: 'Double Chance', icon: 'fa-shield-alt text-blue-600' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
                  categoryFilter === cat.id
                    ? 'bg-[#8D0E83] text-white shadow-xs'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <i className={`fas ${cat.icon} text-[10px]`}></i>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* League Dropdown Filter */}
          {uniqueLeagues.length > 0 && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <select
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                className="text-xs font-semibold px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-[#8D0E83] cursor-pointer"
              >
                <option value="all">All Competitions ({uniqueLeagues.length})</option>
                {uniqueLeagues.map((lg) => (
                  <option key={lg} value={lg}>
                    {lg}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 3. Match List Feed */}
      <div className="p-3 sm:p-4 bg-gray-50/30">
        {loading ? (
          <ApiLoadingState
            title="Loading verified match predictions..."
            subtitle={`Retrieving ${dateFilter} odds and statistical form picks`}
          />
        ) : filteredFixtures.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-500 text-xs">
            <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-2 text-base">
              <i className="fas fa-futbol"></i>
            </div>
            <p className="font-bold text-gray-800 text-sm">No matches found for selected criteria</p>
            <p className="text-gray-400 text-[11px] mt-1">
              Try switching between Yesterday, Today, or Tomorrow, or resetting the competition filter.
            </p>
            <button
              onClick={() => {
                setCategoryFilter('all');
                setSelectedLeague('all');
              }}
              className="mt-3 px-3 py-1.5 bg-[#8D0E83] text-white rounded-lg text-xs font-bold hover:bg-[#630A5C] transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
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

            {filteredFixtures.map((fixture, idx) => (
              <FixtureCard
                key={fixture.id || idx}
                fixture={fixture}
                indexNumber={idx + 1}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
