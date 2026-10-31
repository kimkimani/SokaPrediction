import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MarkdownPageManager } from '../services/markdownManager';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVipModal: () => void;
  onOpenApiConfig: () => void;
  apiStatus: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onOpenVipModal,
  onOpenApiConfig,
  apiStatus,
}) => {
  const location = useLocation();
  const currentPath = location.pathname;

  // DYNAMIC SOURCES OF TRUTH: All links are pulled directly from Markdown files!
  // If a markdown file is removed from src/content/pages/, it instantly disappears everywhere!
  const categoryPages = MarkdownPageManager.getCategoryPages();
  const providerPages = MarkdownPageManager.getProviderPages();
  const datePages = MarkdownPageManager.getDatePages();
  const jackpotPages = MarkdownPageManager.getJackpotPages();
  const mainNavItems = MarkdownPageManager.getMainNavigationPages();

  const handleLinkClick = () => {
    if (window.innerWidth <= 1024) {
      onClose();
    }
  };

  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath === path) return true;
    if (path !== '/' && currentPath.startsWith(path) && path !== '/') return true;
    return false;
  };

  return (
    <>
      {/* Sidebar Overlay for Mobile Only */}
      <div
        className={`sidebar-overlay lg:hidden ${isOpen ? 'active' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        id="sidebar"
        className={`sidebar fixed top-0 left-0 w-[285px] h-screen bg-white border-r border-[#e5e7eb] p-4 z-50 overflow-y-auto transition-transform duration-300 lg:hidden ${
          isOpen ? 'active translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo inside mobile drawer */}
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <Link
            to="/"
            onClick={handleLinkClick}
            className="logo-brand cursor-pointer select-none text-decoration-none flex items-center gap-2"
          >
            <img
              src="/assets/brand-emblem.png"
              alt="Soka Predictions"
              className="w-7 h-7 rounded-lg object-contain shadow-xs flex-shrink-0"
            />
            <span>SOKA PREDICTIONS</span>
          </Link>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 p-1.5 rounded-lg border border-gray-200 cursor-pointer"
            aria-label="Close menu"
          >
            <i className="fas fa-times text-base"></i>
          </button>
        </div>

        {/* Main Navigation (100% Dynamic from Markdown) */}
        {mainNavItems.length > 0 && (
          <nav className="nav-section mb-5">
            <div className="nav-title text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-2">
              Main Navigation
            </div>
            <ul className="nav-links space-y-1">
              {mainNavItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={handleLinkClick}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-semibold transition ${
                      isActive(item.path)
                        ? 'bg-[#8D0E83] text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-[#8D0E83]'
                    }`}
                  >
                    <i className={`fas ${item.icon} w-4 text-center`}></i>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Dynamic Provider Tips (Sunpel, Sokapedia, PredictZ, etc. - Managed 100% via Markdown) */}
        {providerPages.length > 0 && (
          <nav className="nav-section mb-5">
            <div className="nav-title text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-2">
              <span>Expert Tipsters</span>
            </div>
            <ul className="nav-links space-y-1 text-xs">
              {providerPages.map((p) => {
                const link = p.frontmatter.link;
                const active = currentPath === link;
                return (
                  <li key={p.slug}>
                    <Link
                      to={link}
                      onClick={handleLinkClick}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-md transition ${
                        active
                          ? 'bg-purple-100 text-[#8D0E83] font-bold'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span className="truncate mr-1">
                        {p.frontmatter.shortTitle || p.frontmatter.displayTitle}
                      </span>
                      {p.frontmatter.badgeText && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-bold whitespace-nowrap">
                          {p.frontmatter.badgeText}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}

        {/* Dynamic Tips Categories (Over 1.5, Over 2.5, BTTS, Double Chance, 1X2 - Managed 100% via Markdown) */}
        {categoryPages.length > 0 && (
          <nav className="nav-section mb-5">
            <div className="nav-title text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-2 flex items-center justify-between">
              <span>Tips Categories</span>
              <span className="text-[10px] text-gray-400 font-mono">{categoryPages.length}</span>
            </div>
            <ul className="nav-links space-y-1 text-xs">
              {categoryPages.map((p) => {
                const link = p.frontmatter.link;
                const active = currentPath === link;
                return (
                  <li key={p.slug}>
                    <Link
                      to={link}
                      onClick={handleLinkClick}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-md transition ${
                        active
                          ? 'bg-purple-100 text-[#8D0E83] font-bold'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span>{p.frontmatter.shortTitle || p.frontmatter.displayTitle}</span>
                      {p.frontmatter.badgeText && (
                        <span className="text-[10px] text-emerald-600 font-bold">
                          {p.frontmatter.badgeText}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}

        {/* Match Day Archives (Today, Tomorrow, Yesterday - Managed 100% via Markdown) */}
        {datePages.length > 0 && (
          <nav className="nav-section mb-5">
            <div className="nav-title text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-2">
              Match Day Archives
            </div>
            <ul className="nav-links space-y-1">
              {datePages.map((p) => {
                const link = p.frontmatter.link;
                const active = currentPath === link;
                const icon = p.frontmatter.dateMode === 'tomorrow'
                  ? 'fa-calendar-plus'
                  : p.frontmatter.dateMode === 'yesterday'
                  ? 'fa-history'
                  : 'fa-calendar-day';
                return (
                  <li key={p.slug}>
                    <Link
                      to={link}
                      onClick={handleLinkClick}
                      className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                        active
                          ? 'bg-[#8D0E83] text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-[#8D0E83]'
                      }`}
                    >
                      <i className={`fas ${icon} w-4 text-center`}></i>
                      <span>{p.frontmatter.shortTitle || p.frontmatter.displayTitle}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}

        {/* Individual Jackpot Pages (Managed 100% via Markdown) */}
        {jackpotPages.length > 0 && (
          <nav className="nav-section mb-5">
            <div className="nav-title text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-2 flex items-center justify-between">
              <span>Kenyan Jackpots</span>
              <span className="text-[10px] text-gray-400 font-mono">{jackpotPages.length}</span>
            </div>
            <ul className="nav-links space-y-1 text-xs">
              {jackpotPages.map((p) => {
                const link = p.frontmatter.link;
                const active = currentPath === link;
                return (
                  <li key={p.slug}>
                    <Link
                      to={link}
                      onClick={handleLinkClick}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-md transition ${
                        active
                          ? 'bg-purple-100 text-[#8D0E83] font-bold'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span className="truncate mr-1">{p.frontmatter.shortTitle || p.frontmatter.displayTitle}</span>
                      <span className="text-[10px] bg-gray-100 px-1.5 py-0.2 rounded font-bold">Coupon</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}

        {/* VIP Upgrade Banner in Sidebar */}
        <div className="mt-4 p-4 rounded-xl bg-[#8D0E83] text-white shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <i className="fas fa-crown text-amber-300"></i>
            <span className="font-extrabold text-xs uppercase tracking-wide">
              VIP Banker Club
            </span>
          </div>
          <p className="text-[11px] text-purple-100 mb-3 leading-relaxed">
            Get instant automated access to our daily 5+ odds slips.
          </p>
          <button
            onClick={onOpenVipModal}
            className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-gray-950 font-black text-xs rounded-lg transition shadow-xs cursor-pointer"
          >
            Upgrade via M-Pesa
          </button>
        </div>

        {/* Brand Badge */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-[11px] text-gray-500 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-gray-600">
            <img
              src="/assets/brand-emblem.png"
              alt=""
              className="w-4 h-4 rounded object-contain"
            />
            <span>SokaPredictions Engine</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-600 font-bold">
            Live Verified
          </span>
        </div>
      </aside>
    </>
  );
};
