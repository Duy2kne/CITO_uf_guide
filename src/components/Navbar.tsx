import React from 'react';
import { BookOpen, Cpu } from 'lucide-react';

interface NavbarProps {
  activePage: 'manual' | 'simulator';
  setActivePage: (page: 'manual' | 'simulator') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activePage, setActivePage }) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-6">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setActivePage('manual')}
          className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 hover:text-cyan-400 transition-colors"
        >
          <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
          <span className="font-display hidden xs:inline sm:inline">CITO UF SYSTEM</span>
          <span className="font-display xs:hidden sm:hidden">CITO UF</span>
        </button>

        {/* Zone 2: Exactly 2 clean single-line nav links */}
        <nav className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm font-medium text-slate-300">
          <button
            onClick={() => setActivePage('manual')}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 sm:py-1.5 ${
              activePage === 'manual'
                ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400'
                : 'hover:text-white border-b-2 border-transparent'
            }`}
          >
            <BookOpen className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            <span className="hidden sm:inline">Sổ Tay Hướng Dẫn</span>
            <span className="sm:hidden">Hướng Dẫn</span>
          </button>

          <button
            onClick={() => setActivePage('simulator')}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 sm:py-1.5 ${
              activePage === 'simulator'
                ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400'
                : 'hover:text-white border-b-2 border-transparent'
            }`}
          >
            <Cpu className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            <span className="hidden sm:inline">Giả Lập Tính Năng</span>
            <span className="sm:hidden">Giả Lập</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action button */}
        <div className="flex items-center shrink-0">
          <button
            onClick={() => setActivePage(activePage === 'manual' ? 'simulator' : 'manual')}
            className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md shadow-cyan-500/20 whitespace-nowrap shrink-0 flex items-center gap-1 sm:gap-1.5"
          >
            {activePage === 'manual' ? (
              <>
                <Cpu className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                <span className="hidden sm:inline">Mở Giả Lập</span>
                <span className="sm:hidden">Giả Lập</span>
              </>
            ) : (
              <>
                <BookOpen className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                <span className="hidden sm:inline">Xem Hướng Dẫn</span>
                <span className="sm:hidden">Hướng Dẫn</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
