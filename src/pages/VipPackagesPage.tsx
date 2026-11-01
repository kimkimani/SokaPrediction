import React from 'react';
import { VipPackage } from '../types';
import { VipPackagesSection } from '../components/VipPackagesSection';
import { FaqAccordion, FaqItem } from '../components/FaqAccordion';
import { MarkdownArticleBlock } from '../components/MarkdownArticleBlock';
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

      {/* Editorial Content / Meat of the Article in One Block Section from vip-packages.md */}
      <MarkdownArticleBlock pageData={pageData} />

      {/* VIP FAQs Accordion from vip-packages.md */}
      {pageData?.faqs && pageData.faqs.length > 0 && (
        <FaqAccordion
          faqs={pageData.faqs}
          title={pageData.frontmatter.faqTitle || pageData.faqTitle || "VIP Membership - Frequently Asked Questions"}
          subtitle={pageData.frontmatter.faqSubtitle || pageData.faqSubtitle}
        />
      )}
    </div>
  );
};
