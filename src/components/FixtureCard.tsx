import React from 'react';
import { PredictionFixture } from '../types';

interface FixtureCardProps {
  fixture: PredictionFixture;
  indexNumber?: number;
}

export const FixtureCard: React.FC<FixtureCardProps> = ({
  fixture,
  indexNumber,
}) => {
  // Format kickoff time in East Africa Time (EAT)
  const formatTimeOnly = (dateStr: string) => {
    if (!dateStr) return '16:00';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        // If string like "2025-09-14 13:00:00"
        const parts = dateStr.split(' ');
        if (parts.length > 1 && parts[1]) {
          return parts[1].substring(0, 5);
        }
        return dateStr;
      }
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return '16:00';
    }
  };

  const statusRaw = (fixture.status || 'NS').toUpperCase();
  const statusLower = statusRaw.toLowerCase();
  const resultLower = (fixture.result || 'pending').toLowerCase();

  // Safe scores
  const hasScores =
    fixture.homeScore !== null &&
    fixture.homeScore !== undefined &&
    fixture.homeScore !== '' &&
    fixture.homeScore !== '-' &&
    fixture.awayScore !== null &&
    fixture.awayScore !== undefined &&
    fixture.awayScore !== '' &&
    fixture.awayScore !== '-';

  const homeScoreStr = hasScores ? String(fixture.homeScore) : '-';
  const awayScoreStr = hasScores ? String(fixture.awayScore) : '-';

  // Fallback odds based on confidence if omitted by API
  const displayOdds = fixture.odds || (() => {
    const conf = typeof fixture.confidence === 'number' ? fixture.confidence : 75;
    if (conf >= 85) return '1.38';
    if (conf >= 80) return '1.55';
    if (conf >= 75) return '1.78';
    if (conf >= 70) return '1.95';
    return '2.10';
  })();

  const confidenceNum = typeof fixture.confidence === 'number' ? fixture.confidence : 78;

  return (
    <div
      className={`fixture-card ${resultLower} border border-gray-200/90 rounded-lg overflow-hidden transition-all bg-white hover:border-[#8D0E83] hover:shadow-xs`}
    >
      {/* 1. Desktop & Tablet Strictly Aligned Table Row (md+) */}
      <div className="hidden md:grid grid-cols-[85px_minmax(180px,1fr)_70px_110px_65px_85px] items-center gap-3 px-3.5 py-2.5">
        {/* Col 1: Time & Status */}
        <div className="flex flex-col items-center justify-center text-center">
          <span className="font-mono text-xs font-black text-gray-900 tracking-tight leading-none">
            {formatTimeOnly(fixture.kickoffTime)}
          </span>
          <span
            className={`match-status-badge ${statusLower} mt-1 text-[10px] font-bold px-1.5 py-0.2 rounded`}
          >
            {statusRaw}
          </span>
        </div>

        {/* Col 2: Match & League */}
        <div className="min-w-0 pr-2">
          {/* League subline */}
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-0.5 truncate">
            {indexNumber !== undefined && (
              <span className="w-4 h-4 rounded bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-[9px] flex-shrink-0">
                {indexNumber}
              </span>
            )}
            {fixture.countryFlag && (
              <img
                src={fixture.countryFlag}
                alt=""
                className="w-3.5 h-2.5 object-cover rounded-2xs flex-shrink-0 border border-gray-200"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            )}
            <span className="font-semibold text-gray-600 truncate">
              {fixture.leagueName || 'Premier League'}
            </span>
            {fixture.leagueCountry && (
              <span className="text-gray-400">({fixture.leagueCountry})</span>
            )}
          </div>

          {/* Teams */}
          <div className="flex items-center gap-2 font-bold text-xs text-gray-900 truncate">
            <span className="truncate">{fixture.homeTeam}</span>
            <span className="text-gray-400 font-normal text-[11px] flex-shrink-0">vs</span>
            <span className="truncate text-gray-800">{fixture.awayTeam}</span>
          </div>
        </div>

        {/* Col 3: Score (Strictly centered) */}
        <div className="flex items-center justify-center">
          {hasScores ? (
            <div className="font-mono text-xs font-black text-gray-900 bg-gray-100/80 border border-gray-200 px-2 py-0.5 rounded text-center whitespace-nowrap">
              {homeScoreStr} - {awayScoreStr}
            </div>
          ) : (
            <span className="text-xs font-mono font-bold text-gray-400 text-center">-</span>
          )}
        </div>

        {/* Col 4: Prediction Tip Badge (Strictly centered) */}
        <div className="flex items-center justify-center">
          <div
            className={`tip-badge ${resultLower} text-xs font-black py-1 px-2.5 rounded-md min-w-[75px] text-center shadow-2xs`}
            title={`Algorithmic Pick: ${fixture.prediction}`}
          >
            {fixture.prediction}
          </div>
        </div>

        {/* Col 5: Odds (Strictly centered) */}
        <div className="text-center">
          <span className="font-mono text-xs font-bold text-gray-800 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
            {displayOdds}
          </span>
        </div>

        {/* Col 6: Outcome / Confidence (Strictly centered) */}
        <div className="flex items-center justify-center">
          {resultLower === 'won' ? (
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded uppercase flex items-center gap-1">
              <i className="fas fa-check text-[9px]"></i>
              <span>WON</span>
            </span>
          ) : resultLower === 'lost' ? (
            <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded uppercase flex items-center gap-1">
              <i className="fas fa-times text-[9px]"></i>
              <span>LOST</span>
            </span>
          ) : (
            <span className="text-[10px] font-bold text-[#8D0E83] bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
              {confidenceNum}% Win
            </span>
          )}
        </div>
      </div>

      {/* 2. Mobile Responsive Compact Row (< md) */}
      <div className="md:hidden p-3 flex items-center justify-between gap-2.5">
        {/* Left: Time & Status */}
        <div className="flex flex-col items-center justify-center w-[65px] flex-shrink-0 text-center">
          <span className="font-mono text-xs font-black text-gray-900 leading-none">
            {formatTimeOnly(fixture.kickoffTime)}
          </span>
          <span className={`match-status-badge ${statusLower} mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded`}>
            {statusRaw}
          </span>
        </div>

        {/* Center: Teams & Score */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="text-[10px] text-gray-500 font-medium truncate mb-0.5">
            {fixture.leagueName || 'League Match'}
          </div>
          <div className="flex items-center justify-between gap-1 text-xs">
            <span className="font-bold text-gray-900 truncate">{fixture.homeTeam}</span>
            {hasScores && (
              <span className="font-mono font-black text-gray-900 ml-1">{homeScoreStr}</span>
            )}
          </div>
          <div className="flex items-center justify-between gap-1 text-xs mt-0.5">
            <span className="font-bold text-gray-800 truncate">{fixture.awayTeam}</span>
            {hasScores && (
              <span className="font-mono font-black text-gray-900 ml-1">{awayScoreStr}</span>
            )}
          </div>
        </div>

        {/* Right: Tip & Odds */}
        <div className="flex flex-col items-end justify-center flex-shrink-0 w-[85px]">
          <div className={`tip-badge ${resultLower} text-xs font-black py-1 px-2 rounded-md min-w-[65px] text-center`}>
            {fixture.prediction}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[10px]">
            <span className="text-gray-400">Odds:</span>
            <span className="font-mono font-bold text-gray-800">{displayOdds}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
