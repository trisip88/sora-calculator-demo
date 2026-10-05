import React from 'react';
import { Download, RefreshCw, Landmark } from 'lucide-react';

interface HeaderProps {
  activeTab: 'calculator' | 'rates' | 'formula' | 'packages' | 'tdsr';
  setActiveTab: (tab: 'calculator' | 'rates' | 'formula' | 'packages' | 'tdsr') => void;
  onExport: () => void;
  onRefreshRates: () => void;
  isRefreshing: boolean;
  isLiveApi: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onExport,
  onRefreshRates,
  isRefreshing,
  isLiveApi,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('calculator');
            }}
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900 group"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              SG
            </div>
            <span>SORA Calculator</span>
          </a>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`transition-colors pb-0.5 ${
                activeTab === 'calculator'
                  ? 'text-slate-900 border-b-2 border-slate-900 font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              Calculator
            </button>
            <button
              onClick={() => setActiveTab('rates')}
              className={`transition-colors pb-0.5 ${
                activeTab === 'rates'
                  ? 'text-slate-900 border-b-2 border-slate-900 font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              MAS Overnight Rates
            </button>
            <button
              onClick={() => setActiveTab('formula')}
              className={`transition-colors pb-0.5 ${
                activeTab === 'formula'
                  ? 'text-slate-900 border-b-2 border-slate-900 font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              MAS Compounding Engine
            </button>
            <button
              onClick={() => setActiveTab('packages')}
              className={`transition-colors pb-0.5 ${
                activeTab === 'packages'
                  ? 'text-slate-900 border-b-2 border-slate-900 font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              Bank Packages
            </button>
            <button
              onClick={() => setActiveTab('tdsr')}
              className={`transition-colors pb-0.5 ${
                activeTab === 'tdsr'
                  ? 'text-slate-900 border-b-2 border-slate-900 font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              MAS TDSR Rules
            </button>
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onRefreshRates}
              disabled={isRefreshing}
              title="Refresh MAS benchmark data"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-60 whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh MAS</span>
            </button>

            <button
              onClick={onExport}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
