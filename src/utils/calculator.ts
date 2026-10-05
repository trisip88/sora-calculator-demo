import {
  AmortizationPayment,
  CalculationResult,
  LoanParams,
  YearlyAmortizationSummary,
} from '../types/sora';

/**
 * Standard amortization calculation with Actual/365 day-count convention option
 * and MAS regulatory stress test evaluations.
 */
export function calculateSoraLoan(
  params: LoanParams,
  benchmarkRate: number
): CalculationResult {
  const {
    loanAmount,
    tenureYears,
    bankMargin,
    stressTestFloorRate = 4.0,
    borrowerMonthlyIncome = 0,
    otherMonthlyDebt = 0,
  } = params;

  const effectiveRate = Math.max(0, benchmarkRate + bankMargin);
  const totalMonths = Math.max(1, Math.round(tenureYears * 12));

  // Monthly interest rate for amortization
  const monthlyRate = effectiveRate > 0 ? effectiveRate / 100 / 12 : 0;

  // Monthly instalment using standard loan annuity formula (PMT)
  let monthlyPayment = 0;
  if (monthlyRate === 0) {
    monthlyPayment = loanAmount / totalMonths;
  } else {
    monthlyPayment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
  }

  // Daily interest accrual (Actual/365 Singapore Banking convention)
  const dailyInterestCost = (loanAmount * (effectiveRate / 100)) / 365;

  // Amortization schedule generation
  const amortizationMonthly: AmortizationPayment[] = [];
  const yearlyMap = new Map<number, {
    startingBalance: number;
    totalPayment: number;
    principalPaid: number;
    interestPaid: number;
    endingBalance: number;
  }>();

  let remaining = loanAmount;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;

  for (let m = 1; m <= totalMonths; m++) {
    const year = Math.ceil(m / 12);
    const interestForMonth = remaining * monthlyRate;
    let principalForMonth = monthlyPayment - interestForMonth;

    if (m === totalMonths || principalForMonth > remaining) {
      principalForMonth = remaining;
    }

    const actualPayment = principalForMonth + interestForMonth;
    remaining = Math.max(0, remaining - principalForMonth);
    cumulativeInterest += interestForMonth;
    cumulativePrincipal += principalForMonth;

    amortizationMonthly.push({
      month: m,
      year,
      payment: actualPayment,
      principal: principalForMonth,
      interest: interestForMonth,
      remainingBalance: remaining,
      cumulativeInterest,
      cumulativePrincipal,
    });

    if (!yearlyMap.has(year)) {
      yearlyMap.set(year, {
        startingBalance: remaining + principalForMonth,
        totalPayment: 0,
        principalPaid: 0,
        interestPaid: 0,
        endingBalance: remaining,
      });
    }

    const yData = yearlyMap.get(year)!;
    yData.totalPayment += actualPayment;
    yData.principalPaid += principalForMonth;
    yData.interestPaid += interestForMonth;
    yData.endingBalance = remaining;
  }

  const amortizationYearly: YearlyAmortizationSummary[] = Array.from(
    yearlyMap.entries()
  ).map(([year, val]) => ({
    year,
    startingBalance: val.startingBalance,
    totalPayment: val.totalPayment,
    principalPaid: val.principalPaid,
    interestPaid: val.interestPaid,
    endingBalance: val.endingBalance,
  }));

  const totalRepayment = cumulativePrincipal + cumulativeInterest;
  const totalInterest = cumulativeInterest;

  // MAS Stress-test calculation (MAS floor is typically 4.00% for residential property)
  const stressTestRate = Math.max(stressTestFloorRate, effectiveRate);
  const stressMonthlyRate = stressTestRate / 100 / 12;
  const stressTestMonthlyPayment =
    (loanAmount * stressMonthlyRate * Math.pow(1 + stressMonthlyRate, totalMonths)) /
    (Math.pow(1 + stressMonthlyRate, totalMonths) - 1);
  const stressTestDifference = Math.max(0, stressTestMonthlyPayment - monthlyPayment);

  // MAS Total Debt Servicing Ratio (TDSR) requires total debt <= 55% of monthly income
  // Required gross monthly income = (StressTestMonthlyPayment + OtherMonthlyDebt) / 0.55
  const tdsrRequiredIncome = (stressTestMonthlyPayment + otherMonthlyDebt) / 0.55;

  return {
    effectiveRate: Number(effectiveRate.toFixed(4)),
    benchmarkRate: Number(benchmarkRate.toFixed(4)),
    bankMargin: Number(bankMargin.toFixed(4)),
    monthlyPayment: Number(monthlyPayment.toFixed(2)),
    totalRepayment: Number(totalRepayment.toFixed(2)),
    totalInterest: Number(totalInterest.toFixed(2)),
    dailyInterestCost: Number(dailyInterestCost.toFixed(2)),
    stressTestRate: Number(stressTestRate.toFixed(2)),
    stressTestMonthlyPayment: Number(stressTestMonthlyPayment.toFixed(2)),
    stressTestDifference: Number(stressTestDifference.toFixed(2)),
    tdsrRequiredIncome: Number(tdsrRequiredIncome.toFixed(2)),
    amortizationMonthly,
    amortizationYearly,
  };
}

/**
 * Format currency in Singapore Dollars (SGD)
 */
export function formatSGD(amount: number, includeCents: boolean = false): string {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    minimumFractionDigits: includeCents ? 2 : 0,
    maximumFractionDigits: includeCents ? 2 : 0,
  }).format(amount);
}

/**
 * Format percentage with decimal places
 */
export function formatPercent(rate: number, decimals: number = 3): string {
  return `${rate.toFixed(decimals)}%`;
}

/**
 * Export amortization schedule as standard CSV
 */
export function exportAmortizationCSV(
  schedule: AmortizationPayment[],
  loanAmount: number,
  effectiveRate: number
) {
  const headers = [
    'Month',
    'Year',
    'Monthly Instalment (SGD)',
    'Principal (SGD)',
    'Interest (SGD)',
    'Remaining Balance (SGD)',
    'Cumulative Principal (SGD)',
    'Cumulative Interest (SGD)',
  ];

  const rows = schedule.map((item) => [
    item.month,
    item.year,
    item.payment.toFixed(2),
    item.principal.toFixed(2),
    item.interest.toFixed(2),
    item.remainingBalance.toFixed(2),
    item.cumulativePrincipal.toFixed(2),
    item.cumulativeInterest.toFixed(2),
  ]);

  const csvContent = [
    `Singapore SORA Loan Amortization Schedule`,
    `Loan Principal: SGD ${loanAmount.toLocaleString()}`,
    `Effective SORA + Margin Rate: ${effectiveRate.toFixed(4)}% p.a.`,
    `Day Count Convention: Actual/365 (MAS)`,
    ``,
    headers.join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `SORA_Amortization_Schedule_${loanAmount}_SGD.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
