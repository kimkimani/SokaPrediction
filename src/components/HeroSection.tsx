import React from 'react';
import { Link } from 'react-router-dom';
import { MarkdownPageManager } from '../services/markdownManager';

interface HeroSectionProps {
  onScrollToPredictions: () => void;
  onOpenVipModal: () => void;
  title?: string;
  introParagraph?: string;
  badgeText?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onScrollToPredictions,
  onOpenVipModal,
  title = 'Soka Predictions & Football Betting Tips',
  introParagraph = 'Get verified match predictions, 1X2 market breakdowns, Over/Under 2.5 goals, and BTTS (Both Teams To Score) tips updated daily by 08:30 EAT. All selections are cross-referenced with team news, league standings, and recent form across the English Premier League, UEFA Champions League, La Liga, Serie A, and African leagues.',
  badgeText = "Today's Verified Kenya Football Predictions & Jackpots",
}) => {
  return (
    <section className="hero bg-white border border-gray-200/90 rounded-xl p-5 md:p-6 mb-5 shadow-xs">
      <div className="max-w-4xl">
        {/* Category kicker */}
        <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 text-[#8D0E83] px-2.5 py-1 rounded-md text-xs font-bold mb-3">
          <img
            src="/assets/brand-emblem.png"
            alt=""
            className="w-4 h-4 rounded object-contain flex-shrink-0"
          />
          <span>{badgeText}</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight mb-2.5">
          {title}
        </h1>

        {/* Introductory paragraph */}
        <p className="text-xs md:text-sm text-gray-600 leading-relaxed mb-4 max-w-3xl">
          {introParagraph}
        </p>

        {/* Key Info Strip (Hidden on mobile as requested) */}
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

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onScrollToPredictions}
            className="px-4 py-2 rounded-lg bg-[#8D0E83] hover:bg-[#6e0a66] text-white text-xs font-bold shadow-xs transition flex items-center gap-2 cursor-pointer"
          >
            <i className="fas fa-list-check"></i>
            <span>View Free Match Predictions</span>
          </button>

          <button
            onClick={onOpenVipModal}
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
    </section>
  );
};
