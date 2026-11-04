import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
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
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      {/* Dynamic SEO & Canonical Link Synchronizer */}
      <SeoManager />

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
        <main className="main-content min-w-0 pb-16 lg:pb-12 px-3 sm:px-4 lg:px-5 pt-2 md:pt-3 w-full">
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
            {/* Fallback redirects for legacy links */}
            <Route path="/jackpots" element={<Navigate to="/jackpot-predictions" replace />} />
            <Route path="/jackpot" element={<Navigate to="/jackpot-predictions" replace />} />

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

            {/* Sitemap page removed as requested - redirect to home */}
            <Route path="/sitemap" element={<Navigate to="/" replace />} />

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
              element={<Navigate to="/sure-premium-odds-and-tips" replace />}
            />

            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

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

/**
 * Normalizes incoming URLs to remove any trailing slash and clean legacy /tips/ prefixes without triggering an HTTP redirect.
 * When a user directly visits, refreshes, or follows a link with a trailing slash (e.g. /mwanasoka-tips/ or /tips/mwanasoka-tips),
 * this immediately updates the browser URL bar to the clean non-slash flat version (/mwanasoka-tips)
 * using window.history.replaceState, avoiding server redirect chains and 301/308 status codes.
 */
function TrailingSlashNormalizer() {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;
    let cleanPath = pathname;

    // 1. Remove trailing slashes (except root '/')
    if (cleanPath !== '/' && cleanPath.endsWith('/')) {
      cleanPath = cleanPath.replace(/\/+$/, '') || '/';
    }

    // 2. Normalize legacy /tips/<slug> to clean /<slug> matching sokaking flat architecture
    if (cleanPath.startsWith('/tips/')) {
      const slug = cleanPath.replace(/^\/tips\//, '');
      if (slug) {
        cleanPath = `/${slug}`;
      }
    }

    if (cleanPath !== pathname) {
      const targetUrl = cleanPath + location.search + location.hash;
      window.history.replaceState(null, '', targetUrl);
    }
  }, [location.pathname, location.search, location.hash]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <TrailingSlashNormalizer />
      <AppLayout />
    </BrowserRouter>
  );
}
