import React from 'react';
import { JackpotItem } from '../types';

interface JackpotDetailModalProps {
  jackpot: JackpotItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUnlock: (jackpot: JackpotItem) => void;
}

export const JackpotDetailModal: React.FC<JackpotDetailModalProps> = ({
  jackpot,
  isOpen,
  onClose,
  onUnlock,
}) => {
  if (!isOpen || !jackpot) return null;

  const fixtures = jackpot.fixtures || jackpot.games || [];

  // Distribution calculations matching cheerplex README
  const homeCount = fixtures.filter((f) => f.prediction === '1' || f.prediction === 'Home Win (1)').length;
  const drawCount = fixtures.filter((f) => f.prediction === 'X' || f.prediction === 'Draw (X)').length;
  const awayCount = fixtures.filter((f) => f.prediction === '2' || f.prediction === 'Away Win (2)').length;
  const dcCount = fixtures.filter((f) => ['1X', 'X2', '12'].includes(f.prediction)).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-200">
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8D0E83] text-white flex items-center justify-center text-lg font-black shadow-sm">
              <i className="fas fa-trophy"></i>
            </div>
            <div>
              <h3 className="text-base md:text-lg font-black text-gray-900 m-0">
                {jackpot.name}
              </h3>
              <p className="text-xs text-gray-500">
                {jackpot.gamesCount} Fixtures • Pool: <strong className="text-emerald-700">{jackpot.estimatedPool}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>

        {/* Shortcode Analytical Summary matching Cheerplex */}
        <div className="px-6 py-3 bg-purple-50/70 border-b border-purple-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#630A5C]">Distribution:</span>
            <span className="px-2 py-0.5 rounded bg-white font-bold text-gray-800 border border-purple-200">
              {homeCount} Home
            </span>
            <span className="px-2 py-0.5 rounded bg-white font-bold text-gray-800 border border-purple-200">
              {drawCount} Draw
            </span>
            <span className="px-2 py-0.5 rounded bg-white font-bold text-gray-800 border border-purple-200">
              {awayCount} Away
            </span>
            {dcCount > 0 && (
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold border border-amber-300">
                {dcCount} Double-Chance
              </span>
            )}
          </div>

          <div className="text-[11px] text-gray-500 font-medium">
            Kickoff: <strong className="text-gray-800">{jackpot.nextGameStartTime}</strong>
          </div>
        </div>

        {/* Fixtures List */}
        <div className="p-6 overflow-y-auto space-y-2.5 flex-1">
          {fixtures.map((f, idx) => {
            const isDC = ['1X', 'X2', '12'].includes(f.prediction);
            return (
              <div
                key={f.id || idx}
                className={`p-3 rounded-xl border transition flex items-center justify-between text-xs ${
                  isDC
                    ? 'border-amber-300 bg-amber-50/30'
                    : 'border-gray-200 bg-white hover:border-[#8D0E83]/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#8D0E83] text-white flex items-center justify-center text-xs font-bold">
                    {f.position || idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-gray-900 text-xs sm:text-sm">
                      {f.homeTeam} <span className="text-gray-400 font-normal">vs</span> {f.awayTeam}
                    </div>
                    <div className="text-[10px] text-gray-400 flex items-center gap-2 mt-0.5">
                      <span>{f.kickoffTime}</span>
                      {isDC && (
                        <span className="text-amber-700 font-semibold bg-amber-100 px-1.5 rounded">
                          ★ High Variance Hedge
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {f.confidence && (
                    <span className="text-[11px] text-gray-500 hidden sm:inline">
                      {f.confidence}%
                    </span>
                  )}
                  <span
                    className={`px-3 py-1 rounded-md font-black text-xs min-w-[40px] text-center shadow-xs ${
                      isDC
                        ? 'bg-amber-500 text-white'
                        : 'bg-[#8D0E83] text-white'
                    }`}
                  >
                    {f.prediction || '1'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-gray-600">
            Entry Fee: <strong className="text-gray-900">{jackpot.entryFee}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-100 transition"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onUnlock(jackpot);
              }}
              className="px-5 py-2 bg-[#8D0E83] hover:bg-[#630A5C] text-white rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <i className="fas fa-lock-open text-xs"></i>
              <span>Unlock Coupon (KES {jackpot.price})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
