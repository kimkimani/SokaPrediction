import React, { useState } from 'react';

interface DailySlipCalculatorProps {
  onOpenPaymentModal: (pkg: { name: string; amount: number; id: string; slug: string; type: string }) => void;
}

export const DailySlipCalculator: React.FC<DailySlipCalculatorProps> = ({ onOpenPaymentModal }) => {
  const [stake, setStake] = useState<number>(500);
  const slipOdds = 4.25;
  const potentialWin = Math.round(stake * slipOdds);

  return (
    <section className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* 1. Slip Odds Calculator Widget */}
      <div className="p-5 rounded-2xl border border-purple-200 bg-purple-50/50 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 font-black text-sm text-[#630A5C]">
              <i className="fas fa-calculator text-[#8D0E83]"></i>
              <span>Daily 4+ Odds Payout Calculator</span>
            </div>
            <span className="bg-[#8D0E83] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-2xs">
              4.25x Odds
            </span>
          </div>
          <p className="text-xs text-gray-600 mb-3 leading-relaxed">
            Selected 3 games ticket for today top league games with 88% probability.
          </p>

          <div className="mb-3">
            <label className="text-[11px] font-bold text-gray-500 block mb-1">
              Enter Stake Amount (KES)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="50"
                step="50"
                value={stake}
                onChange={(e) => setStake(Math.max(10, Number(e.target.value) || 0))}
                className="w-full text-sm font-black px-3 py-2 border border-gray-300 rounded-xl focus:border-[#8D0E83] focus:outline-none bg-white shadow-inner"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-purple-200 mb-4 shadow-2xs">
            <span className="text-xs text-gray-500 font-semibold">Estimated Net Return:</span>
            <span className="text-base font-black text-emerald-600">
              KES {potentialWin.toLocaleString()}
            </span>
          </div>
        </div>

        <button
          onClick={() =>
            onOpenPaymentModal({
              name: '4+ Sure Tips Shortlist',
              amount: 250,
              id: '11',
              slug: 'sure-4-tips',
              type: 'odds',
            })
          }
          className="w-full py-2.5 bg-[#8D0E83] hover:bg-[#630A5C] text-white text-xs font-black uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <i className="fas fa-lock-open text-xs"></i>
          <span>Get This Slip (KES 250)</span>
        </button>
      </div>

      {/* 2. Verified Punters Review Widget */}
      <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 font-black text-sm text-gray-900">
              <i className="fas fa-star text-amber-500"></i>
              <span>Verified Kenyan Punters</span>
            </div>
            <span className="text-[10px] text-gray-400 font-bold">4.9 / 5.0 Rating</span>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-5 h-5 rounded-full bg-[#8D0E83] text-white flex items-center justify-center text-[10px] font-bold">
                  SK
                </div>
                <strong className="text-gray-900 text-xs">Samuel K. (Eldoret)</strong>
                <div className="ml-auto text-amber-400 text-[10px]">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
              </div>
              <p className="text-gray-600 text-xs leading-relaxed">
                &quot;Won KES 25,000 with VIP tips last week. The double chance picks never disappoint!&quot;
              </p>
            </div>

            <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                  AJ
                </div>
                <strong className="text-gray-900 text-xs">Amina J. (Nairobi)</strong>
                <div className="ml-auto text-amber-400 text-[10px]">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
              </div>
              <p className="text-gray-600 text-xs leading-relaxed">
                &quot;Instant M-Pesa push and immediate SMS delivery right after paying via Paybill 400200.&quot;
              </p>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-gray-400 text-center pt-2 mt-2 border-t border-gray-100 font-medium">
          Over 14,200 active punters across Kenya
        </div>
      </div>

      {/* 3. Betting Strategy & Live Intelligence */}
      <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-xs flex flex-col justify-between md:col-span-2 lg:col-span-1">
        <div>
          <div className="flex items-center gap-2 font-black text-sm text-gray-900 mb-2">
            <i className="fas fa-lightbulb text-amber-500"></i>
            <span>Analytical Strategy</span>
          </div>
          <p className="text-xs text-gray-600 mb-3 leading-relaxed">
            Our algorithms weight recent 5-match expected goals (xG), injuries, and head-to-head records over speculative sentiment. Combining 2 to 3 sure picks yields higher sustainable win rates than 15-match parlays.
          </p>

          <div className="space-y-2 mb-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-xs text-amber-900 border border-amber-200 font-medium">
              💡 <strong>Pro Tip:</strong> Double-chance (1X or X2) hedges deliver an 88% hit rate on volatile derby matches.
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-xs text-emerald-900 border border-emerald-200 font-medium">
              ⚡ <strong>Over 1.5 Goals:</strong> Highest statistical reliability market across European and African leagues.
            </div>
          </div>
        </div>

        <div className="text-[11px] text-gray-400 text-center pt-2 border-t border-gray-100">
          <span className="inline-block px-1.5 py-0.2 bg-gray-100 rounded text-gray-600 font-bold mr-1">
            18+
          </span>
          Strict Bankroll Management Required
        </div>
      </div>
    </section>
  );
};
