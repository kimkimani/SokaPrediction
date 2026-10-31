import React from 'react';
import { VipPackage } from '../types';
import { VipPackagesSection } from '../components/VipPackagesSection';
import { FaqAccordion, FaqItem } from '../components/FaqAccordion';
import { ApiLoadingState } from '../components/ApiLoadingState';

interface VipPackagesPageProps {
  vipPackages: VipPackage[];
  loading?: boolean;
  onOpenPaymentModal: (pkg: { name: string; amount: number; id: string; slug: string; type: string }) => void;
}

import { PageNotFound } from '../components/PageNotFound';
import { MarkdownPageManager } from '../services/markdownManager';

export const VipPackagesPage: React.FC<VipPackagesPageProps> = ({
  vipPackages,
  loading = false,
  onOpenPaymentModal,
}) => {
  const pageData =
    MarkdownPageManager.getPageByPath('/vip-packages') ||
    MarkdownPageManager.getPageByPath('/vip');

  if (!pageData) {
    return <PageNotFound path="/vip-packages" />;
  }

  const title =
    pageData?.frontmatter?.displayTitle ||
    pageData?.frontmatter?.title ||
    'SOKA PREDICTIONS VIP Membership Packages';

  const intro =
    pageData?.frontmatter?.introParagraph ||
    'Unlock our highest-confidence predictions with verified 85%+ hit rates. High-confidence daily 5+ odds slips, jackpot combinations, and instant automated dispatch via SMS and WhatsApp.';

  const badge =
    pageData?.frontmatter?.badgeText ||
    'VIP Tipping Club';

  return (
    <div className="py-2 space-y-6">
      <div className="bg-white border border-gray-200/90 rounded-xl p-5 md:p-6 shadow-xs">
        <span className="inline-block text-[11px] font-bold tracking-wide bg-purple-50 text-[#8D0E83] border border-purple-100 px-2.5 py-1 rounded-md mb-2.5">
          {badge}
        </span>
        <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
          {title}
        </h1>
        <p className="text-xs md:text-sm text-gray-600 max-w-2xl leading-relaxed">
          {intro}
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200">
          <ApiLoadingState
            title="Loading VIP prediction packages..."
            subtitle="Retrieving daily high-accuracy banker tiers and jackpot slips"
          />
        </div>
      ) : (
        <VipPackagesSection
          packages={vipPackages}
          onOpenPaymentModal={onOpenPaymentModal}
        />
      )}

      {/* Why Choose VIP */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <h2 className="text-base sm:text-lg font-black text-gray-900">
          The VIP Advantage: How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-[#8D0E83] text-white flex items-center justify-center text-sm font-bold mb-2">
              1
            </div>
            <strong className="text-xs font-bold text-gray-900 block mb-1">
              Automated M-Pesa STK Push
            </strong>
            <p className="text-xs text-gray-600">
              Select your package, enter your Safaricom or Airtel phone number, and enter your PIN. Activation takes under 10 seconds.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-sm font-bold mb-2">
              2
            </div>
            <strong className="text-xs font-bold text-gray-900 block mb-1">
              Multi-Channel Delivery
            </strong>
            <p className="text-xs text-gray-600">
              Receive your daily tips via SMS directly to your phone, plus access to our private VIP Telegram community.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center text-sm font-bold mb-2">
              3
            </div>
            <strong className="text-xs font-bold text-gray-900 block mb-1">
              Guaranteed Coverage
            </strong>
            <p className="text-xs text-gray-600">
              If any of your daily slips fails during your active subscription period, your plan is automatically extended by 1 full day for free.
            </p>
          </div>
        </div>
      </div>

      {/* VIP FAQs Accordion from vip-packages.md */}
      {pageData?.faqs && pageData.faqs.length > 0 && (
        <FaqAccordion
          faqs={pageData.faqs}
          title={pageData.frontmatter.faqTitle || "VIP Membership - Frequently Asked Questions"}
          subtitle="Clear details on subscription tiers, M-Pesa STK push checkout, instant dispatch, and replacement guarantees."
        />
      )}
    </div>
  );
};
