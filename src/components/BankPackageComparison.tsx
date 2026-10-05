import React from 'react';
import { BankPackage, SoraRateRecord } from '../types/sora';
import { SINGAPORE_BANK_PACKAGES } from '../data/bankPackages';
import { formatSGD } from '../utils/calculator';
import { Check, ArrowRight } from 'lucide-react';

interface BankPackageComparisonProps {
  loanAmount: number;
  tenureYears: number;
  latestRecord: SoraRateRecord;
  onApplyPackage: (pkg: BankPackage) => void;
  activePackageId?: string;
}

export const BankPackageComparison: React.FC<BankPackageComparisonProps> = ({
  loanAmount,
  tenureYears,
  latestRecord,
  onApplyPackage,
  activePackageId,
}) => {
  // Helper to calculate monthly payment for a package
  const calculatePackagePayment = (pkg: BankPackage) => {
    let baseRate = 0;
    if (pkg.benchmark === '3M') baseRate = latestRecord.compounded3M;
    else if (pkg.benchmark === '1M') baseRate = latestRecord.compounded1M;
    else if (pkg.benchmark === '6M') baseRate = latestRecord.compounded6M;
    else if (pkg.benchmark === 'SPOT') baseRate = latestRecord.soraRate;
    else baseRate = 0; // Fixed packages like HDB use marginYear1To3 as total rate

    const effective = pkg.tenureType === 'HDB Concessionary'
      ? pkg.marginYear1To3
      : baseRate + pkg.marginYear1To3;

    const monthlyRate = effective / 100 / 12;
    const totalMonths = tenureYears * 12;

    const monthlyPmt =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);

    return {
      effectiveRate: effective,
      monthlyPayment: monthlyPmt,
    };
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Singapore Bank Mortgage Packages Comparison
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare real commercial floating SORA loan spreads against S${(loanAmount / 1000).toFixed(0)}k principal
          </p>
        </div>
        <div className="text-xs text-slate-500 font-mono tabular-nums">
          Current 3M SORA: <strong className="text-slate-900">{latestRecord.compounded3M.toFixed(4)}%</strong>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SINGAPORE_BANK_PACKAGES.map((pkg) => {
          const { effectiveRate, monthlyPayment } = calculatePackagePayment(pkg);
          const isActive = activePackageId === pkg.id;

          return (
            <div
              key={pkg.id}
              className={`rounded-xl border p-4 transition-all flex flex-col justify-between ${
                isActive
                  ? 'border-slate-900 ring-1 ring-slate-900 bg-slate-50/50'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    {pkg.bank}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {pkg.lockInYears > 0 ? `${pkg.lockInYears}-Yr Lock-in` : 'No Lock-in'}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-slate-900 mt-1">
                  {pkg.name}
                </h3>

                <div className="my-3 py-2.5 px-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500">Effective Rate</span>
                    <span className="font-mono tabular-nums text-sm font-bold text-slate-900">
                      {effectiveRate.toFixed(3)}% p.a.
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500">Monthly Payment</span>
                    <span className="font-mono tabular-nums text-sm font-bold text-slate-900">
                      {formatSGD(monthlyPayment)}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1 mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Spread Yr 1&ndash;3:</span>
                    <span className="font-mono tabular-nums font-semibold">
                      {pkg.tenureType === 'HDB Concessionary' ? '2.60% Fixed' : `+${pkg.marginYear1To3.toFixed(2)}%`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Thereafter Spread:</span>
                    <span className="font-mono tabular-nums font-semibold">
                      {pkg.tenureType === 'HDB Concessionary' ? '2.60% Fixed' : `+${pkg.marginThereafter.toFixed(2)}%`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 line-clamp-2">
                    {pkg.notes}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onApplyPackage(pkg)}
                className={`w-full py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                }`}
              >
                {isActive ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Applied to Calculator</span>
                  </>
                ) : (
                  <>
                    <span>Apply Package</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
