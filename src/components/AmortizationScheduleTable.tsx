import React, { useState } from 'react';
import { AmortizationPayment, YearlyAmortizationSummary } from '../types/sora';
import { formatSGD } from '../utils/calculator';
import { Download, ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface AmortizationScheduleTableProps {
  yearlySummary: YearlyAmortizationSummary[];
  monthlySchedule: AmortizationPayment[];
  loanAmount: number;
  effectiveRate: number;
  onExportCsv: () => void;
}

export const AmortizationScheduleTable: React.FC<AmortizationScheduleTableProps> = ({
  yearlySummary,
  monthlySchedule,
  loanAmount,
  effectiveRate,
  onExportCsv,
}) => {
  const [viewMode, setViewMode] = useState<'yearly' | 'monthly'>('yearly');
  const [selectedYearFilter, setSelectedYearFilter] = useState<number | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filter monthly payments based on selected year
  const filteredMonthly = selectedYearFilter === 'ALL'
    ? monthlySchedule
    : monthlySchedule.filter((m) => m.year === selectedYearFilter);

  const totalPages = Math.ceil(filteredMonthly.length / itemsPerPage);
  const paginatedMonthly = filteredMonthly.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header bar */}
      <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Amortization & Interest Breakdown
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete repayment timeline calculated at {effectiveRate.toFixed(4)}% p.a. (Actual/365)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setViewMode('yearly')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'yearly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Yearly Summary
            </button>
            <button
              onClick={() => {
                setViewMode('monthly');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'monthly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Schedule
            </button>
          </div>

          {/* Export CSV button */}
          <button
            onClick={onExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Sub-filter bar for Monthly view */}
      {viewMode === 'monthly' && (
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Filter by Year:</span>
            <select
              value={selectedYearFilter}
              onChange={(e) => {
                setSelectedYearFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-md text-slate-800 font-medium focus:outline-none"
            >
              <option value="ALL">All Years ({yearlySummary.length} yrs)</option>
              {yearlySummary.map((y) => (
                <option key={y.year} value={y.year}>
                  Year {y.year}
                </option>
              ))}
            </select>
          </div>

          <div className="text-slate-500 font-mono tabular-nums">
            Showing {(currentPage - 1) * itemsPerPage + 1} -{' '}
            {Math.min(currentPage * itemsPerPage, filteredMonthly.length)} of{' '}
            {filteredMonthly.length} months
          </div>
        </div>
      )}

      {/* Table content */}
      <div className="overflow-x-auto">
        {viewMode === 'yearly' ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4 text-right">Starting Principal</th>
                <th className="py-3 px-4 text-right">Annual Instalment</th>
                <th className="py-3 px-4 text-right">Principal Repaid</th>
                <th className="py-3 px-4 text-right">Interest Paid</th>
                <th className="py-3 px-4 text-right">Ending Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {yearlySummary.map((row) => (
                <tr key={row.year} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    Year {row.year}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                    {formatSGD(row.startingBalance)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900 font-semibold">
                    {formatSGD(row.totalPayment)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-800">
                    {formatSGD(row.principalPaid)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-amber-700 font-medium">
                    {formatSGD(row.interestPaid)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900 font-semibold">
                    {formatSGD(row.endingBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Month</th>
                <th className="py-3 px-4">Year</th>
                <th className="py-3 px-4 text-right">Monthly Payment</th>
                <th className="py-3 px-4 text-right">Principal</th>
                <th className="py-3 px-4 text-right">Interest</th>
                <th className="py-3 px-4 text-right">Remaining Balance</th>
                <th className="py-3 px-4 text-right">Total Interest to Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedMonthly.map((m) => (
                <tr key={m.month} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono tabular-nums font-semibold text-slate-900">
                    Month {m.month}
                  </td>
                  <td className="py-3 px-4 text-slate-600">Year {m.year}</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                    {formatSGD(m.payment, true)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                    {formatSGD(m.principal, true)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-amber-700 font-medium">
                    {formatSGD(m.interest, true)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900 font-semibold">
                    {formatSGD(m.remainingBalance, true)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500">
                    {formatSGD(m.cumulativeInterest, true)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination controls for Monthly view */}
      {viewMode === 'monthly' && totalPages > 1 && (
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
