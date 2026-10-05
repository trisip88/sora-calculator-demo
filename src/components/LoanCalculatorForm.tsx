import React from 'react';
import { LoanParams, SoraBenchmarkType, SoraRateRecord } from '../types/sora';
import { formatSGD } from '../utils/calculator';
import { Sliders, HelpCircle, ShieldCheck } from 'lucide-react';

interface LoanCalculatorFormProps {
  params: LoanParams;
  onChangeParams: (newParams: Partial<LoanParams>) => void;
  latestRateRecord: SoraRateRecord;
  effectiveBenchmarkRate: number;
}

export const LoanCalculatorForm: React.FC<LoanCalculatorFormProps> = ({
  params,
  onChangeParams,
  latestRateRecord,
  effectiveBenchmarkRate,
}) => {
  const loanPresets = [
    { label: 'S$ 500k', value: 500000, desc: 'HDB 4-Room' },
    { label: 'S$ 800k', value: 800000, desc: 'HDB 5-Room / EC' },
    { label: 'S$ 1.2M', value: 1200000, desc: 'OCR Condo' },
    { label: 'S$ 1.8M', value: 1800000, desc: 'CCR / RCR Condo' },
  ];

  const tenurePresets = [15, 20, 25, 30];
  const marginPresets = [0.60, 0.65, 0.70, 0.75, 0.85];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Mortgage Loan Parameters</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure principal, tenure, benchmark tenor, and bank margins
          </p>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Singapore Actual/365</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* 1. Loan Amount */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="loanAmount" className="text-xs font-semibold text-slate-700">
              Loan Amount (Principal)
            </label>
            <span className="font-mono tabular-nums text-sm font-bold text-slate-900">
              {formatSGD(params.loanAmount)}
            </span>
          </div>

          <div className="relative mb-3">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
              SGD
            </span>
            <input
              id="loanAmount"
              type="number"
              min={10000}
              max={10000000}
              step={10000}
              value={params.loanAmount}
              onChange={(e) => onChangeParams({ loanAmount: Math.max(0, Number(e.target.value)) })}
              className="w-full pl-14 pr-4 py-2.5 text-sm font-mono tabular-nums font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors"
            />
          </div>

          {/* Slider */}
          <input
            type="range"
            min={100000}
            max={3000000}
            step={25000}
            value={params.loanAmount}
            onChange={(e) => onChangeParams({ loanAmount: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900 mb-3"
          />

          {/* Quick presets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {loanPresets.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => onChangeParams({ loanAmount: p.value })}
                className={`py-1.5 px-2 text-xs rounded-lg border text-center transition-colors ${
                  params.loanAmount === p.value
                    ? 'border-slate-900 bg-slate-900 text-white font-medium'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold">{p.label}</div>
                <div className={`text-[10px] ${params.loanAmount === p.value ? 'text-slate-300' : 'text-slate-400'}`}>
                  {p.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Loan Tenure */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="tenure" className="text-xs font-semibold text-slate-700">
              Loan Tenure (Years)
            </label>
            <span className="font-mono tabular-nums text-sm font-bold text-slate-900">
              {params.tenureYears} Years ({params.tenureYears * 12} Months)
            </span>
          </div>

          <input
            type="range"
            min={5}
            max={35}
            step={1}
            value={params.tenureYears}
            onChange={(e) => onChangeParams({ tenureYears: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900 mb-2.5"
          />

          <div className="flex items-center gap-2">
            {tenurePresets.map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => onChangeParams({ tenureYears: yr })}
                className={`flex-1 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                  params.tenureYears === yr
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                {yr} Years
              </button>
            ))}
          </div>
        </div>

        {/* 3. Benchmark Selection & Custom Rate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <span>MAS SORA Benchmark Tenor</span>
              <span className="text-[11px] text-slate-400 font-normal">
                (Standard: 3M Compounded)
              </span>
            </label>
            <span className="font-mono tabular-nums text-xs font-semibold text-slate-800">
              Base: {effectiveBenchmarkRate.toFixed(4)}% p.a.
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2.5">
            <button
              type="button"
              onClick={() => onChangeParams({ benchmarkType: '3M' })}
              className={`p-2 rounded-lg border text-left transition-colors ${
                params.benchmarkType === '3M'
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-bold">3M Compounded</div>
              <div className="font-mono tabular-nums text-[11px] mt-0.5 opacity-90">
                {latestRateRecord.compounded3M.toFixed(4)}%
              </div>
            </button>

            <button
              type="button"
              onClick={() => onChangeParams({ benchmarkType: '1M' })}
              className={`p-2 rounded-lg border text-left transition-colors ${
                params.benchmarkType === '1M'
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-bold">1M Compounded</div>
              <div className="font-mono tabular-nums text-[11px] mt-0.5 opacity-90">
                {latestRateRecord.compounded1M.toFixed(4)}%
              </div>
            </button>

            <button
              type="button"
              onClick={() => onChangeParams({ benchmarkType: '6M' })}
              className={`p-2 rounded-lg border text-left transition-colors ${
                params.benchmarkType === '6M'
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-bold">6M Compounded</div>
              <div className="font-mono tabular-nums text-[11px] mt-0.5 opacity-90">
                {latestRateRecord.compounded6M.toFixed(4)}%
              </div>
            </button>

            <button
              type="button"
              onClick={() => onChangeParams({ benchmarkType: 'SPOT' })}
              className={`p-2 rounded-lg border text-left transition-colors ${
                params.benchmarkType === 'SPOT'
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-bold">Overnight Spot</div>
              <div className="font-mono tabular-nums text-[11px] mt-0.5 opacity-90">
                {latestRateRecord.soraRate.toFixed(4)}%
              </div>
            </button>
          </div>

          {/* Custom Benchmark Rate Override */}
          {params.benchmarkType === 'CUSTOM' && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <label htmlFor="customBenchmark" className="text-xs font-semibold text-slate-700 block mb-1">
                Custom Benchmark Rate (% p.a.)
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="customBenchmark"
                  type="number"
                  step={0.01}
                  min={0}
                  max={15}
                  value={params.customBenchmarkRate}
                  onChange={(e) => onChangeParams({ customBenchmarkRate: Number(e.target.value) })}
                  className="flex-1 px-3 py-1.5 text-xs font-mono tabular-nums font-semibold bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <button
                  type="button"
                  onClick={() => onChangeParams({ customBenchmarkRate: latestRateRecord.compounded3M })}
                  className="text-xs text-slate-600 hover:text-slate-900 underline underline-offset-2 whitespace-nowrap"
                >
                  Reset to MAS 3M
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 4. Bank Margin / Spread */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="bankMargin" className="text-xs font-semibold text-slate-700">
              Bank Margin / Spread (% p.a.)
            </label>
            <span className="font-mono tabular-nums text-sm font-bold text-slate-900">
              +{params.bankMargin.toFixed(2)}%
            </span>
          </div>

          <div className="flex items-center gap-3 mb-2.5">
            <input
              type="range"
              min={0.10}
              max={2.50}
              step={0.05}
              value={params.bankMargin}
              onChange={(e) => onChangeParams({ bankMargin: Number(e.target.value) })}
              className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
            />
            <div className="w-20">
              <input
                id="bankMargin"
                type="number"
                min={0}
                max={10}
                step={0.05}
                value={params.bankMargin}
                onChange={(e) => onChangeParams({ bankMargin: Number(e.target.value) })}
                className="w-full px-2 py-1 text-xs font-mono tabular-nums font-semibold text-right bg-slate-50 border border-slate-200 rounded-md"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 mr-1">Typical Spreads:</span>
            {marginPresets.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onChangeParams({ bankMargin: m })}
                className={`px-2.5 py-1 text-xs font-mono tabular-nums rounded-md border transition-colors ${
                  Math.abs(params.bankMargin - m) < 0.001
                    ? 'border-slate-900 bg-slate-900 text-white font-medium'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                +{m.toFixed(2)}%
              </button>
            ))}
          </div>
        </div>

        {/* 5. Calculation Convention & MAS Stress Test */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Interest Calculation Timing
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onChangeParams({ interestCalculationMode: 'in_arrear' })}
                className={`flex-1 py-1.5 px-2 text-center rounded-lg border transition-colors ${
                  params.interestCalculationMode === 'in_arrear'
                    ? 'border-slate-900 bg-slate-900 text-white font-medium'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                In Arrear (Standard)
              </button>
              <button
                type="button"
                onClick={() => onChangeParams({ interestCalculationMode: 'in_advance' })}
                className={`flex-1 py-1.5 px-2 text-center rounded-lg border transition-colors ${
                  params.interestCalculationMode === 'in_advance'
                    ? 'border-slate-900 bg-slate-900 text-white font-medium'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                In Advance
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              In-arrear compounds overnight rates over the actual billing quarter.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="stressTestFloor" className="font-semibold text-slate-700">
                MAS Stress-Test Floor Rate
              </label>
              <span className="font-mono tabular-nums text-slate-900 font-semibold">
                {params.stressTestFloorRate.toFixed(2)}%
              </span>
            </div>
            <input
              id="stressTestFloor"
              type="number"
              step={0.25}
              min={2.0}
              max={8.0}
              value={params.stressTestFloorRate}
              onChange={(e) => onChangeParams({ stressTestFloorRate: Number(e.target.value) })}
              className="w-full px-3 py-1.5 font-mono tabular-nums text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              MAS Notice 645 requires at least 4.00% floor for residential property TDSR.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
