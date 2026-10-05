import React from 'react';
import { SoraRateRecord } from '../types/sora';
import { formatPercent } from '../utils/calculator';
import { ArrowUpRight, Check, Calendar, Info } from 'lucide-react';

interface MasRatesExplorerProps {
  records: SoraRateRecord[];
  selectedDate: string;
  onSelectDate: (record: SoraRateRecord) => void;
  isLive: boolean;
  sourceText: string;
  lastUpdated: string;
}

export const MasRatesExplorer: React.FC<MasRatesExplorerProps> = ({
  records,
  selectedDate,
  onSelectDate,
  isLive,
  sourceText,
  lastUpdated,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              MAS Published SORA Benchmark Rates
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span>{sourceText}</span>
              <span aria-hidden="true">·</span>
              <span>Updated {lastUpdated}</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-slate-700">Actual/365 Day Count</span>
            </div>
          </div>
          <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg max-w-xs">
            Rates published daily at 9:00 AM SGT by the Monetary Authority of Singapore.
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4">Publication Date</th>
              <th className="py-3 px-4 text-right">Overnight SORA</th>
              <th className="py-3 px-4 text-right">1M Compounded</th>
              <th className="py-3 px-4 text-right">3M Compounded</th>
              <th className="py-3 px-4 text-right">6M Compounded</th>
              <th className="py-3 px-4 text-right">Volume (S$B)</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
            {records.map((rec) => {
              const isSelected = selectedDate === rec.date;
              return (
                <tr
                  key={rec.date}
                  className={`transition-colors ${
                    isSelected ? 'bg-slate-50 font-semibold' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <td className="py-3 px-4 font-sans font-medium text-slate-900 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{rec.date}</span>
                    {isSelected && (
                      <span className="text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded font-sans font-normal">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    {formatPercent(rec.soraRate, 4)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-700">
                    {formatPercent(rec.compounded1M, 4)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-900 font-bold">
                    {formatPercent(rec.compounded3M, 4)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-700">
                    {formatPercent(rec.compounded6M, 4)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">
                    {rec.aggregateVolume ? `S$${rec.aggregateVolume.toFixed(2)}B` : '—'}
                  </td>
                  <td className="py-3 px-4 text-center font-sans">
                    <button
                      onClick={() => onSelectDate(rec)}
                      className={`px-2.5 py-1 text-xs rounded transition-colors ${
                        isSelected
                          ? 'bg-slate-200 text-slate-800 cursor-default'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Use Rates'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex items-start gap-2">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>About SORA:</strong> Singapore Overnight Rate Average is calculated as the
          volume-weighted average rate of unsecured overnight interbank SGD transactions brokered in
          Singapore between 8:00 AM and 6:15 PM. Singapore banks predominantly price floating-rate
          home loans against the <strong>3-Month Compounded SORA</strong> index.
        </p>
      </div>
    </div>
  );
};
