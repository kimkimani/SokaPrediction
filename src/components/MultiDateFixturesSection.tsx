import React, { useState, useMemo } from 'react';
import { DateGroupedFixtures } from '../services/multiDateFixtureService';
import { FixtureCard } from './FixtureCard';

interface MultiDateFixturesSectionProps {
  groupedFixtures: DateGroupedFixtures[];
  title?: string;
  subtitle?: string;
}

export const MultiDateFixturesSection: React.FC<MultiDateFixturesSectionProps> = ({
  groupedFixtures,
  title = 'Verified Fixture Predictions & Results',
  subtitle,
}) => {
  // 'all' or specific dateKey
  const [selectedDateKey, setSelectedDateKey] = useState<string>('all');

  // Total matches across all groups
  const totalMatches = useMemo(() => {
    return groupedFixtures.reduce((acc, g) => acc + g.fixtures.length, 0);
  }, [groupedFixtures]);

  // Filter groups according to selected date tab
  const displayedGroups = useMemo(() => {
    return groupedFixtures.filter((group) => {
      if (selectedDateKey !== 'all' && group.dateKey !== selectedDateKey) {
        return false;
      }
      return true;
    });
  }, [groupedFixtures, selectedDateKey]);

  return (
    <section className="bg-white rounded-xl border border-gray-200/90 shadow-xs overflow-hidden mb-6">
      {/* 1. Header Bar with Title & Date Switcher (Search removed as requested) */}
      <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#8D0E83] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                <i className="fas fa-calendar-days"></i>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 m-0 leading-tight">
                {title}
              </h2>
            </div>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>

          <div className="text-xs text-gray-500 font-medium">
            <span className="font-bold text-gray-800">{totalMatches}</span> matches across {groupedFixtures.length} days
          </div>
        </div>

        {/* 2. Interactive Date Switcher Tabs (Only if multiple dates exist) */}
        {groupedFixtures.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
            <button
              onClick={() => setSelectedDateKey('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                selectedDateKey === 'all'
                  ? 'bg-[#8D0E83] text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>All Dates</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                selectedDateKey === 'all' ? 'bg-purple-900/50 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {totalMatches}
              </span>
            </button>

            {groupedFixtures.map((group) => {
              const isActive = selectedDateKey === group.dateKey;
              return (
                <button
                  key={group.dateKey}
                  onClick={() => setSelectedDateKey(group.dateKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#8D0E83] text-white shadow-xs'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{group.dateLabel}</span>
                  {group.isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  )}
                  {group.isPast && group.wonCount !== undefined && (
                    <span className={`text-[10px] px-1 rounded font-mono ${
                      isActive ? 'bg-purple-900/40 text-emerald-200' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {group.wonCount}W
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Date Grouped Fixture Lists */}
      <div className="p-3 sm:p-5 space-y-6">
        {displayedGroups.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <i className="fas fa-futbol text-3xl text-gray-300 mb-2 block"></i>
            <p className="text-sm font-semibold">No matches scheduled for this date.</p>
          </div>
        ) : (
          displayedGroups.map((group) => (
            <div key={group.dateKey} className="space-y-2.5">
              {/* Group Date Subheader */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-gray-900">
                    {group.dateLabel}
                  </span>
                  {group.isToday && (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                      Live &amp; Matchday
                    </span>
                  )}
                  {group.isTomorrow && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                      Upcoming
                    </span>
                  )}
                  {group.isPast && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
                      Verified Results
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {group.isPast && group.wonCount !== undefined && group.lostCount !== undefined && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      Hit Rate: {Math.round((group.wonCount / Math.max(1, group.wonCount + group.lostCount)) * 100)}% ({group.wonCount}/{group.wonCount + group.lostCount} Won)
                    </span>
                  )}
                  <span className="text-gray-400 font-mono text-[11px]">
                    {group.fixtures.length} matches
                  </span>
                </div>
              </div>

              {/* Match Fixture Cards */}
              <div className="space-y-1.5">
                {/* Desktop Master Table Header */}
                <div className="hidden md:grid grid-cols-[85px_minmax(180px,1fr)_70px_110px_65px_85px] items-center gap-3 px-3.5 py-2 bg-gray-100 border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-wider text-gray-600 select-none">
                  <div className="text-center">Time / Status</div>
                  <div>Match &amp; League</div>
                  <div className="text-center">Score</div>
                  <div className="text-center">Prediction</div>
                  <div className="text-center">Odds</div>
                  <div className="text-center">Outcome</div>
                </div>

                {group.fixtures.map((fixture, i) => (
                  <FixtureCard
                    key={fixture.id || `${group.dateKey}-${i}`}
                    fixture={fixture}
                    indexNumber={i + 1}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
