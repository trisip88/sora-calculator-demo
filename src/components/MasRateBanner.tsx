import React from 'react';
import { SoraRateRecord, SoraBenchmarkType } from '../types/sora';

interface MasRateBannerProps {
  latestRecord: SoraRateRecord;
  selectedBenchmark: SoraBenchmarkType;
  onSelectBenchmark: (type: SoraBenchmarkType) => void;
  isLive: boolean;
  sourceText: string;
}

export const MasRateBanner: React.FC<MasRateBannerProps> = ({
  latestRecord,
  selectedBenchmark,
  onSelectBenchmark,
  isLive,
  sourceText,
}) => {
  return (
    <div className="bg-white border-b border-slate-200 py-3.5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Metadata line */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">MAS Official Benchmarks</span>
            <span aria-hidden="true">·</span>
            <span>Date {latestRecord.date}</span>
            <span aria-hidden="true">·</span>
            <span>Convention Actual/365</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-600 font-medium">{sourceText}</span>
          </div>

          {/* Interactive Benchmark Rates Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap mr-1">
              Select Benchmark:
            </span>

            {/* 3M SORA */}
            <button
              onClick={() => onSelectBenchmark('3M')}
              className={`flex items-baseline gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors whitespace-nowrap ${
                selectedBenchmark === '3M'
                  ? 'bg-slate-900 text-white font-medium shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span className="font-medium">3M SORA</span>
              <span className="font-mono tabular-nums text-[13px] font-semibold">
                {latestRecord.compounded3M.toFixed(4)}%
              </span>
            </button>

            {/* 1M SORA */}
            <button
              onClick={() => onSelectBenchmark('1M')}
              className={`flex items-baseline gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors whitespace-nowrap ${
                selectedBenchmark === '1M'
                  ? 'bg-slate-900 text-white font-medium shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span className="font-medium">1M SORA</span>
              <span className="font-mono tabular-nums text-[13px] font-semibold">
                {latestRecord.compounded1M.toFixed(4)}%
              </span>
            </button>

            {/* 6M SORA */}
            <button
              onClick={() => onSelectBenchmark('6M')}
              className={`flex items-baseline gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors whitespace-nowrap ${
                selectedBenchmark === '6M'
                  ? 'bg-slate-900 text-white font-medium shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span className="font-medium">6M SORA</span>
              <span className="font-mono tabular-nums text-[13px] font-semibold">
                {latestRecord.compounded6M.toFixed(4)}%
              </span>
            </button>

            {/* Overnight Spot */}
            <button
              onClick={() => onSelectBenchmark('SPOT')}
              className={`flex items-baseline gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors whitespace-nowrap ${
                selectedBenchmark === 'SPOT'
                  ? 'bg-slate-900 text-white font-medium shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span className="font-medium">Overnight Spot</span>
              <span className="font-mono tabular-nums text-[13px] font-semibold">
                {latestRecord.soraRate.toFixed(4)}%
              </span>
            </button>

            {/* Custom Option */}
            <button
              onClick={() => onSelectBenchmark('CUSTOM')}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors whitespace-nowrap font-medium ${
                selectedBenchmark === 'CUSTOM'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Custom Rate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
