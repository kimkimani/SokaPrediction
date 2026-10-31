import React from 'react';
import { VipPackage } from '../types';

interface VipPackagesSectionProps {
  packages: VipPackage[];
  onOpenPaymentModal: (pkg: { name: string; amount: number; id: string; slug: string; type: string }) => void;
}

export const VipPackagesSection: React.FC<VipPackagesSectionProps> = ({
  packages,
  onOpenPaymentModal,
}) => {
  return (
    <section id="vip-packages" className="vip-showcase mb-10">
      <div className="section-header mb-6">
        <h2 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2 mb-1">
          <i className="fas fa-crown text-amber-500"></i>
          <span>VIP Prediction Packages</span>
        </h2>
        <p className="text-sm text-gray-500">
          Choose your winning strategy — verified 85%+ win rate with instant M-Pesa automated dispatch.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {packages.map((pkg) => {
          const isFeatured = pkg.isFeatured || pkg.slug === 'vip-14day';

          return (
            <div
              key={pkg.id || pkg.slug}
              className={`relative bg-white rounded-2xl p-6 transition-all border flex flex-col justify-between ${
                isFeatured
                  ? 'border-2 border-[#8D0E83] shadow-xl ring-2 ring-[#8D0E83]/10 transform lg:-translate-y-2'
                  : 'border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300'
              }`}
            >
              {isFeatured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase shadow-md">
                  MOST POPULAR
                </div>
              )}

              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{pkg.name}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed min-h-[34px]">
                    {pkg.description}
                  </p>
                </div>

                <div className="text-2xl font-black text-[#8D0E83] mb-5">
                  KES {pkg.price}
                  <span className="text-xs font-semibold text-gray-400 ml-1">
                    / {pkg.durationDays} {pkg.durationDays === 1 ? 'day' : 'days'}
                  </span>
                </div>

                <ul className="space-y-2.5 text-xs text-gray-700 mb-6">
                  {pkg.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <i className="fas fa-check text-emerald-600 text-xs mt-0.5 flex-shrink-0"></i>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() =>
                  onOpenPaymentModal({
                    name: pkg.name,
                    amount: pkg.price,
                    id: pkg.id,
                    slug: pkg.slug,
                    type: 'vip',
                  })
                }
                className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-sm ${
                  isFeatured
                    ? 'bg-[#8D0E83] hover:bg-[#630A5C] text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <i className="fas fa-shopping-cart text-[11px]"></i>
                <span>Subscribe Now</span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
