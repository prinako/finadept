/**
 * Pure financial calculations, debt tracking, Brazilian currency formatting,
 * and tax report computations.
 */
import { Account, Budget, PeerDebt, TaxCategory, TaxReportSummary, Transaction } from '../types/finance';

/**
 * Format currency value according to locale and currency code
 */
export function formatCurrency(amount: number, currency: 'BRL' | 'USD' | 'EUR' = 'BRL'): string {
  const localeMap = {
    BRL: 'pt-BR',
    USD: 'en-US',
    EUR: 'de-DE',
  };
  return new Intl.NumberFormat(localeMap[currency], {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Parse Brazilian currency string like "R$ 2.497,11" or "2497,11" to float
 */
export function parseBrlCurrency(str: string): number {
  if (!str) return 0;
  const clean = str.replace(/[R$\s]/g, '').trim();
  if (!clean) return 0;
  // Replace thousand separators (.) and swap decimal comma (,) to dot (.)
  const normalized = clean.replace(/\./g, '').replace(',', '.');
  const val = parseFloat(normalized);
  return isNaN(val) ? 0 : val;
}

/**
 * Calculate total debts across all credit cards, loans and debt lines
 */
export function calculateTotalDebts(accounts: Account[]): number {
  return accounts.reduce((acc, account) => acc + (account.totalDebt || 0), 0);
}

/**
 * Calculate total monthly commitment (Valor por mês) across accounts
 */
export function calculateMonthlyDebtCommitment(accounts: Account[]): number {
  return accounts.reduce((acc, account) => acc + (account.monthlyInstallment || 0), 0);
}

/**
 * Calculate net worth = (positive liquid balances) - (total debts)
 */
export function calculateNetWorth(accounts: Account[]): number {
  const assets = accounts.reduce((acc, a) => acc + Math.max(0, a.balance), 0);
  const debts = calculateTotalDebts(accounts);
  return assets - debts;
}

/**
 * Calculate budget status: spent amounts per category, remaining, and percentage
 */
export function calculateBudgetStatus(budgets: Budget[], transactions: Transaction[]) {
  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

  const expensesByCat: Record<string, number> = {};
  for (const t of transactions) {
    if (t.type === 'expense' && t.date.startsWith(currentMonth)) {
      expensesByCat[t.category] = (expensesByCat[t.category] || 0) + t.amount;
    }
  }

  return budgets.map((b) => {
    const spent = expensesByCat[b.category] || 0;
    const remaining = Math.max(0, b.monthlyLimit - spent);
    const percentage = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
    const isOverBudget = spent > b.monthlyLimit;
    const isNearLimit = percentage >= (b.alertThreshold * 100) && !isOverBudget;

    return {
      ...b,
      spent,
      remaining,
      percentage: Math.min(percentage, 100),
      rawPercentage: percentage,
      isOverBudget,
      isNearLimit,
    };
  });
}

/**
 * Calculate peer debts: total owed to current user vs total current user owes
 */
export function calculatePeerBalances(currentUserId: string, peerDebts: PeerDebt[]) {
  let owedToMe = 0;
  let iOwe = 0;

  for (const debt of peerDebts) {
    if (debt.status === 'paid') continue;

    if (debt.creditorId === currentUserId) {
      owedToMe += debt.amount;
    } else if (debt.debtorId === currentUserId) {
      iOwe += debt.amount;
    }
  }

  return {
    owedToMe,
    iOwe,
    netPeerBalance: owedToMe - iOwe,
  };
}

/**
 * Generate tax report summary for personal record keeping / tax return
 */
export function generateTaxSummary(
  transactions: Transaction[],
  accounts: Account[],
  year: number
): TaxReportSummary {
  const yearStr = year.toString();
  const yearTx = transactions.filter((t) => t.date.startsWith(yearStr));

  let totalIncome = 0;
  let totalExpenses = 0;
  let totalDeductible = 0;
  const deductionsByCategory: Record<TaxCategory, number> = {
    none: 0,
    health: 0,
    education: 0,
    business: 0,
    charity: 0,
    housing: 0,
  };

  for (const tx of yearTx) {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
    } else if (tx.type === 'expense') {
      totalExpenses += tx.amount;
      if (tx.isTaxDeductible) {
        totalDeductible += tx.amount;
        const cat = tx.taxCategory || 'other';
        if (cat in deductionsByCategory) {
          deductionsByCategory[cat as TaxCategory] += tx.amount;
        }
      }
    }
  }

  const totalDebtsDeclared = calculateTotalDebts(accounts);
  const totalAssetsDeclared = accounts.reduce((acc, a) => acc + Math.max(0, a.balance), 0);
  const netTaxableBase = Math.max(0, totalIncome - totalDeductible);

  return {
    year,
    totalIncome,
    totalExpenses,
    totalDeductible,
    deductionsByCategory,
    totalDebtsDeclared,
    totalAssetsDeclared,
    netTaxableBase,
  };
}

/**
 * Helper to split CSV row respecting double quotes
 */
export function splitCsvRow(row: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Parses Brazilian banking CSV format matching user's attachment:
 * Santander, Neon, Banco Pan, Nubank
 */
export function parseBrazilianCsv(csvText: string): Partial<Account>[] {
  const rawLines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const lines = rawLines.map(splitCsvRow);
  const accounts: Partial<Account>[] = [];

  if (lines.length < 4) return accounts;

  const headerRow = lines[0];
  const totalRow = lines[1] || [];
  const monthlyRow = lines[2] || [];
  const dueRow = lines[3] || [];

  const bankColumns = [
    { nameIdx: 0, valIdx: 1 },
    { nameIdx: 3, valIdx: 4 },
    { nameIdx: 6, valIdx: 7 },
  ];

  for (const col of bankColumns) {
    const name = headerRow[col.nameIdx]?.replace(/["']/g, '').trim();
    if (name) {
      accounts.push({
        name,
        institution: name,
        totalDebt: parseBrlCurrency(totalRow[col.valIdx] || '0'),
        monthlyInstallment: parseBrlCurrency(monthlyRow[col.valIdx] || '0'),
        dueDate: dueRow[col.valIdx]?.replace(/["']/g, '').trim() || '',
        type: 'credit',
      });
    }
  }

  // Find Nubank section anywhere in the rows
  const nubankRowIdx = lines.findIndex(
    (l) => l[0]?.replace(/["']/g, '').trim().toLowerCase() === 'nubank'
  );
  if (nubankRowIdx !== -1 && lines[nubankRowIdx + 1]) {
    const nTotalRow = lines[nubankRowIdx + 1];
    const nMonthlyRow = lines[nubankRowIdx + 2] || [];
    const nDueRow = lines[nubankRowIdx + 3] || [];

    accounts.push({
      name: 'Nubank',
      institution: 'Nubank',
      totalDebt: parseBrlCurrency(nTotalRow[1] || '0'),
      monthlyInstallment: parseBrlCurrency(nMonthlyRow[1] || '0'),
      dueDate: nDueRow[1]?.replace(/["']/g, '').trim() || '',
      type: 'credit',
    });
  }

  return accounts;
}

/**
 * Generate CSV for export
 */
export function exportToCsv(
  transactions: Transaction[],
  accounts: Account[],
  debts: PeerDebt[]
): string {
  const rows: string[] = [];

  rows.push('# KRYPTOS FINANCE EXPORT REPORT');
  rows.push(`Generated: ${new Date().toISOString()}`);
  rows.push('');
  rows.push('--- ACCOUNTS & DEBTS ---');
  rows.push('Institution,Type,Balance,Total Debt,Monthly Installment,Due Date');
  for (const a of accounts) {
    rows.push(
      `"${a.institution}","${a.type}","${a.balance.toFixed(2)}","${a.totalDebt.toFixed(2)}","${a.monthlyInstallment.toFixed(2)}","${a.dueDate || ''}"`
    );
  }

  rows.push('');
  rows.push('--- TRANSACTIONS ---');
  rows.push('Date,Description,Category,Type,Amount,Status,Tax Deductible,Tax Category');
  for (const t of transactions) {
    rows.push(
      `"${t.date}","${t.description.replace(/"/g, '""')}","${t.category}","${t.type}","${t.amount.toFixed(2)}","${t.status}","${t.isTaxDeductible}","${t.taxCategory}"`
    );
  }

  rows.push('');
  rows.push('--- PEER DEBTS (IOUs) ---');
  rows.push('Creditor,Debtor,Amount,Description,Due Date,Status');
  for (const d of debts) {
    rows.push(
      `"${d.creditorName}","${d.debtorName}","${d.amount.toFixed(2)}","${d.description.replace(/"/g, '""')}","${d.dueDate || ''}","${d.status}"`
    );
  }

  return rows.join('\n');
}
