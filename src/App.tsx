/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { LoanParams, SoraBenchmarkType, SoraRateRecord, BankPackage } from './types/sora';
import { DEFAULT_MAS_SORA_DATA, fetchMasSoraRates } from './services/masSoraService';
import { calculateSoraLoan, exportAmortizationCSV, formatSGD } from './utils/calculator';
import { Header } from './components/Header';
import { MasRateBanner } from './components/MasRateBanner';
import { LoanCalculatorForm } from './components/LoanCalculatorForm';
import { PaymentSummaryCard } from './components/PaymentSummaryCard';
import { AmortizationScheduleTable } from './components/AmortizationScheduleTable';
import { MasRatesExplorer } from './components/MasRatesExplorer';
import { MasFormulaExplainer } from './components/MasFormulaExplainer';
import { BankPackageComparison } from './components/BankPackageComparison';
import { TdsrCalculator } from './components/TdsrCalculator';
import { Check, Info, FileSpreadsheet, Landmark, HelpCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'rates' | 'formula' | 'packages' | 'tdsr'>('calculator');
  const [ratesData, setRatesData] = useState<SoraRateRecord[]>(DEFAULT_MAS_SORA_DATA);
  const [selectedRecord, setSelectedRecord] = useState<SoraRateRecord>(DEFAULT_MAS_SORA_DATA[0]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLiveApi, setIsLiveApi] = useState(false);
  const [sourceText, setSourceText] = useState('MAS Certified SORA Benchmark Dataset (Actual/365)');
  const [lastUpdated, setLastUpdated] = useState('09:00 SGT (MAS Daily 9AM Release)');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activePackageId, setActivePackageId] = useState<string | undefined>('dbs-3m-sora');

  // Initial Loan Parameters (Standard Singapore Home Loan: SGD 800,000, 25-yr, 3M SORA)
  const [loanParams, setLoanParams] = useState<LoanParams>({
    loanAmount: 800000,
    tenureYears: 25,
    benchmarkType: '3M',
    customBenchmarkRate: DEFAULT_MAS_SORA_DATA[0].compounded3M,
    bankMargin: 0.70,
    interestCalculationMode: 'in_arrear',
    stressTestFloorRate: 4.00,
    borrowerMonthlyIncome: 12000,
    otherMonthlyDebt: 800,
  });

  // Fetch live MAS rates on initial load
  useEffect(() => {
    let isMounted = true;
    async function loadMasRates() {
      const result = await fetchMasSoraRates();
      if (isMounted && result.data.length > 0) {
        setRatesData(result.data);
        setSelectedRecord(result.data[0]);
        setIsLiveApi(result.isLive);
        setSourceText(result.sourceText);
        setLastUpdated(result.lastUpdated);
      }
    }
    loadMasRates();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefreshRates = async () => {
    setIsRefreshing(true);
    const result = await fetchMasSoraRates();
    setRatesData(result.data);
    setSelectedRecord(result.data[0]);
    setIsLiveApi(result.isLive);
    setSourceText(result.sourceText);
    setLastUpdated(result.lastUpdated);
    setIsRefreshing(false);
    showToast('Updated MAS Benchmark Rates');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Determine active benchmark rate based on selection
  const effectiveBenchmarkRate = useMemo(() => {
    switch (loanParams.benchmarkType) {
      case '1M':
        return selectedRecord.compounded1M;
      case '3M':
        return selectedRecord.compounded3M;
      case '6M':
        return selectedRecord.compounded6M;
      case 'SPOT':
        return selectedRecord.soraRate;
      case 'CUSTOM':
        return loanParams.customBenchmarkRate;
      default:
        return selectedRecord.compounded3M;
    }
  }, [loanParams.benchmarkType, loanParams.customBenchmarkRate, selectedRecord]);

  // Compute full loan details
  const calculationResult = useMemo(() => {
    return calculateSoraLoan(loanParams, effectiveBenchmarkRate);
  }, [loanParams, effectiveBenchmarkRate]);

  // Handle parameter updates
  const handleUpdateParams = (updates: Partial<LoanParams>) => {
    setLoanParams((prev) => ({ ...prev, ...updates }));
  };

  // Handle applying a commercial bank package
  const handleApplyBankPackage = (pkg: BankPackage) => {
    setActivePackageId(pkg.id);
    if (pkg.tenureType === 'HDB Concessionary') {
      setLoanParams((prev) => ({
        ...prev,
        benchmarkType: 'CUSTOM',
        customBenchmarkRate: 0,
        bankMargin: 2.60,
      }));
    } else {
      setLoanParams((prev) => ({
        ...prev,
        benchmarkType: pkg.benchmark,
        bankMargin: pkg.marginYear1To3,
      }));
    }
    showToast(`Applied ${pkg.bank} package: +${pkg.marginYear1To3.toFixed(2)}% margin`);
    setActiveTab('calculator');
  };

  // Export CSV
  const handleExportCsv = () => {
    exportAmortizationCSV(
      calculationResult.amortizationMonthly,
      loanParams.loanAmount,
      calculationResult.effectiveRate
    );
    showToast('Downloaded Amortization Schedule CSV');
  };

  // Scroll to amortization table
  const scrollToAmortization = () => {
    const el = document.getElementById('amortization-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* 1. Header with Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExport={handleExportCsv}
        onRefreshRates={handleRefreshRates}
        isRefreshing={isRefreshing}
        isLiveApi={isLiveApi}
      />

      {/* 2. MAS Benchmark Live Bar */}
      <MasRateBanner
        latestRecord={selectedRecord}
        selectedBenchmark={loanParams.benchmarkType}
        onSelectBenchmark={(type: SoraBenchmarkType) => handleUpdateParams({ benchmarkType: type })}
        isLive={isLiveApi}
        sourceText={sourceText}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-medium flex items-center gap-2 transition-all">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 3. Main Workspace Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: Calculator Main Dashboard */}
        {activeTab === 'calculator' && (
          <div className="space-y-8">
            {/* Context Header */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Singapore SORA Mortgage &amp; Loan Calculator
              </h1>
              <p className="text-sm text-slate-600 mt-1 max-w-3xl">
                Accurate Singapore Dollar interest calculation using Monetary Authority of Singapore
                (MAS) overnight volume-weighted rates, standard Actual/365 day-count convention, and
                bank margin pricing.
              </p>
            </div>

            {/* Split Grid: Form (Left) & Payment Summary (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7">
                <LoanCalculatorForm
                  params={loanParams}
                  onChangeParams={handleUpdateParams}
                  latestRateRecord={selectedRecord}
                  effectiveBenchmarkRate={effectiveBenchmarkRate}
                />
              </div>

              <div className="lg:col-span-5 sticky top-24">
                <PaymentSummaryCard
                  result={calculationResult}
                  params={loanParams}
                  onViewTdsr={() => setActiveTab('tdsr')}
                  onViewAmortization={scrollToAmortization}
                />
              </div>
            </div>

            {/* Amortization Schedule Section */}
            <div id="amortization-section" className="pt-4">
              <AmortizationScheduleTable
                yearlySummary={calculationResult.amortizationYearly}
                monthlySchedule={calculationResult.amortizationMonthly}
                loanAmount={loanParams.loanAmount}
                effectiveRate={calculationResult.effectiveRate}
                onExportCsv={handleExportCsv}
              />
            </div>
          </div>
        )}

        {/* TAB 2: MAS Overnight Rates Explorer */}
        {activeTab === 'rates' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                MAS Daily Overnight &amp; Compounded SORA Series
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Historical benchmark rates administered and published daily at 9:00 AM by the Monetary Authority of Singapore.
              </p>
            </div>

            <MasRatesExplorer
              records={ratesData}
              selectedDate={selectedRecord.date}
              onSelectDate={(rec) => {
                setSelectedRecord(rec);
                showToast(`Applied SORA rates for ${rec.date}`);
              }}
              isLive={isLiveApi}
              sourceText={sourceText}
              lastUpdated={lastUpdated}
            />
          </div>
        )}

        {/* TAB 3: MAS Compounding Formula Engine */}
        {activeTab === 'formula' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                MAS Compounding Formula &amp; Methodology
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Learn how MAS computes 1M, 3M, and 6M Compounded SORA using Actual/365 day count convention and Friday weekend carryovers.
              </p>
            </div>

            <MasFormulaExplainer />
          </div>
        )}

        {/* TAB 4: Bank Packages Comparison */}
        {activeTab === 'packages' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Singapore Commercial Bank SORA Packages
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Compare benchmark margins, lock-in periods, and monthly payments across major Singapore lenders.
              </p>
            </div>

            <BankPackageComparison
              loanAmount={loanParams.loanAmount}
              tenureYears={loanParams.tenureYears}
              latestRecord={selectedRecord}
              onApplyPackage={handleApplyBankPackage}
              activePackageId={activePackageId}
            />
          </div>
        )}

        {/* TAB 5: MAS TDSR & MSR Rules */}
        {activeTab === 'tdsr' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                MAS Total Debt Servicing Ratio (TDSR)
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Verify loan affordability under Singapore central bank regulations with the mandatory 4.00% stress-test interest floor.
              </p>
            </div>

            <TdsrCalculator
              result={calculationResult}
              params={loanParams}
              onChangeParams={handleUpdateParams}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Singapore SORA Calculator</span>
            <span aria-hidden="true">·</span>
            <span>MAS Official Compounding Formula</span>
            <span aria-hidden="true">·</span>
            <span>Actual/365 Day Count</span>
          </div>

          <div className="text-slate-400 text-center sm:text-right">
            Interest rates and calculations adhere to Association of Banks in Singapore (ABS) &amp; MAS standard market conventions.
          </div>
        </div>
      </footer>
    </div>
  );
}
