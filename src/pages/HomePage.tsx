import React from 'react';
import { PredictionFixture, JackpotItem, VipPackage, OddsPack } from '../types';
import { MarkdownPageManager } from '../services/markdownManager';
import { HeroSection } from '../components/HeroSection';
import { PredictionsSection } from '../components/PredictionsSection';
import { JackpotSection } from '../components/JackpotSection';
import { VipPackagesSection } from '../components/VipPackagesSection';
import { PremiumOddsSection } from '../components/PremiumOddsSection';
import { DailySlipCalculator } from '../components/DailySlipCalculator';
import { EditorialContent } from '../components/EditorialContent';
import { PageNotFound } from '../components/PageNotFound';

interface HomePageProps {
  fixtures: PredictionFixture[];
  loadingFixtures: boolean;
  dateFilter: 'yesterday' | 'today' | 'tomorrow';
  setDateFilter: (filter: 'yesterday' | 'today' | 'tomorrow') => void;
  categoryFilter: string;
  setCategoryFilter: (cat: string) => void;
  onRefreshPredictions: () => void;
  jackpots: JackpotItem[];
  loadingJackpots: boolean;
  onOpenJackpotDetail: (jp: JackpotItem) => void;
  vipPackages: VipPackage[];
  oddsPacks: OddsPack[];
  onOpenPaymentModal: (pkg: { name: string; amount: number; id: string; slug: string; type: string }) => void;
  onOpenDefaultVipModal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  fixtures,
  loadingFixtures,
  dateFilter,
  setDateFilter,
  categoryFilter,
  setCategoryFilter,
  onRefreshPredictions,
  jackpots,
  loadingJackpots,
  onOpenJackpotDetail,
  vipPackages,
  oddsPacks,
  onOpenPaymentModal,
  onOpenDefaultVipModal,
}) => {
  const homeData = MarkdownPageManager.getPageByPath('/');

  if (!homeData) {
    return <PageNotFound path="/" />;
  }

  const handleScrollToPredictions = () => {
    document.getElementById('predictions')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="py-2">
      {/* Compact Hero Section - populated from home.md */}
      <HeroSection
        onScrollToPredictions={handleScrollToPredictions}
        onOpenVipModal={onOpenDefaultVipModal}
        title={homeData?.frontmatter?.displayTitle || 'Soka Predictions & Football Betting Tips'}
        introParagraph={homeData?.frontmatter?.introParagraph}
        badgeText={homeData?.frontmatter?.badgeText || "Today's Verified Kenya Football Predictions & Jackpots"}
      />

      {/* Free Daily Predictions Section with Date & Markets Filters */}
      <PredictionsSection
        fixtures={fixtures}
        loading={loadingFixtures}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        onRefresh={onRefreshPredictions}
        title={homeData?.frontmatter?.listTitle || 'Football Match Predictions & Tips'}
        subtitle={homeData?.frontmatter?.listSubtitle || 'Verified daily betting selections backed by quantitative form analysis'}
      />

      {/* Slip Odds Calculator & Verified Punter Intelligence */}
      <DailySlipCalculator onOpenPaymentModal={onOpenPaymentModal} />

      {/* Featured Jackpot Coupon Section */}
      <JackpotSection
        jackpots={jackpots}
        loading={loadingJackpots}
        onOpenJackpotDetail={onOpenJackpotDetail}
        onOpenPaymentModal={onOpenPaymentModal}
      />

      {/* VIP Prediction Packages Showcase */}
      <VipPackagesSection
        packages={vipPackages}
        onOpenPaymentModal={onOpenPaymentModal}
      />

      {/* Premium Odds Shortlists */}
      <PremiumOddsSection
        oddsPacks={oddsPacks}
        onOpenPaymentModal={onOpenPaymentModal}
      />

      {/* Rich Markdown Editorial Analysis */}
      <EditorialContent />
    </div>
  );
};
