export interface SoraRateRecord {
  date: string; // YYYY-MM-DD
  soraRate: number; // Overnight rate % p.a.
  soraIndex?: number;
  compounded1M: number; // 1-month compounded SORA % p.a.
  compounded3M: number; // 3-month compounded SORA % p.a.
  compounded6M: number; // 6-month compounded SORA % p.a.
  aggregateVolume?: number; // S$ billion
  highestTransactionRate?: number;
  lowestTransactionRate?: number;
  calculationDate?: string;
}

export type SoraBenchmarkType = '3M' | '1M' | '6M' | 'SPOT' | 'CUSTOM';

export interface LoanParams {
  loanAmount: number;
  tenureYears: number;
  benchmarkType: SoraBenchmarkType;
  customBenchmarkRate: number;
  bankMargin: number;
  interestCalculationMode: 'in_arrear' | 'in_advance';
  stressTestFloorRate: number; // e.g. 4.00% for MAS residential stress test
  borrowerMonthlyIncome?: number;
  otherMonthlyDebt?: number;
}

export interface AmortizationPayment {
  month: number;
  year: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
}

export interface YearlyAmortizationSummary {
  year: number;
  startingBalance: number;
  totalPayment: number;
  principalPaid: number;
  interestPaid: number;
  endingBalance: number;
}

export interface CalculationResult {
  effectiveRate: number;
  benchmarkRate: number;
  bankMargin: number;
  monthlyPayment: number;
  totalRepayment: number;
  totalInterest: number;
  dailyInterestCost: number;
  stressTestRate: number;
  stressTestMonthlyPayment: number;
  stressTestDifference: number;
  tdsrRequiredIncome: number;
  amortizationMonthly: AmortizationPayment[];
  amortizationYearly: YearlyAmortizationSummary[];
}

export interface BankPackage {
  id: string;
  bank: string;
  name: string;
  tenureType: 'Floating (SORA)' | 'Fixed' | 'HDB Concessionary';
  benchmark: SoraBenchmarkType;
  marginYear1To3: number;
  marginThereafter: number;
  lockInYears: number;
  minLoanAmount: number;
  notes: string;
}
