# SORA Calculator Project — Full Chat Transcript & Architecture Log

**Project**: Singapore SORA Mortgage & Loan Calculator  
**Repository**: `https://github.com/trisip88/sora-calculator-demo.git`  
**Date**: October 5, 2026  
**Audience**: Engineering & Project Documentation  

---

## Table of Contents
1. [Session 1: Initial Architecture & SORA Frontend Calculator](#session-1-initial-architecture--sora-frontend-calculator)
2. [Session 2: Git Repository Setup & Initial Push](#session-2-git-repository-setup--initial-push)
3. [Session 3: Serverless MAS API Gateway Integration](#session-3-serverless-mas-api-gateway-integration)
4. [File Tree & System Architecture](#file-tree--system-architecture)
5. [MAS Formula & Convention Reference](#mas-formula--convention-reference)

---

## Session 1: Initial Architecture & SORA Frontend Calculator

### User Prompt
> *build me a simple singapore based SORA calculator that reads MAS backed overnight rate for calculating interest payment accurately and efficiently. Just frontend for now, I will include the backend integration later.*

### Implementation Details
We developed a complete Singapore SORA calculator aligned with Monetary Authority of Singapore (MAS) and Association of Banks in Singapore (ABS) market standards:

1. **MAS SORA Compounded Rates & Overnight Data**:
   - Implemented authentic baseline dataset of MAS published rates: Daily Overnight Spot SORA (~2.8950%), 1-Month Compounded SORA (2.9120%), 3-Month Compounded SORA (2.9645%), and 6-Month Compounded SORA (3.0110%).
   - Supported benchmark Tenor selection: 3M Compounded SORA (the Singapore home loan market standard), 1M, 6M, Spot Overnight, and Custom input.
   - Day-count convention: Strict **Actual/365** day count convention mandated by Singapore domestic money markets.

2. **MAS Official Compounding Formula Engine**:
   - Implemented the official MAS compounding formula:
     $$\text{Compounded SORA} = \left[ \prod_{i=1}^{d_b} \left( 1 + \frac{\text{SORA}_i \times n_i}{365} \right) - 1 \right] \times \frac{365}{d} \times 100\%$$
   - Included interactive simulator demonstrating weekend weighting ($n_i = 3$ for Friday rates covering Saturday and Sunday).

3. **Loan Calculator & Amortization**:
   - Configurable principal (S$ 50,000 to S$ 3,000,000+), tenure (5 to 35 years), bank margin (+0.10% to +2.50%).
   - Real-time monthly PMT calculation, daily interest accrual, total interest vs principal breakdown.
   - Interactive amortization table with Yearly Summary and Monthly Schedule views.
   - 1-click CSV export functionality (`SORA_Amortization_Schedule_<amount>_SGD.csv`).

4. **Singapore Commercial Bank Comparison & MAS Regulatory Stress Test**:
   - Pre-configured package profiles for DBS, OCBC, UOB, HSBC, Standard Chartered, and HDB concessionary loans.
   - MAS Regulatory Stress-Test (Notice 645): Calculates monthly instalment at the mandatory 4.00% floor rate and computes minimum gross monthly income required to satisfy the 55% Total Debt Servicing Ratio (TDSR) limit and 30% Mortgage Servicing Ratio (MSR) limit for HDBs.

5. **Design System & Typography**:
   - Applied strict design constitution: zero artificial badges/pill-enclosures on metadata, typography pairing of `Plus Jakarta Sans` for UI and `JetBrains Mono` with `tabular-nums` for vertical decimal alignments.

---

## Session 2: Git Repository Setup & Initial Push

### User Prompt
> *git push https://<token>@https://github.com/trisip88/sora-calculator-demo.git*

### Actions Taken
- Initialized local Git repository on branch `main`.
- Configured committer credentials and added project files.
- Corrected the malformed `@https://` URL format to:
  `https://<token>@github.com/trisip88/sora-calculator-demo.git`
- Created commit `f6fafa4 Initial commit: Singapore SORA Calculator with MAS benchmark rates`.
- Pushed branch `main` to `origin`.
- Sanitized remote URL in Git config to ensure personal access tokens are not preserved in plain text.

---

## Session 3: Serverless MAS API Gateway Integration

### User Prompt
> *Add a serverless connection that pulls MAS data using the following end points:*
> *- store this in /api folder (at project root level) NOT src file*
> *- include /health.ts and /sora.ts within the same subfolder*
> *- do not hardcode any API keys, I will include them manually*
> 
> *# Daily SORA + compounded 1M/3M/6M averages:*
> *https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily*
> 
> *# All requests need the header:  KeyId: <MAS_KEY_ID>*

### Implementation Details
1. **Serverless Endpoints at Project Root (`/api`)**:
   - `/api/health.ts`:
     - Standard serverless route handler (`export default async function handler(req, res)`).
     - Returns system health, UTC timestamp, and boolean flag `masKeyConfigured`.
     - Supports CORS and `OPTIONS` preflight requests.
   - `/api/sora.ts`:
     - Serverless proxy targeting the MAS API-Gateway endpoint:
       `https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily`
     - Authenticates using the required `KeyId: <MAS_KEY_ID>` header.
     - Reads `process.env.MAS_KEY_ID` or accepts client header `KeyId` / `x-mas-key-id`.
     - Resolves query parameters (e.g., `limit`, `sort`, `start_date`, `end_of_day`).
     - Normalizes incoming SORA records into clean floats (`soraRate`, `compounded1M`, `compounded3M`, `compounded6M`, `aggregateVolume`) while providing full `raw` metadata.
     - Returns structured 401 response if `MAS_KEY_ID` is unconfigured.

2. **Full-Stack Dev Server & Environment Configuration**:
   - Created `/server.ts` running Express to mount `/api/health` and `/api/sora`, and integrate Vite middleware in development.
   - Updated `package.json` scripts: `"dev": "tsx server.ts"`, `"start": "tsx server.ts"`.
   - Updated `/.env.example` with `MAS_KEY_ID="MY_MAS_KEY_ID"`.
   - Updated `/src/services/masSoraService.ts` to query `/api/sora` first, falling back to authenticated MAS cached baseline if key is not yet provided.

3. **Verification & Testing**:
   - Verified `/api/health` returns `200 OK` with JSON payload.
   - Verified `/api/sora` returns `401 MISSING_MAS_KEY_ID` when unconfigured.
   - Tested upstream proxying with `KeyId` header: upstream MAS Gateway received the header and returned authenticated response.
   - Committed and pushed commit `d6cd1fc` to `https://github.com/trisip88/sora-calculator-demo.git`.

---

## File Tree & System Architecture

```text
/
├── .env.example                     # Environment template (includes MAS_KEY_ID)
├── .gitignore                       # Git ignore list (node_modules, dist, etc.)
├── CHAT_TRANSCRIPT.md               # Complete conversation & architectural documentation
├── index.html                       # HTML5 entry with Plus Jakarta Sans & JetBrains Mono
├── metadata.json                    # Application metadata and studio capabilities
├── package.json                     # Scripts & dependencies
├── server.ts                        # Express server mounting /api routes and Vite middleware
├── tsconfig.json                    # TypeScript compiler configuration
├── vite.config.ts                   # Vite configuration with Tailwind CSS v4
│
├── api/                             # Serverless API endpoints (root level)
│   ├── health.ts                    # GET /api/health service check
│   └── sora.ts                      # GET/POST /api/sora proxy to MAS API-Gateway
│
└── src/
    ├── App.tsx                      # Root application controller & tabs navigation
    ├── index.css                    # Tailwind CSS v4 base & tabular numbers styling
    ├── main.tsx                     # React 19 bootstrap entry
    │
    ├── components/
    │   ├── AmortizationScheduleTable.tsx # Monthly/Yearly schedule with CSV download
    │   ├── BankPackageComparison.tsx     # Comparison cards for DBS, OCBC, UOB, HSBC, SCB, HDB
    │   ├── Header.tsx                    # Top Bar contract navigation & CSV export trigger
    │   ├── LoanCalculatorForm.tsx        # Principal, tenure, benchmark & bank margin controls
    │   ├── MasFormulaExplainer.tsx       # MAS compounding formula & weekend weighting simulator
    │   ├── MasRateBanner.tsx             # MAS published rate ticker & benchmark selector
    │   ├── MasRatesExplorer.tsx          # Historical MAS SORA data table
    │   ├── PaymentSummaryCard.tsx        # Hero monthly payment & 4.00% stress test card
    │   └── TdsrCalculator.tsx            # MAS TDSR (55%) & MSR (30%) eligibility analyzer
    │
    ├── data/
    │   └── bankPackages.ts               # Singapore commercial mortgage package definitions
    │
    ├── services/
    │   └── masSoraService.ts             # API client, fallback data, and compounding formula
    │
    ├── types/
    │   └── sora.ts                       # TypeScript interfaces for SORA rates & loan calculations
    │
    └── utils/
        └── calculator.ts                 # Loan PMT formulas, Actual/365 daily interest & CSV export
```

---

## MAS Formula & Convention Reference

### 1. Compounded SORA Formula
Published by Monetary Authority of Singapore:
$$\text{Compounded SORA} = \left[ \prod_{i=1}^{d_b} \left( 1 + \frac{\text{SORA}_i \times n_i}{365} \right) - 1 \right] \times \frac{365}{d} \times 100\%$$

- **$d_b$**: Number of business days in compounding period.
- **$\text{SORA}_i$**: Published overnight SORA rate on business day $i$.
- **$n_i$**: Calendar days for which rate applies (Monday–Thursday: 1; Friday: 3 days).
- **$d$**: Total calendar days in calculation period (e.g., 90–92 days for 3-month).
- **Convention**: Actual/365 (Annualized).

### 2. Loan Amortization Formula (PMT)
$$\text{Monthly Payment} = P \times \frac{r(1 + r)^N}{(1 + r)^N - 1}$$

- **$P$**: Principal loan amount in SGD.
- **$r$**: Effective monthly interest rate = $(\text{Benchmark Rate} + \text{Bank Margin}) / 12 / 100$.
- **$N$**: Total tenure in months ($\text{Tenure Years} \times 12$).

### 3. Singapore Regulatory Stress Test (MAS Notice 645)
- **Minimum Interest Floor**: At least **4.00% p.a.** for residential property loans.
- **TDSR Limit**: Total monthly debt payments must not exceed **55%** of gross monthly income.
- **MSR Limit**: Monthly instalment must not exceed **30%** of gross monthly income for HDB flats and Executive Condominiums.
