import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import { MarkdownPageManager } from '../services/markdownManager';

interface HeaderProps {
  onToggleSidebar: () => void;
  onScrollToPredictions: () => void;
  onOpenVipModal: () => void;
  onOpenApiConfig?: () => void;
  apiStatus?: string;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onScrollToPredictions,
  onOpenVipModal,
  isSidebarOpen = false,
}) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const headerLinks = MarkdownPageManager.getHeaderNavPages();

  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
      <div className="max-w-[1260px] 2xl:max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 h-14 flex items-center justify-between gap-3">
        {/* Left Section: Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition cursor-pointer border border-gray-200 active:scale-95"
            title="Open Mobile Navigation Menu"
            aria-label="Toggle Navigation Menu"
          >
            <i className={`fas ${isSidebarOpen ? 'fa-times text-[#8D0E83]' : 'fa-bars'} text-sm`}></i>
          </button>

          <Link
            to="/"
            className="logo-brand text-base sm:text-lg font-black tracking-tight text-decoration-none select-none flex items-center gap-2"
          >
            <img
              src="/assets/brand-emblem.png"
              alt="Soka Predictions Emblem"
              className="w-8 h-8 rounded-lg object-contain shadow-xs flex-shrink-0"
            />
            <span className="text-[#8D0E83]">
              SOKA PREDICTIONS
            </span>
          </Link>
        </div>

        {/* Center Section: Desktop Main Navigation Bar (100% Dynamic from Markdown) */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 text-xs font-bold text-gray-700 overflow-x-auto scrollbar-none py-1">
          {headerLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-2.5 xl:px-3 py-1.5 rounded-md transition flex items-center gap-1.5 whitespace-nowrap ${
                isActive(item.path)
                  ? 'text-[#8D0E83] bg-purple-50 font-extrabold'
                  : 'hover:text-[#8D0E83] hover:bg-gray-50'
              }`}
            >
              {item.icon && <i className={item.icon}></i>}
              <span>{item.label}</span>
              {item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${item.badgeColor || 'bg-purple-100 text-[#8D0E83]'}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Right Section: Action Buttons (PHP API removed as requested) */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onScrollToPredictions}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <i className="fas fa-bolt text-emerald-600 text-xs"></i>
            <span>Predictions</span>
          </button>

          <button
            onClick={onOpenVipModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider transition shadow-sm cursor-pointer"
          >
            <i className="fas fa-crown text-xs"></i>
            <span>Go VIP</span>
          </button>
        </div>
      </div>
    </header>
  );
};
