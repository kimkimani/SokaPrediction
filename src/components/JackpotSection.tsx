import React from 'react';
import { Link } from 'react-router-dom';
import { JackpotItem } from '../types';
import { ApiLoadingState } from './ApiLoadingState';

interface JackpotSectionProps {
  jackpots: JackpotItem[];
  loading: boolean;
  onOpenJackpotDetail: (jackpot: JackpotItem) => void;
  onOpenPaymentModal: (pkg: { name: string; amount: number; id: string; slug: string; type: string }) => void;
}

export const JackpotSection: React.FC<JackpotSectionProps> = ({
  jackpots,
  loading,
  onOpenPaymentModal,
}) => {
  const activeJackpot = jackpots.find((j) => j.slug === 'sportpesa-mega') || jackpots[0];

  if (loading || !activeJackpot) {
    return (
      <section className="prediction-section mb-8 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="section-header p-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <i className="fas fa-trophy text-[#8D0E83]"></i>
            <span>SportPesa Mega Jackpot Soka Tips</span>
          </h2>
        </div>
        <ApiLoadingState
          title="Loading jackpot coupon analytics..."
          subtitle="Retrieving active Kenyan jackpot fixtures and pool sizes"
        />
      </section>
    );
  }

  const sampleFixtures = (activeJackpot.fixtures || []).slice(0, 5);

  return (
    <section className="prediction-section mb-8 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Section Header */}
      <div className="section-header p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 m-0">
            <i className="fas fa-trophy text-[#8D0E83]"></i>
            <span>{activeJackpot.name || 'SportPesa Mega Jackpot Soka Tips'}</span>
          </h2>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {activeJackpot.nextGameStartTime || 'Starts Saturday: 16:30 EAT (Nairobi)'} • Est. Pool: <strong className="text-emerald-700">{activeJackpot.estimatedPool}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/jackpots/${activeJackpot.slug || activeJackpot.id}`}
            className="text-xs font-bold text-[#8D0E83] hover:text-[#630A5C] flex items-center gap-1 bg-purple-50 hover:bg-purple-100 px-2.5 py-1.5 rounded-md border border-purple-200 transition"
          >
            <i className="fas fa-expand-alt text-[10px]"></i>
            <span>Open Dedicated {activeJackpot.gamesCount || 17}-Game Page</span>
          </Link>
          <Link
            to="/jackpot-predictions"
            className="text-xs font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-md transition"
          >
            <i className="fas fa-layer-group text-[10px]"></i>
            <span>All 5 Jackpots</span>
          </Link>
        </div>
      </div>

      <div className="matches-list p-4">
        {/* Sample games preview */}
        <div className="space-y-2 mb-4">
          {sampleFixtures.map((g, idx) => (
            <div
              key={g.id || idx}
              className="flex items-center justify-between p-2.5 rounded-lg border border-gray-200 bg-white hover:border-[#8D0E83]/60 transition text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#8D0E83] text-white flex items-center justify-center text-[10px] font-bold">
                  {g.position || idx + 1}
                </span>
                <div>
                  <div className="font-bold text-gray-900">
                    {g.homeTeam} <span className="text-gray-400 font-normal">vs</span> {g.awayTeam}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    Kickoff: {g.kickoffTime}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {g.confidence && (
                  <span className="text-[10px] text-gray-500 hidden sm:inline">
                    {g.confidence}% Win
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-md bg-[#8D0E83] text-white font-extrabold text-xs shadow-xs min-w-[36px] text-center">
                  {g.prediction || '1'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
          <Link
            to={`/jackpots/${activeJackpot.slug || activeJackpot.id}`}
            className="py-3 px-4 rounded-lg border-2 border-[#8D0E83] text-[#8D0E83] hover:bg-purple-50 text-sm font-bold transition flex items-center justify-center gap-2"
          >
            <i className="fas fa-list-ol text-xs"></i>
            <span>View All {activeJackpot.gamesCount || 17} Predictions Free</span>
          </Link>

          <button
            onClick={() =>
              onOpenPaymentModal({
                name: activeJackpot.name,
                amount: activeJackpot.price || 150,
                id: activeJackpot.id,
                slug: activeJackpot.slug,
                type: 'jackpot',
              })
            }
            className="py-3 px-4 rounded-lg bg-[#8D0E83] hover:bg-[#630A5C] text-white text-sm font-bold shadow-md transition flex items-center justify-center gap-2 transform hover:-translate-y-0.5 cursor-pointer"
          >
            <i className="fas fa-lock-open text-xs"></i>
            <span>Unlock 3 Hedged Slips (KES {activeJackpot.price || 150})</span>
          </button>
        </div>
      </div>
    </section>
  );
};
