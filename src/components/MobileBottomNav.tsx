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
      className="mobile-bottom-nav lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-1 py-1 flex items-center justify-between shadow-lg w-full max-w-full"
      role="navigation"
      aria-label="Mobile bottom navigation"
    >
      <Link
        to="/"
        className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1 text-[10px] sm:text-[11px] font-semibold transition text-center min-w-0 ${
          path === '/' ? 'text-[#8D0E83] font-bold' : 'text-gray-500 hover:text-gray-800'
        }`}
      >
        <i className="fas fa-home text-base"></i>
        <span className="truncate">Home</span>
      </Link>

      <Link
        to="/today-tips-and-predictions"
        className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1 text-[10px] sm:text-[11px] font-semibold transition text-center min-w-0 ${
          path === '/today-tips-and-predictions' ? 'text-[#8D0E83] font-bold' : 'text-gray-500 hover:text-gray-800'
        }`}
      >
        <i className="fas fa-bolt text-base"></i>
        <span className="truncate">Today</span>
      </Link>

      <Link
        to="/jackpot-predictions"
        className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1 text-[10px] sm:text-[11px] font-semibold transition text-center min-w-0 ${
          path.startsWith('/jackpot') ? 'text-[#8D0E83] font-bold' : 'text-gray-500 hover:text-gray-800'
        }`}
      >
        <i className="fas fa-trophy text-base"></i>
        <span className="truncate">Jackpots</span>
      </Link>

      <button
        onClick={onOpenVipModal}
        className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1 text-[10px] sm:text-[11px] font-black text-[#d97706] hover:text-[#b45309] transition cursor-pointer text-center min-w-0"
      >
        <i className="fas fa-crown text-base"></i>
        <span className="truncate">VIP</span>
      </button>

      {/* Menu Drawer Toggle Button for Smaller Screens */}
      {onToggleSidebar && (
        <button
          onClick={onToggleSidebar}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1 text-[10px] sm:text-[11px] font-bold transition cursor-pointer text-center min-w-0 ${
            isSidebarOpen ? 'text-[#8D0E83]' : 'text-gray-600 hover:text-[#8D0E83]'
          }`}
          aria-label="Toggle All Categories & Jackpots Menu"
        >
          <i className={`fas ${isSidebarOpen ? 'fa-times' : 'fa-bars'} text-base`}></i>
          <span className="truncate">Menu</span>
        </button>
      )}
    </nav>
  );
};
