export type Currency = 'BRL' | 'USD' | 'EUR';

export type AccountType = 'credit' | 'checking' | 'savings' | 'loan';

export interface Account {
  id: string;
  name: string;
  institution: string; // e.g. "Banco Pan", "Santander", "Neon", "Nubank"
  type: AccountType;
  balance: number; // positive for liquid assets, 0 or negative for credit/loan balance
  totalDebt: number; // e.g. R$ 2.497,11 for Banco Pan
  monthlyInstallment: number; // e.g. R$ 553,39 for Banco Pan
  dueDate?: string; // e.g. "13/11/2026"
  color: string;
  iconName?: string;
  accountNumber?: string;
}

export type TransactionType = 'income' | 'expense' | 'transfer' | 'debt_payment';

export type TaxCategory = 'none' | 'health' | 'education' | 'business' | 'charity' | 'housing';

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string; // ISO string or YYYY-MM-DD
  status: 'cleared' | 'pending';
  isTaxDeductible: boolean;
  taxCategory: TaxCategory;
  recipientOrSender?: string;
  peerId?: string; // If this transaction is tied to a peer debt
  notes?: string;
}

export interface Budget {
  id: string;
  category: string;
  monthlyLimit: number;
  alertThreshold: number; // 0.8 for 80%
  color: string;
}

export type PeerDebtStatus = 'unpaid' | 'paid' | 'disputed';

export interface PeerDebt {
  id: string;
  creditorId: string; // User ID who lent the money / is owed money
  creditorName: string;
  debtorId: string; // User ID who owes the money
  debtorName: string;
  amount: number;
  description: string;
  dueDate?: string;
  status: PeerDebtStatus;
  createdAt: string;
  settledAt?: string;
  category?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  currency: Currency;
  biometricEnabled: boolean;
  e2eeEnabled: boolean;
  autoLockMinutes: number;
  theme: 'dark' | 'midnight' | 'light';
  vaultPassphraseHash?: string;
}

export interface EncryptedPayload {
  version: number;
  algorithm: string;
  salt: string;
  iv: string;
  ciphertext: string;
  createdAt: string;
}

export interface TaxReportSummary {
  year: number;
  totalIncome: number;
  totalExpenses: number;
  totalDeductible: number;
  deductionsByCategory: Record<TaxCategory, number>;
  totalDebtsDeclared: number;
  totalAssetsDeclared: number;
  netTaxableBase: number;
}
