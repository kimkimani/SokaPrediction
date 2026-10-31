import React from 'react';
import { OddsPack } from '../types';
import { PremiumOddsSection } from '../components/PremiumOddsSection';
import { FaqAccordion, FaqItem } from '../components/FaqAccordion';
import { ApiLoadingState } from '../components/ApiLoadingState';

interface SureOddsPageProps {
  oddsPacks: OddsPack[];
  loading?: boolean;
  onOpenPaymentModal: (pkg: { name: string; amount: number; id: string; slug: string; type: string }) => void;
}

import { PageNotFound } from '../components/PageNotFound';
import { MarkdownPageManager } from '../services/markdownManager';

export const SureOddsPage: React.FC<SureOddsPageProps> = ({
  oddsPacks,
  loading = false,
  onOpenPaymentModal,
}) => {
  const pageData =
    MarkdownPageManager.getPageByPath('/sure-premium-odds-and-tips') ||
    MarkdownPageManager.getPageByPath('/sure-odds') ||
    MarkdownPageManager.getPageByPath('/254-sure-premium-odds-and-tips') ||
    MarkdownPageManager.getPageByPath('/sure-odds-packs');

  if (!pageData) {
    return <PageNotFound path="/sure-premium-odds-and-tips" />;
  }

  const title =
    pageData?.frontmatter?.displayTitle ||
    pageData?.frontmatter?.title ||
    'Soka Sure Premium Odds & Shortlists';

  const intro =
    pageData?.frontmatter?.introParagraph ||
    'Need quick, curated tickets without committing to a full monthly subscription? Our Premium Odds Shortlists deliver targeted 2+, 3+, 4+, and 5+ odds tickets straight to your phone.';

  const badge =
    pageData?.frontmatter?.badgeText ||
    'Curated Odds Slips & Accumulators';

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
            title="Loading premium odds shortlists..."
            subtitle="Retrieving curated odds packages from API"
          />
        </div>
      ) : (
        <PremiumOddsSection
          oddsPacks={oddsPacks}
          onOpenPaymentModal={onOpenPaymentModal}
        />
      )}

      {/* FAQs from sure-odds-packs.md */}
      {pageData?.faqs && pageData.faqs.length > 0 && (
        <FaqAccordion
          faqs={pageData.faqs}
          title={pageData.frontmatter.faqTitle || "Sure Odds Packs - FAQs"}
          subtitle="Frequently asked questions about our odds micro-packs, payout ratios, and delivery."
        />
      )}
    </div>
  );
};
