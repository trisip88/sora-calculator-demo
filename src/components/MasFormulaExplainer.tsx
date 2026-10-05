import React, { useState } from 'react';
import { calculateCompoundedSoraFromDailyRates } from '../services/masSoraService';
import { BookOpen, Calculator, Info, CheckCircle2 } from 'lucide-react';

export const MasFormulaExplainer: React.FC = () => {
  // Sample 7-day period demonstrating weekend carry-over (Friday rate applies for 3 days)
  const [interactiveDays, setInteractiveDays] = useState([
    { day: 'Monday (Day 1)', rate: 2.88, calendarDays: 1 },
    { day: 'Tuesday (Day 2)', rate: 2.91, calendarDays: 1 },
    { day: 'Wednesday (Day 3)', rate: 2.87, calendarDays: 1 },
    { day: 'Thursday (Day 4)', rate: 2.90, calendarDays: 1 },
    { day: 'Friday (Day 5 - Weekend Carryover)', rate: 2.93, calendarDays: 3 },
  ]);

  const updateRate = (index: number, newRate: number) => {
    const updated = [...interactiveDays];
    updated[index].rate = newRate;
    setInteractiveDays(updated);
  };

  const simulation = calculateCompoundedSoraFromDailyRates(
    interactiveDays.map((d) => ({ rate: d.rate, calendarDaysApplied: d.calendarDays }))
  );

  return (
    <div className="space-y-6">
      {/* Official MAS Formula Overview */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
          <BookOpen className="w-5 h-5 text-slate-900" />
          <h2 className="text-base font-semibold text-slate-900">
            Official MAS Compounded SORA Methodology
          </h2>
        </div>

        <div className="mt-4 space-y-4 text-xs text-slate-700 leading-relaxed">
          <p>
            The Monetary Authority of Singapore (MAS) publishes daily SORA rates based on actual
            unsecured overnight interbank Singapore Dollar borrowing transactions (volume-weighted).
            For home loans, Singapore banks (DBS, OCBC, UOB, HSBC, Standard Chartered) use the{' '}
            <strong>Compounded SORA</strong> index (typically 1-month or 3-month compounded),
            calculated using the official MAS compounding formula:
          </p>

          {/* Mathematical Formula Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg overflow-x-auto text-center font-mono">
            <div className="text-sm font-bold text-slate-900 mb-1">
              Compounded SORA = [ &prod;<sub>i=1</sub><sup>d<sub>b</sub></sup> ( 1 +
              (SORA<sub>i</sub> &times; n<sub>i</sub>) / 365 ) &minus; 1 ] &times; ( 365 / d )
              &times; 100%
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              Convention: Singapore Money Market Standard (Actual/365, Annualized)
            </div>
          </div>

          {/* Variable definitions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-900 font-mono">d<sub>b</sub></span>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Number of business days in the compounding lookback period (~63 business days for a 3-month tenor).
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-900 font-mono">SORA<sub>i</sub></span>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Overnight rate on business day <em>i</em> published by MAS at 9:00 AM on the next business day.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-900 font-mono">n<sub>i</sub> (Calendar Days)</span>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Number of calendar days for which rate applies. Monday&ndash;Thursday have n=1; Friday has <strong>n=3</strong> to cover Saturday &amp; Sunday.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-900 font-mono">d (Total Days)</span>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Total calendar days in the period (e.g., exactly 90, 91, or 92 calendar days for 3-month SORA).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Compounding Step-by-Step Calculator */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Live Compounding Simulation &amp; Weekend Weighting
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Experiment with daily SORA rates to see how MAS weekend weighting and compounding work
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-500 block">Compounded Result</span>
            <span className="font-mono tabular-nums text-lg font-bold text-slate-900">
              {simulation.compoundedRate.toFixed(4)}% p.a.
            </span>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600">
                  <th className="py-2.5 px-3">Business Day</th>
                  <th className="py-2.5 px-3 text-right">Overnight SORA Rate (% p.a.)</th>
                  <th className="py-2.5 px-3 text-right">Weight (n<sub>i</sub> Days)</th>
                  <th className="py-2.5 px-3 text-right">Daily Factor [1 + (r &times; n / 365)]</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                {interactiveDays.map((row, idx) => {
                  const factor = 1 + (row.rate / 100 * row.calendarDays) / 365;
                  return (
                    <tr key={row.day} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-900">
                        {row.day}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          step={0.01}
                          min={0}
                          max={10}
                          value={row.rate}
                          onChange={(e) => updateRate(idx, Number(e.target.value))}
                          aria-label={`SORA Rate for ${row.day}`}
                          className="w-24 px-2 py-1 text-right bg-slate-50 border border-slate-200 rounded font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700">
                        {row.calendarDays} {row.calendarDays > 1 ? 'days (Fri+Sat+Sun)' : 'day'}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600 text-[11px]">
                        {factor.toFixed(8)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Product Calculation Result Card */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 mt-4 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Cumulative Product Factor (&prod;):</span>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                {simulation.productFactor.toFixed(8)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Total Calendar Days (d):</span>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                {simulation.totalCalendarDays} days
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200">
              <span className="text-slate-900 font-semibold">
                Annualized Compounded SORA Rate:
              </span>
              <span className="font-mono tabular-nums font-bold text-slate-900 text-sm">
                ({simulation.productFactor.toFixed(8)} &minus; 1) &times; (365 / {simulation.totalCalendarDays}) &times; 100 ={' '}
                <span className="text-emerald-700">{simulation.compoundedRate.toFixed(4)}%</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
