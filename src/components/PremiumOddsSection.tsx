import React from 'react';
import { OddsPack } from '../types';

interface PremiumOddsSectionProps {
  oddsPacks: OddsPack[];
  onOpenPaymentModal: (pkg: { name: string; amount: number; id: string; slug: string; type: string }) => void;
}

export const PremiumOddsSection: React.FC<PremiumOddsSectionProps> = ({
  oddsPacks,
  onOpenPaymentModal,
}) => {
  return (
    <section id="odds-packs" className="premium-section mb-10 bg-gray-50/80 p-6 md:p-8 rounded-2xl border border-gray-200">
      <div className="premium-inner max-w-5xl mx-auto">
        {/* Section Header */}
        <header className="premium-header flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="premium-title">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 m-0">
              Premium Odds Shortlists
            </h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1 max-w-2xl">
              Curated shortlists delivered fast. Pick the risk level you prefer — trial, balanced, or high payout — then pay with M-Pesa and get tips via SMS / Telegram.
            </p>
          </div>
          <span className="self-start md:self-auto px-3 py-1 bg-purple-100 text-[#8D0E83] text-xs font-bold rounded-full border border-purple-200">
            Automated SMS &amp; Bot Dispatch
          </span>
        </header>

        {/* Odds Packs Grid */}
        <div className="premium-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {oddsPacks.map((pack) => (
            <article
              key={pack.id || pack.slug}
              className="premium-pack bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:border-[#8D0E83] transition-all flex flex-col justify-between"
            >
              <div>
                {/* Pack Head */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex flex-col gap-1">
                    <span
                      className="inline-block text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded-full w-max"
                      style={{ backgroundColor: pack.color || '#22c55e' }}
                    >
                      {pack.tag}
                    </span>
                    <h3 className="font-extrabold text-base text-gray-900">{pack.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{pack.description}</p>
                  </div>

                  {/* Odds Badge */}
                  <div className="flex flex-col items-center justify-center rounded-lg p-2 border-2 border-amber-500 min-w-[65px] bg-white flex-shrink-0">
                    <span className="font-extrabold text-xs md:text-sm text-gray-900">
                      {pack.oddsMinDecimal}
                    </span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase">Odds</span>
                  </div>
                </div>

                {/* Pack Body */}
                <div className="flex items-center justify-between mb-3 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Risk:</span>
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-[10px] font-bold text-gray-700">
                      {pack.riskLevel || 'Balanced'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-sm text-[#8D0E83]">KES {pack.price}</span>
                    <span className="text-[10px] text-gray-400 block">One-time</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="text-xs text-gray-600 space-y-1 mb-4">
                  <li className="flex items-center gap-1.5">
                    <i className="fas fa-check-circle text-emerald-500 text-[11px]"></i>
                    <span>{pack.picksPerDay || 3} picks per slip</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <i className="fas fa-check-circle text-emerald-500 text-[11px]"></i>
                    <span>Delivered SMS &amp; Telegram</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <i className="fas fa-check-circle text-emerald-500 text-[11px]"></i>
                    <span>Instant activation upon pay</span>
                  </li>
                </ul>
              </div>

              <div>
                <button
                  onClick={() =>
                    onOpenPaymentModal({
                      name: pack.name,
                      amount: pack.price,
                      id: String(pack.id),
                      slug: pack.slug,
                      type: 'odds',
                    })
                  }
                  className="w-full py-2 bg-[#d97706] hover:bg-[#b45309] text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <i className="fas fa-bolt text-[10px]"></i>
                  <span>Buy KES {pack.price}</span>
                </button>

                <div className="mt-2.5 pt-2 border-t border-dashed border-gray-200 text-center text-[10px] text-gray-400 font-semibold">
                  Delivered in <strong className="text-gray-700">~5–15 mins</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
