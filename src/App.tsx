import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  PredictionFixture,
  JackpotItem,
  VipPackage,
  OddsPack,
} from './types';
import { CheerplexApiService } from './services/api';
import { Sidebar } from './components/Sidebar';
import { RightSidebar } from './components/RightSidebar';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { FloatingActions } from './components/FloatingActions';
import { Footer } from './components/Footer';
import { PaymentModal } from './components/PaymentModal';
import { JackpotDetailModal } from './components/JackpotDetailModal';
import { ApiConfigModal } from './components/ApiConfigModal';

// Dedicated Pages & Dynamic Markdown Engine
import { HomePage } from './pages/HomePage';
import { JackpotsListPage } from './pages/JackpotsListPage';
import { JackpotDetailPage } from './pages/JackpotDetailPage';
import { TipOfTheDayPage } from './pages/TipOfTheDayPage';
import { VipPackagesPage } from './pages/VipPackagesPage';
import { FreeTipsPage } from './pages/FreeTipsPage';
import { SureOddsPage } from './pages/SureOddsPage';
import { DatePredictionsPage } from './pages/DatePredictionsPage';
import { DynamicMarkdownPage } from './pages/DynamicMarkdownPage';
import { ContactView as ContactPage } from './components/ContactView';
import { AboutView as AboutPage } from './components/AboutView';
import { SeoManager } from './components/SeoManager';

/**
 * TrailingSlashRemover
 * Automatically removes any trailing slash from the browser URL bar
 * using window.history.replaceState (zero HTTP redirect, zero reload, pure client-side).
 */
const TrailingSlashRemover: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.length > 1 && location.pathname.endsWith('/')) {
      const cleanPath = location.pathname.replace(/\/+$/, '');
      window.history.replaceState(
        window.history.state,
        document.title,
        cleanPath + location.search + location.hash
      );
    }
  }, [location.pathname, location.search, location.hash]);

  return null;
};

function AppLayout() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data states from Cheerplex PHP API
  const [fixtures, setFixtures] = useState<PredictionFixture[]>([]);
  const [jackpots, setJackpots] = useState<JackpotItem[]>([]);
  const [vipPackages, setVipPackages] = useState<VipPackage[]>([]);
  const [oddsPacks, setOddsPacks] = useState<OddsPack[]>([]);

  // Loading & status states
  const [loadingFixtures, setLoadingFixtures] = useState(true);
  const [loadingJackpots, setLoadingJackpots] = useState(true);
  const [loadingVip, setLoadingVip] = useState(true);
  const [loadingOdds, setLoadingOdds] = useState(true);
  const [apiStatus, setApiStatus] = useState<string>('online');

  // Filter states
  const [dateFilter, setDateFilter] = useState<'yesterday' | 'today' | 'tomorrow'>('today');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal states
  const [paymentModalState, setPaymentModalState] = useState<{
    isOpen: boolean;
    package: {
      name: string;
      amount: number;
      id: string;
      slug: string;
      type: string;
    } | null;
  }>({
    isOpen: false,
    package: null,
  });

  const [selectedJackpotModal, setSelectedJackpotModal] = useState<JackpotItem | null>(null);
  const [isApiConfigOpen, setIsApiConfigOpen] = useState(false);

  // Load Fixtures based on date or category
  const loadPredictions = useCallback(async (cat: string, date: string) => {
    setLoadingFixtures(true);
    try {
      let queryCat = cat;
      if (date === 'tomorrow') queryCat = 'tomorrow';
      else if (date === 'yesterday') queryCat = 'yesterday';
      else if (cat !== 'all') queryCat = cat;
      else queryCat = 'today';

      const data = await CheerplexApiService.getPredictions(queryCat);
      setFixtures(data);
    } catch (err) {
      console.warn('Failed loading predictions', err);
    } finally {
      setLoadingFixtures(false);
    }
  }, []);

  // Initial Load from Cheerplex PHP API
  const loadAllData = useCallback(async () => {
    try {
      const health = await CheerplexApiService.getHealth();
      setApiStatus(health.status === 'online' ? 'online' : 'fallback');
    } catch {
      setApiStatus('fallback');
    }

    setLoadingJackpots(true);
    try {
      const jData = await CheerplexApiService.getJackpots();
      setJackpots(jData);
    } catch (err) {
      console.warn('Failed loading jackpots', err);
    } finally {
      setLoadingJackpots(false);
    }

    setLoadingVip(true);
    try {
      const vData = await CheerplexApiService.getVipPackages();
      setVipPackages(vData);
    } catch (err) {
      console.warn('Failed loading VIP packages', err);
    } finally {
      setLoadingVip(false);
    }

    setLoadingOdds(true);
    try {
      const oData = await CheerplexApiService.getOddsPacks();
      setOddsPacks(oData);
    } catch (err) {
      console.warn('Failed loading odds packs', err);
    } finally {
      setLoadingOdds(false);
    }

    loadPredictions(categoryFilter, dateFilter);
  }, [categoryFilter, dateFilter, loadPredictions]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleDateFilterChange = (filter: 'yesterday' | 'today' | 'tomorrow') => {
    setDateFilter(filter);
    loadPredictions(categoryFilter, filter);
  };

  const handleCategoryFilterChange = (cat: string) => {
    setCategoryFilter(cat);
    loadPredictions(cat, dateFilter);
  };

  const handleScrollToPredictions = () => {
    const el = document.getElementById('predictions');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        document.getElementById('predictions')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  };

  const openDefaultVipModal = () => {
    setPaymentModalState({
      isOpen: true,
      package: {
        name: 'Two Weeks VIP',
        amount: 800,
        id: 'vip-14day',
        slug: 'vip-14day',
        type: 'vip',
      },
    });
  };

  const openCustomPaymentModal = (pkg: {
    name: string;
    amount: number;
    id: string;
    slug: string;
    type: string;
  }) => {
    setPaymentModalState({
      isOpen: true,
      package: pkg,
    });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans w-full max-w-full overflow-x-hidden">
      {/* Dynamic SEO & Canonical Link Synchronizer */}
      <SeoManager />

      {/* Instant Zero-Redirect Trailing Slash Cleaner */}
      <TrailingSlashRemover />

      {/* Universal Top Navigation Header (Desktop Navigation & Mobile Menu) */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onScrollToPredictions={handleScrollToPredictions}
        onOpenVipModal={openDefaultVipModal}
        onOpenApiConfig={() => setIsApiConfigOpen(true)}
        apiStatus={apiStatus}
        isSidebarOpen={isSidebarOpen}
      />

      {/* 2-Column Responsive Layout (No 3rd Column Clutter) */}
      <div className={`app-grid flex-1 ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
        {/* Left Navigation Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpenVipModal={openDefaultVipModal}
          onOpenApiConfig={() => setIsApiConfigOpen(true)}
          apiStatus={apiStatus}
        />

        {/* Center Main Content Area */}
        <main className="main-content min-w-0 pb-16 lg:pb-12 px-3 sm:px-4 lg:px-5 pt-2 md:pt-3 w-full max-w-full overflow-x-hidden">
          {/* Dynamic Multi-Page Routes */}
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  fixtures={fixtures}
                  loadingFixtures={loadingFixtures}
                  dateFilter={dateFilter}
                  setDateFilter={handleDateFilterChange}
                  categoryFilter={categoryFilter}
                  setCategoryFilter={handleCategoryFilterChange}
                  onRefreshPredictions={() => loadPredictions(categoryFilter, dateFilter)}
                  jackpots={jackpots}
                  loadingJackpots={loadingJackpots}
                  onOpenJackpotDetail={(jp) => setSelectedJackpotModal(jp)}
                  vipPackages={vipPackages}
                  oddsPacks={oddsPacks}
                  onOpenPaymentModal={openCustomPaymentModal}
                  onOpenDefaultVipModal={openDefaultVipModal}
                />
              }
            />

            {/* Jackpots Hub Page - Route is /jackpot-predictions */}
            <Route
              path="/jackpot-predictions"
              element={
                <JackpotsListPage
                  jackpots={jackpots}
                  loading={loadingJackpots}
                  onOpenPaymentModal={openCustomPaymentModal}
                />
              }
            />
            {/* Direct rendering without any redirect */}
            <Route
              path="/jackpots"
              element={
                <JackpotsListPage
                  jackpots={jackpots}
                  loading={loadingJackpots}
                  onOpenPaymentModal={openCustomPaymentModal}
                />
              }
            />
            <Route
              path="/jackpot"
              element={
                <JackpotsListPage
                  jackpots={jackpots}
                  loading={loadingJackpots}
                  onOpenPaymentModal={openCustomPaymentModal}
                />
              }
            />

            {/* Dedicated Individual Jackpot Working Page */}
            <Route
              path="/jackpots/:slug"
              element={
                <JackpotDetailPage
                  jackpots={jackpots}
                  onOpenPaymentModal={openCustomPaymentModal}
                />
              }
            />

            {/* Special Banker Pick of the Day Page */}
            <Route
              path="/tip-of-the-day"
              element={
                <TipOfTheDayPage
                  fixtures={fixtures}
                  loading={loadingFixtures}
                  onRefresh={() => loadPredictions('all', 'today')}
                  onOpenPaymentModal={openCustomPaymentModal}
                  onOpenDefaultVipModal={openDefaultVipModal}
                />
              }
            />

            {/* Sitemap page directly renders Home view without any redirect */}
            <Route
              path="/sitemap"
              element={
                <HomePage
                  fixtures={fixtures}
                  loadingFixtures={loadingFixtures}
                  dateFilter={dateFilter}
                  setDateFilter={handleDateFilterChange}
                  categoryFilter={categoryFilter}
                  setCategoryFilter={handleCategoryFilterChange}
                  onRefreshPredictions={() => loadPredictions(categoryFilter, dateFilter)}
                  jackpots={jackpots}
                  loadingJackpots={loadingJackpots}
                  onOpenJackpotDetail={(jp) => setSelectedJackpotModal(jp)}
                  vipPackages={vipPackages}
                  oddsPacks={oddsPacks}
                  onOpenPaymentModal={openCustomPaymentModal}
                  onOpenDefaultVipModal={openDefaultVipModal}
                />
              }
            />

            {/* VIP Packages Dedicated Page */}
            <Route
              path="/vip-packages"
              element={
                <VipPackagesPage
                  vipPackages={vipPackages}
                  loading={loadingVip}
                  onOpenPaymentModal={openCustomPaymentModal}
                />
              }
            />

            {/* Free Sure Tips Dedicated Page */}
            <Route
              path="/free-sure-tips-and-predictions"
              element={
                <FreeTipsPage
                  fixtures={fixtures}
                  loading={loadingFixtures}
                  onRefresh={() => loadPredictions('all', 'today')}
                />
              }
            />

            {/* Sure Odds Packs Dedicated Page */}
            <Route
              path="/sure-premium-odds-and-tips"
              element={
                <SureOddsPage
                  oddsPacks={oddsPacks}
                  loading={loadingOdds}
                  onOpenPaymentModal={openCustomPaymentModal}
                />
              }
            />
            <Route
              path="/254-sure-premium-odds-and-tips"
              element={
                <SureOddsPage
                  oddsPacks={oddsPacks}
                  loading={loadingOdds}
                  onOpenPaymentModal={openCustomPaymentModal}
                />
              }
            />

            <Route path="/about" element={<AboutPage />} />
            <Route path="/about-us" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/contact-us" element={<ContactPage />} />

            {/* Universal Dynamic Markdown Page Resolver */}
            {/* Matches ANY nested or top-level path (e.g. /tips/sunpel, /tips/sokapedia, /tips/predictz, /over-1-5-prediction-tips, /today-tips-and-predictions) */}
            <Route
              path="/*"
              element={
                <DynamicMarkdownPage
                  jackpots={jackpots}
                  vipPackages={vipPackages}
                  oddsPacks={oddsPacks}
                  onOpenPaymentModal={openCustomPaymentModal}
                />
              }
            />
          </Routes>
        </main>

        {/* Right Desktop Utility & Slip Companion Sidebar */}
        <RightSidebar
          jackpots={jackpots}
          fixtures={fixtures}
          onOpenPaymentModal={openCustomPaymentModal}
          onOpenVipModal={openDefaultVipModal}
        />
      </div>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        onOpenVipModal={openDefaultVipModal}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Floating Action Buttons */}
      <FloatingActions onOpenApiConfig={() => setIsApiConfigOpen(true)} />

      {/* M-Pesa Payment Checkout Modal */}
      <PaymentModal
        isOpen={paymentModalState.isOpen}
        onClose={() => setPaymentModalState({ isOpen: false, package: null })}
        selectedPackage={paymentModalState.package}
      />

      {/* Quick Inspection Modal */}
      <JackpotDetailModal
        jackpot={selectedJackpotModal}
        isOpen={!!selectedJackpotModal}
        onClose={() => setSelectedJackpotModal(null)}
        onUnlock={(jp) => {
          setSelectedJackpotModal(null);
          openCustomPaymentModal({
            name: jp.name,
            amount: jp.price || 150,
            id: jp.id,
            slug: jp.slug,
            type: 'jackpot',
          });
        }}
      />

      {/* Cheerplex PHP API Settings Modal */}
      <ApiConfigModal
        isOpen={isApiConfigOpen}
        onClose={() => setIsApiConfigOpen(false)}
        onEndpointChanged={() => loadAllData()}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
