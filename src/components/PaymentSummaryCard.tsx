import React from 'react';
import { CalculationResult, LoanParams } from '../types/sora';
import { formatSGD } from '../utils/calculator';
import { TrendingUp, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';

interface PaymentSummaryCardProps {
  result: CalculationResult;
  params: LoanParams;
  onViewTdsr: () => void;
  onViewAmortization: () => void;
}

export const PaymentSummaryCard: React.FC<PaymentSummaryCardProps> = ({
  result,
  params,
  onViewTdsr,
  onViewAmortization,
}) => {
  const principalPercent = (params.loanAmount / result.totalRepayment) * 100;
  const interestPercent = (result.totalInterest / result.totalRepayment) * 100;

  return (
    <div className="space-y-4">
      {/* Primary Result Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Estimated Monthly Payment
          </span>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono tabular-nums">
            <span>Effective Rate:</span>
            <span className="font-bold text-slate-900 text-sm">
              {result.effectiveRate.toFixed(4)}% p.a.
            </span>
          </div>
        </div>

        {/* Big hero number */}
        <div className="my-5">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-medium text-slate-400">SGD</span>
            <span className="text-4xl sm:text-5xl font-extrabold font-mono tabular-nums tracking-tight text-slate-900">
              {result.monthlyPayment.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-500 font-medium">/ month</span>
          </div>

          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
            <span>MAS Benchmark {result.benchmarkRate.toFixed(4)}%</span>
            <span aria-hidden="true">+</span>
            <span>Bank Margin {result.bankMargin.toFixed(2)}%</span>
            <span aria-hidden="true">·</span>
            <span>{params.tenureYears} Years Tenure</span>
          </div>
        </div>

        {/* Breakdown bar */}
        <div className="pt-2 pb-4">
          <div className="flex justify-between text-xs mb-1.5 font-medium">
            <span className="text-slate-700">
              Principal: {principalPercent.toFixed(1)}% ({formatSGD(params.loanAmount)})
            </span>
            <span className="text-amber-800">
              Interest: {interestPercent.toFixed(1)}% ({formatSGD(result.totalInterest)})
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
            <div
              className="bg-slate-900 h-full transition-all duration-300"
              style={{ width: `${principalPercent}%` }}
              title={`Principal: ${formatSGD(params.loanAmount)}`}
            />
            <div
              className="bg-amber-600 h-full transition-all duration-300"
              style={{ width: `${interestPercent}%` }}
              title={`Interest: ${formatSGD(result.totalInterest)}`}
            />
          </div>
        </div>

        {/* Secondary Financial Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-[11px] font-medium text-slate-500">Daily Interest Accrual</div>
            <div className="font-mono tabular-nums text-sm font-bold text-slate-900 mt-0.5">
              {formatSGD(result.dailyInterestCost, true)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Actual/365 convention</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-[11px] font-medium text-slate-500">Total Interest Paid</div>
            <div className="font-mono tabular-nums text-sm font-bold text-slate-900 mt-0.5">
              {formatSGD(result.totalInterest)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Across {params.tenureYears} years</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg col-span-2 sm:col-span-1">
            <div className="text-[11px] font-medium text-slate-500">Total Repayment</div>
            <div className="font-mono tabular-nums text-sm font-bold text-slate-900 mt-0.5">
              {formatSGD(result.totalRepayment)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Principal + Interest</div>
          </div>
        </div>

        {/* Action link */}
        <div className="mt-4 pt-3 flex justify-end">
          <button
            onClick={onViewAmortization}
            className="text-xs font-semibold text-slate-900 hover:text-slate-700 flex items-center gap-1 transition-colors"
          >
            <span>View Complete Amortization Schedule</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* MAS Regulatory Stress Test Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                MAS Regulatory Stress Test (Floor: {result.stressTestRate.toFixed(2)}%)
              </h3>
              <p className="text-[11px] text-slate-500">
                Monetary Authority of Singapore TDSR underwriting requirement
              </p>
            </div>
          </div>
          <button
            onClick={onViewTdsr}
            className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 underline whitespace-nowrap"
          >
            TDSR Calculator
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-100">
          <div>
            <div className="text-[11px] text-slate-500">Stress Test Instalment</div>
            <div className="font-mono tabular-nums text-sm font-bold text-slate-900 mt-0.5">
              {formatSGD(result.stressTestMonthlyPayment)}
            </div>
            <div className="text-[10px] text-slate-400">At {result.stressTestRate.toFixed(2)}% p.a.</div>
          </div>

          <div>
            <div className="text-[11px] text-slate-500">Monthly Stress Buffer</div>
            <div className="font-mono tabular-nums text-sm font-bold text-amber-700 mt-0.5">
              +{formatSGD(result.stressTestDifference)}
            </div>
            <div className="text-[10px] text-slate-400">Potential rate spike cushion</div>
          </div>

          <div>
            <div className="text-[11px] text-slate-500">Min. Monthly Income (TDSR)</div>
            <div className="font-mono tabular-nums text-sm font-bold text-slate-900 mt-0.5">
              {formatSGD(result.tdsrRequiredIncome)}
            </div>
            <div className="text-[10px] text-slate-400">Max 55% debt-to-income</div>
          </div>
        </div>
      </div>
    </div>
  );
};
