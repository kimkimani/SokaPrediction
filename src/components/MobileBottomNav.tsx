import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface MobileBottomNavProps {
  onOpenVipModal: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenVipModal,
  onToggleSidebar,
  isSidebarOpen = false,
}) => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav
      className="mobile-bottom-nav lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-2 py-1.5 flex items-center justify-around shadow-lg"
      role="navigation"
      aria-label="Mobile bottom navigation"
    >
      <Link
        to="/"
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 text-[11px] font-semibold transition ${
          path === '/' ? 'text-[#8D0E83]' : 'text-gray-500 hover:text-gray-800'
        }`}
      >
        <i className="fas fa-home text-base"></i>
        <span>Home</span>
      </Link>

      <Link
        to="/today-tips-and-predictions"
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 text-[11px] font-semibold transition ${
          path === '/today-tips-and-predictions' ? 'text-[#8D0E83]' : 'text-gray-500 hover:text-gray-800'
        }`}
      >
        <i className="fas fa-bolt text-base"></i>
        <span>Today</span>
      </Link>

      <Link
        to="/jackpot-predictions"
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 text-[11px] font-semibold transition ${
          path.startsWith('/jackpot') ? 'text-[#8D0E83]' : 'text-gray-500 hover:text-gray-800'
        }`}
      >
        <i className="fas fa-trophy text-base"></i>
        <span>Jackpots</span>
      </Link>

      <button
        onClick={onOpenVipModal}
        className="flex flex-col items-center gap-0.5 py-1 px-2.5 text-[11px] font-bold text-[#d97706] hover:text-[#b45309] transition cursor-pointer"
      >
        <i className="fas fa-crown text-base"></i>
        <span>VIP</span>
      </button>

      {/* Menu Drawer Toggle Button for Smaller Screens */}
      {onToggleSidebar && (
        <button
          onClick={onToggleSidebar}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 text-[11px] font-bold transition cursor-pointer ${
            isSidebarOpen ? 'text-[#8D0E83]' : 'text-gray-600 hover:text-[#8D0E83]'
          }`}
          aria-label="Toggle All Categories & Jackpots Menu"
        >
          <i className={`fas ${isSidebarOpen ? 'fa-times' : 'fa-bars'} text-base`}></i>
          <span>Menu</span>
        </button>
      )}
    </nav>
  );
};
