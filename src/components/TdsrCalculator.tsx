import React, { useState } from 'react';
import { CalculationResult, LoanParams } from '../types/sora';
import { formatSGD } from '../utils/calculator';
import { ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';

interface TdsrCalculatorProps {
  result: CalculationResult;
  params: LoanParams;
  onChangeParams: (newParams: Partial<LoanParams>) => void;
}

export const TdsrCalculator: React.FC<TdsrCalculatorProps> = ({
  result,
  params,
  onChangeParams,
}) => {
  const [grossIncome, setGrossIncome] = useState<number>(params.borrowerMonthlyIncome || 12000);
  const [otherDebts, setOtherDebts] = useState<number>(params.otherMonthlyDebt || 800);
  const [isHdbProperty, setIsHdbProperty] = useState<boolean>(false);

  // Total debt including stress test instalment
  const totalMonthlyDebt = result.stressTestMonthlyPayment + otherDebts;
  const currentTdsr = grossIncome > 0 ? (totalMonthlyDebt / grossIncome) * 100 : 0;
  const currentMsr = grossIncome > 0 ? (result.stressTestMonthlyPayment / grossIncome) * 100 : 0;

  const passesTdsr = currentTdsr <= 55.0;
  const passesMsr = !isHdbProperty || currentMsr <= 30.0;

  const minIncomeForTdsr = (totalMonthlyDebt / 0.55);
  const minIncomeForMsr = isHdbProperty ? (result.stressTestMonthlyPayment / 0.30) : 0;

  const handleIncomeChange = (val: number) => {
    setGrossIncome(val);
    onChangeParams({ borrowerMonthlyIncome: val });
  };

  const handleDebtChange = (val: number) => {
    setOtherDebts(val);
    onChangeParams({ otherMonthlyDebt: val });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            MAS TDSR &amp; MSR Regulatory Affordability
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluated under Monetary Authority of Singapore (MAS Notice 645) 4.00% stress-test rate
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>MAS Compliance Engine</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        {/* Left: Input details */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Borrower(s) Combined Gross Monthly Income (SGD)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                SGD
              </span>
              <input
                type="number"
                min={0}
                step={500}
                value={grossIncome}
                onChange={(e) => handleIncomeChange(Math.max(0, Number(e.target.value)))}
                className="w-full pl-14 pr-4 py-2 text-xs font-mono tabular-nums font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Fixed salary 100% credited. Variable/commission discounted 30% per MAS guidelines.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Other Existing Monthly Debt Commitments (SGD)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                SGD
              </span>
              <input
                type="number"
                min={0}
                step={100}
                value={otherDebts}
                onChange={(e) => handleDebtChange(Math.max(0, Number(e.target.value)))}
                className="w-full pl-14 pr-4 py-2 text-xs font-mono tabular-nums font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Includes car loans, student loans, credit card balances, and personal credit lines.
            </p>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isHdbProperty}
                onChange={(e) => setIsHdbProperty(e.target.checked)}
                className="rounded text-slate-900 focus:ring-slate-900"
              />
              <span className="text-xs font-medium text-slate-700">
                Check Mortgage Servicing Ratio (MSR &le; 30%) for HDB Flat or Executive Condo (EC)
              </span>
            </label>
          </div>
        </div>

        {/* Right: Regulatory Status & Scores */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Total Debt Servicing Ratio (TDSR)
            </span>
            <span
              className={`text-xs font-semibold flex items-center gap-1 ${
                passesTdsr ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {passesTdsr ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              {passesTdsr ? 'Passes MAS Limit (≤ 55%)' : 'Exceeds 55% Limit'}
            </span>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs mb-1 font-mono tabular-nums">
              <span className="font-semibold text-slate-900">{currentTdsr.toFixed(1)}%</span>
              <span className="text-slate-500">Max Permitted: 55.0%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  passesTdsr ? 'bg-slate-900' : 'bg-rose-600'
                }`}
                style={{ width: `${Math.min(100, currentTdsr)}%` }}
              />
            </div>
          </div>

          {/* MSR Section if selected */}
          {isHdbProperty && (
            <div className="pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Mortgage Servicing Ratio (MSR)
                </span>
                <span
                  className={`text-xs font-semibold flex items-center gap-1 ${
                    passesMsr ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {passesMsr ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  {passesMsr ? 'Passes MSR (≤ 30%)' : 'Exceeds 30% Limit'}
                </span>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1 font-mono tabular-nums">
                  <span className="font-semibold text-slate-900">{currentMsr.toFixed(1)}%</span>
                  <span className="text-slate-500">Max Permitted: 30.0%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      passesMsr ? 'bg-slate-900' : 'bg-rose-600'
                    }`}
                    style={{ width: `${Math.min(100, currentMsr * (100 / 30))}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Breakdown summary */}
          <div className="pt-3 border-t border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Stress Test Instalment (at {result.stressTestRate.toFixed(2)}%):</span>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                {formatSGD(result.stressTestMonthlyPayment)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Other Monthly Debts:</span>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                {formatSGD(otherDebts)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Monthly Servicing:</span>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                {formatSGD(totalMonthlyDebt)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200 font-semibold">
              <span className="text-slate-800">Minimum Income Needed:</span>
              <span className="font-mono tabular-nums text-slate-900">
                {formatSGD(Math.max(minIncomeForTdsr, minIncomeForMsr))} / month
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
