import React from 'react';
import { JackpotItem } from '../types';

interface JackpotsViewProps {
  jackpots: JackpotItem[];
  onOpenJackpotDetail: (jackpot: JackpotItem) => void;
  onOpenPaymentModal: (pkg: { name: string; amount: number; id: string; slug: string; type: string }) => void;
}

export const JackpotsView: React.FC<JackpotsViewProps> = ({
  jackpots,
  onOpenJackpotDetail,
  onOpenPaymentModal,
}) => {
  return (
    <div className="py-4">
      <div className="mb-6 bg-[#8D0E83] text-white p-6 rounded-2xl shadow-md">
        <span className="inline-block text-[10px] uppercase font-bold tracking-widest bg-amber-400 text-amber-950 px-2.5 py-0.5 rounded-full mb-2">
          Kenya Top Jackpots
        </span>
        <h1 className="text-2xl md:text-3xl font-black m-0 mb-2">
          Kenyan Football Jackpot Predictions
        </h1>
        <p className="text-xs md:text-sm text-purple-100 max-w-2xl leading-relaxed">
          Comprehensive match-by-match algorithmic coupons with double-chance variance hedging. Covering SportPesa Mega Jackpot (17), Betika Midweek (15), and Mozzart Super Grand (20).
        </p>
      </div>

      <div className="space-y-6">
        {jackpots.map((jp) => {
          const fixtures = jp.fixtures || jp.games || [];
          return (
            <div
              key={jp.id || jp.slug}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <div className="p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-gray-50/60">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#8D0E83] text-white flex items-center justify-center text-xl font-black">
                    <i className="fas fa-trophy"></i>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 m-0">{jp.name}</h2>
                    <div className="text-xs text-gray-500 mt-0.5 flex flex-wrap items-center gap-2">
                      <span>{jp.gamesCount} Fixtures</span>
                      <span>•</span>
                      <span>
                        Pool: <strong className="text-emerald-700 font-bold">{jp.estimatedPool}</strong>
                      </span>
                      <span>•</span>
                      <span className="text-[#8D0E83] font-semibold">{jp.nextGameStartTime}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenJackpotDetail(jp)}
                    className="px-3 py-2 border border-purple-200 bg-purple-50 hover:bg-purple-100 text-[#8D0E83] text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                  >
                    <i className="fas fa-list-ol"></i>
                    <span>View All Coupon Fixtures</span>
                  </button>
                  <button
                    onClick={() =>
                      onOpenPaymentModal({
                        name: jp.name,
                        amount: jp.price || 110,
                        id: jp.id,
                        slug: jp.slug,
                        type: 'jackpot',
                      })
                    }
                    className="px-4 py-2 bg-[#8D0E83] hover:bg-[#630A5C] text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-sm"
                  >
                    <i className="fas fa-lock-open text-[11px]"></i>
                    <span>Unlock (KES {jp.price || 110})</span>
                  </button>
                </div>
              </div>

              {/* Top Fixtures preview */}
              <div className="p-5">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Top Fixtures ({Math.min(fixtures.length, 4)} of {jp.gamesCount})
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-4">
                  {fixtures.slice(0, 4).map((f, idx) => (
                    <div
                      key={f.id || idx}
                      className="p-2.5 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#8D0E83] text-white flex items-center justify-center text-[10px] font-bold">
                          {f.position || idx + 1}
                        </span>
                        <span className="font-bold text-gray-800">
                          {f.homeTeam} vs {f.awayTeam}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-[#8D0E83] text-white font-extrabold text-[11px]">
                        {f.prediction || '1'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-900">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-shield-alt text-amber-600 text-base"></i>
                    <span>
                      Includes <strong>3 Double-Chance Hedge Versions</strong> to maximize bonus qualification (10/13, 12/15, 14/17).
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      onOpenPaymentModal({
                        name: jp.name,
                        amount: jp.price || 110,
                        id: jp.id,
                        slug: jp.slug,
                        type: 'jackpot',
                      })
                    }
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-xs whitespace-nowrap"
                  >
                    Get 3 Versions
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
