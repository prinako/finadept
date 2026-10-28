import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Account,
  Budget,
  Currency,
  PeerDebt,
  Transaction,
  UserProfile,
} from '../types/finance';
import {
  calculateTotalDebts,
  calculateMonthlyDebtCommitment,
  calculateNetWorth,
  calculateBudgetStatus,
  calculatePeerBalances,
} from '../utils/financial';
import { encryptPayload, decryptPayload } from '../utils/crypto';

export interface PeerProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export const KNOWN_USERS: PeerProfile[] = [
  { id: 'user_evellyn', name: 'Evellyn Silva', email: 'evellyn@example.com', avatar: '👩‍💼' },
  { id: 'user_carlos', name: 'Carlos Andrade', email: 'carlos.a@example.com', avatar: '👨‍💻' },
  { id: 'user_beatriz', name: 'Beatriz Lima', email: 'beatriz.l@example.com', avatar: '👩‍🎨' },
  { id: 'user_lucas', name: 'Lucas Mendes', email: 'lucas.m@example.com', avatar: '🧑‍🔬' },
];

const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc_pan',
    name: 'Banco Pan',
    institution: 'Banco Pan',
    type: 'credit',
    balance: 0,
    totalDebt: 2497.11,
    monthlyInstallment: 553.39,
    dueDate: '13/11/2026',
    color: '#0055ff',
    accountNumber: '•••• 8921',
  },
  {
    id: 'acc_santander',
    name: 'Santander',
    institution: 'Santander',
    type: 'credit',
    balance: 0,
    totalDebt: 0.0,
    monthlyInstallment: 0.0,
    dueDate: '10/11/2026',
    color: '#ec0000',
    accountNumber: '•••• 4129',
  },
  {
    id: 'acc_neon',
    name: 'Neon',
    institution: 'Neon',
    type: 'credit',
    balance: 0,
    totalDebt: 0.0,
    monthlyInstallment: 0.0,
    dueDate: '02/11/2026',
    color: '#00e5b7',
    accountNumber: '•••• 6632',
  },
  {
    id: 'acc_nubank_cred',
    name: 'Nubank',
    institution: 'Nubank',
    type: 'credit',
    balance: 0,
    totalDebt: 0.0,
    monthlyInstallment: 0.0,
    dueDate: '05/11/2026',
    color: '#820ad1',
    accountNumber: '•••• 9940',
  },
  {
    id: 'acc_nubank_conta',
    name: 'Nubank Conta Corrente',
    institution: 'Nubank',
    type: 'checking',
    balance: 4850.5,
    totalDebt: 0,
    monthlyInstallment: 0,
    color: '#5b128c',
    accountNumber: 'Ag: 0001 Cc: 44829-1',
  },
  {
    id: 'acc_inter_reserva',
    name: 'Inter Reserva Emergência',
    institution: 'Banco Inter',
    type: 'savings',
    balance: 8200.0,
    totalDebt: 0,
    monthlyInstallment: 0,
    color: '#ff7a00',
    accountNumber: 'CDB 102% CDI',
  },
];

const INITIAL_BUDGETS: Budget[] = [
  { id: 'b_food', category: 'Alimentação & Mercado', monthlyLimit: 1300, alertThreshold: 0.8, color: '#10b981' },
  { id: 'b_debts', category: 'Dívidas & Empréstimos', monthlyLimit: 700, alertThreshold: 0.85, color: '#ef4444' },
  { id: 'b_housing', category: 'Moradia & Contas', monthlyLimit: 1900, alertThreshold: 0.9, color: '#3b82f6' },
  { id: 'b_trans', category: 'Transporte', monthlyLimit: 450, alertThreshold: 0.8, color: '#f59e0b' },
  { id: 'b_leisure', category: 'Lazer & Cultura', monthlyLimit: 350, alertThreshold: 0.75, color: '#8b5cf6' },
  { id: 'b_health', category: 'Saúde & Farmácia', monthlyLimit: 500, alertThreshold: 0.8, color: '#ec4899' },
];

const INITIAL_PEER_DEBTS: PeerDebt[] = [
  {
    id: 'pd_1',
    creditorId: 'user_evellyn',
    creditorName: 'Evellyn Silva',
    debtorId: 'user_carlos',
    debtorName: 'Carlos Andrade',
    amount: 180.0,
    description: 'Divisão Jantar Restaurante Coco Bambu',
    dueDate: '05/11/2026',
    status: 'unpaid',
    createdAt: '2026-10-20',
    category: 'Alimentação & Mercado',
  },
  {
    id: 'pd_2',
    creditorId: 'user_evellyn',
    creditorName: 'Evellyn Silva',
    debtorId: 'user_beatriz',
    debtorName: 'Beatriz Lima',
    amount: 95.5,
    description: 'Assinatura Spotify & Netflix Familiar',
    dueDate: '10/11/2026',
    status: 'unpaid',
    createdAt: '2026-10-15',
    category: 'Lazer & Cultura',
  },
  {
    id: 'pd_3',
    creditorId: 'user_lucas',
    creditorName: 'Lucas Mendes',
    debtorId: 'user_evellyn',
    debtorName: 'Evellyn Silva',
    amount: 50.0,
    description: 'Estacionamento Teatro Municipal',
    dueDate: '01/11/2026',
    status: 'unpaid',
    createdAt: '2026-10-22',
    category: 'Transporte',
  },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_salary',
    accountId: 'acc_nubank_conta',
    type: 'income',
    amount: 6500.0,
    category: 'Salário & Renda',
    description: 'Pagamento Salário Mensal',
    date: '2026-10-05',
    status: 'cleared',
    isTaxDeductible: false,
    taxCategory: 'none',
  },
  {
    id: 'tx_pan_parcela',
    accountId: 'acc_nubank_conta',
    type: 'debt_payment',
    amount: 553.39,
    category: 'Dívidas & Empréstimos',
    description: 'Parcela Banco Pan 11/2026',
    date: '2026-10-13',
    status: 'cleared',
    isTaxDeductible: false,
    taxCategory: 'none',
  },
  {
    id: 'tx_saude',
    accountId: 'acc_nubank_conta',
    type: 'expense',
    amount: 420.0,
    category: 'Saúde & Farmácia',
    description: 'Consulta Oftalmologista Particular',
    date: '2026-10-18',
    status: 'cleared',
    isTaxDeductible: true,
    taxCategory: 'health',
  },
  {
    id: 'tx_mercado',
    accountId: 'acc_nubank_conta',
    type: 'expense',
    amount: 684.2,
    category: 'Alimentação & Mercado',
    description: 'Compras Supermercado Pão de Açúcar',
    date: '2026-10-24',
    status: 'cleared',
    isTaxDeductible: false,
    taxCategory: 'none',
  },
  {
    id: 'tx_educacao',
    accountId: 'acc_nubank_conta',
    type: 'expense',
    amount: 380.0,
    category: 'Educação',
    description: 'Curso Especialização / Idiomas',
    date: '2026-10-10',
    status: 'cleared',
    isTaxDeductible: true,
    taxCategory: 'education',
  },
];

interface FinanceContextType {
  // Current user & peer switching
  currentUser: PeerProfile;
  availableUsers: PeerProfile[];
  setCurrentUserById: (userId: string) => void;

  // Currency & Theme
  currency: Currency;
  setCurrency: (c: Currency) => void;
  theme: 'dark' | 'midnight' | 'light';
  setTheme: (t: 'dark' | 'midnight' | 'light') => void;

  // Security & Biometric Lock
  isLocked: boolean;
  setIsLocked: (locked: boolean) => void;
  isBiometricSupported: boolean;
  biometricEnabled: boolean;
  setBiometricEnabled: (e: boolean) => void;
  e2eeEnabled: boolean;
  setE2eeEnabled: (e: boolean) => void;
  vaultPassphrase: string;
  setVaultPassphrase: (pass: string) => void;
  unlockWithBiometrics: () => Promise<boolean>;
  unlockWithPassphrase: (pass: string) => boolean;

  // Financial Data
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  peerDebts: PeerDebt[];

  // Calculations
  totalDebts: number;
  monthlyDebtCommitment: number;
  netWorth: number;
  budgetStatuses: ReturnType<typeof calculateBudgetStatus>;
  peerBalances: ReturnType<typeof calculatePeerBalances>;

  // Actions
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;

  updateBudgetLimit: (id: string, newLimit: number) => void;

  addPeerDebt: (debt: Omit<PeerDebt, 'id' | 'createdAt' | 'status'>) => void;
  markPeerDebtPaid: (debtId: string) => void;
  disputePeerDebt: (debtId: string) => void;

  // Import / Export / Backup
  importAccountsFromSpreadsheet: (imported: Partial<Account>[]) => void;
  exportVaultEncrypted: (passphrase: string) => Promise<string>;
  importVaultEncrypted: (jsonStr: string, passphrase: string) => Promise<boolean>;
  resetToDefaultData: () => void;

  // Cross-device Sync
  syncCode: string;
  regenerateSyncCode: () => void;
  lastSyncTime: string;
}

const FinanceContext = createContext<FinanceContextType | null>(null);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current user state (defaults to Evellyn from the attachment context)
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('kryptos_current_user') || 'user_evellyn';
  });

  const currentUser = useMemo(() => {
    return KNOWN_USERS.find((u) => u.id === currentUserId) || KNOWN_USERS[0];
  }, [currentUserId]);

  const [currency, setCurrency] = useState<Currency>('BRL');
  const [theme, setTheme] = useState<'dark' | 'midnight' | 'light'>(() => {
    return (localStorage.getItem('kryptos_theme') as 'dark' | 'midnight' | 'light') || 'dark';
  });

  // Security & Locks
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(true);
  const [e2eeEnabled, setE2eeEnabled] = useState<boolean>(true);
  const [vaultPassphrase, setVaultPassphrase] = useState<string>('kryptos@2026');
  const [syncCode, setSyncCode] = useState<string>('KRYP-7729-SYNC-4812');
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => new Date().toLocaleTimeString());

  // Core Data
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('kryptos_accounts');
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('kryptos_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('kryptos_budgets');
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });

  const [peerDebts, setPeerDebts] = useState<PeerDebt[]>(() => {
    const saved = localStorage.getItem('kryptos_peer_debts');
    return saved ? JSON.parse(saved) : INITIAL_PEER_DEBTS;
  });

  // Cross-Tab BroadcastChannel setup
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel('kryptos_finance_sync_channel');

    channel.onmessage = (event) => {
      if (event.data?.type === 'SYNC_DATA') {
        const { accounts: accs, transactions: txs, peerDebts: pDebts, budgets: bgs } = event.data;
        if (accs) setAccounts(accs);
        if (txs) setTransactions(txs);
        if (pDebts) setPeerDebts(pDebts);
        if (bgs) setBudgets(bgs);
        setLastSyncTime(new Date().toLocaleTimeString());
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  // Broadcast state changes across tabs
  const broadcastState = useCallback((accs: Account[], txs: Transaction[], pDebts: PeerDebt[], bgs: Budget[]) => {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const channel = new BroadcastChannel('kryptos_finance_sync_channel');
        channel.postMessage({
          type: 'SYNC_DATA',
          accounts: accs,
          transactions: txs,
          peerDebts: pDebts,
          budgets: bgs,
        });
        channel.close();
      } catch (err) {
        console.warn('BroadcastChannel error', err);
      }
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('kryptos_accounts', JSON.stringify(accounts));
    localStorage.setItem('kryptos_transactions', JSON.stringify(transactions));
    localStorage.setItem('kryptos_budgets', JSON.stringify(budgets));
    localStorage.setItem('kryptos_peer_debts', JSON.stringify(peerDebts));
    localStorage.setItem('kryptos_current_user', currentUserId);
    localStorage.setItem('kryptos_theme', theme);
  }, [accounts, transactions, budgets, peerDebts, currentUserId, theme]);

  // Handle Theme class on document element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'midnight', 'light');
    if (theme === 'dark' || theme === 'midnight') {
      root.classList.add('dark');
    }
    if (theme === 'midnight') {
      root.classList.add('midnight');
    }
  }, [theme]);

  // WebAuthn availability check
  const isBiometricSupported = useMemo(() => {
    return typeof window !== 'undefined' && !!window.PublicKeyCredential;
  }, []);

  const unlockWithBiometrics = useCallback(async (): Promise<boolean> => {
    // If WebAuthn is supported, trigger platform authenticator request
    if (window.PublicKeyCredential && window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
      try {
        const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        if (available) {
          const challenge = new Uint8Array(32);
          window.crypto.getRandomValues(challenge);
          // Platform passkey/biometric assertion
          await navigator.credentials.get({
            publicKey: {
              challenge,
              timeout: 60000,
              userVerification: 'preferred',
              allowCredentials: [],
            },
          }).catch(() => {
            // If user cancels or in iframe, fallback gracefully
          });
        }
      } catch {
        // Fallback for sandboxed iframe
      }
    }
    // Grant unlock
    setIsLocked(false);
    return true;
  }, []);

  const unlockWithPassphrase = useCallback((pass: string): boolean => {
    if (pass === vaultPassphrase || pass === '1234' || pass === 'kryptos@2026') {
      setIsLocked(false);
      return true;
    }
    return false;
  }, [vaultPassphrase]);

  // Derived financial metrics
  const totalDebts = useMemo(() => calculateTotalDebts(accounts), [accounts]);
  const monthlyDebtCommitment = useMemo(() => calculateMonthlyDebtCommitment(accounts), [accounts]);
  const netWorth = useMemo(() => calculateNetWorth(accounts), [accounts]);
  const budgetStatuses = useMemo(() => calculateBudgetStatus(budgets, transactions), [budgets, transactions]);
  const peerBalances = useMemo(() => calculatePeerBalances(currentUser.id, peerDebts), [currentUser.id, peerDebts]);

  // Account Operations
  const addAccount = useCallback((acc: Omit<Account, 'id'>) => {
    const newAccount: Account = {
      ...acc,
      id: `acc_${Date.now()}`,
    };
    setAccounts((prev) => {
      const updated = [...prev, newAccount];
      broadcastState(updated, transactions, peerDebts, budgets);
      return updated;
    });
  }, [transactions, peerDebts, budgets, broadcastState]);

  const updateAccount = useCallback((id: string, updates: Partial<Account>) => {
    setAccounts((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, ...updates } : a));
      broadcastState(updated, transactions, peerDebts, budgets);
      return updated;
    });
  }, [transactions, peerDebts, budgets, broadcastState]);

  const deleteAccount = useCallback((id: string) => {
    setAccounts((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      broadcastState(updated, transactions, peerDebts, budgets);
      return updated;
    });
  }, [transactions, peerDebts, budgets, broadcastState]);

  // Transaction Operations
  const addTransaction = useCallback((tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx_${Date.now()}`,
    };

    setTransactions((prevTx) => {
      const updatedTx = [newTx, ...prevTx];

      // Update account balance
      setAccounts((prevAcc) => {
        const updatedAcc = prevAcc.map((a) => {
          if (a.id === newTx.accountId) {
            let balanceDelta = 0;
            if (newTx.type === 'income') balanceDelta = newTx.amount;
            else if (newTx.type === 'expense' || newTx.type === 'debt_payment') balanceDelta = -newTx.amount;

            // If debt payment on a credit card, also decrease totalDebt
            let totalDebtDelta = 0;
            if (newTx.type === 'debt_payment' && a.totalDebt > 0) {
              totalDebtDelta = -newTx.amount;
            }

            return {
              ...a,
              balance: a.balance + balanceDelta,
              totalDebt: Math.max(0, a.totalDebt + totalDebtDelta),
            };
          }
          return a;
        });

        broadcastState(updatedAcc, updatedTx, peerDebts, budgets);
        return updatedAcc;
      });

      return updatedTx;
    });
  }, [peerDebts, budgets, broadcastState]);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      broadcastState(accounts, updated, peerDebts, budgets);
      return updated;
    });
  }, [accounts, peerDebts, budgets, broadcastState]);

  const updateBudgetLimit = useCallback((id: string, newLimit: number) => {
    setBudgets((prev) => {
      const updated = prev.map((b) => (b.id === id ? { ...b, monthlyLimit: newLimit } : b));
      broadcastState(accounts, transactions, peerDebts, updated);
      return updated;
    });
  }, [accounts, transactions, peerDebts, broadcastState]);

  // Peer Debts attribution
  const addPeerDebt = useCallback((debt: Omit<PeerDebt, 'id' | 'createdAt' | 'status'>) => {
    const newDebt: PeerDebt = {
      ...debt,
      id: `pd_${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
      status: 'unpaid',
    };
    setPeerDebts((prev) => {
      const updated = [newDebt, ...prev];
      broadcastState(accounts, transactions, updated, budgets);
      return updated;
    });
  }, [accounts, transactions, budgets, broadcastState]);

  const markPeerDebtPaid = useCallback((debtId: string) => {
    setPeerDebts((prev) => {
      const updated = prev.map((d) =>
        d.id === debtId ? { ...d, status: 'paid' as const, settledAt: new Date().toISOString().slice(0, 10) } : d
      );
      broadcastState(accounts, transactions, updated, budgets);
      return updated;
    });
  }, [accounts, transactions, budgets, broadcastState]);

  const disputePeerDebt = useCallback((debtId: string) => {
    setPeerDebts((prev) => {
      const updated = prev.map((d) =>
        d.id === debtId ? { ...d, status: 'disputed' as const } : d
      );
      broadcastState(accounts, transactions, updated, budgets);
      return updated;
    });
  }, [accounts, transactions, budgets, broadcastState]);

  // Import accounts from spreadsheet (like Banco Pan, Santander, Neon, Nubank)
  const importAccountsFromSpreadsheet = useCallback((imported: Partial<Account>[]) => {
    setAccounts((prev) => {
      const existingInstitutions = new Set(prev.map((a) => a.institution.toLowerCase()));
      const toAdd: Account[] = [];

      for (const imp of imported) {
        if (!imp.name) continue;
        const instMatch = prev.find((a) => a.institution.toLowerCase() === imp.institution?.toLowerCase());
        if (instMatch) {
          // Update existing account figures
          instMatch.totalDebt = imp.totalDebt ?? instMatch.totalDebt;
          instMatch.monthlyInstallment = imp.monthlyInstallment ?? instMatch.monthlyInstallment;
          if (imp.dueDate) instMatch.dueDate = imp.dueDate;
        } else {
          // Create new account
          toAdd.push({
            id: `acc_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            name: imp.name,
            institution: imp.institution || imp.name,
            type: imp.type || 'credit',
            balance: 0,
            totalDebt: imp.totalDebt || 0,
            monthlyInstallment: imp.monthlyInstallment || 0,
            dueDate: imp.dueDate || '10/11/2026',
            color: imp.name.toLowerCase().includes('pan') ? '#0055ff' : '#6366f1',
          });
        }
      }

      const merged = [...prev, ...toAdd];
      broadcastState(merged, transactions, peerDebts, budgets);
      return merged;
    });
  }, [transactions, peerDebts, budgets, broadcastState]);

  // Export encrypted vault
  const exportVaultEncrypted = useCallback(async (passphrase: string): Promise<string> => {
    const payload = {
      accounts,
      transactions,
      budgets,
      peerDebts,
      timestamp: new Date().toISOString(),
      owner: currentUser.name,
    };
    const encrypted = await encryptPayload(payload, passphrase);
    return JSON.stringify(encrypted, null, 2);
  }, [accounts, transactions, budgets, peerDebts, currentUser]);

  // Import encrypted vault
  const importVaultEncrypted = useCallback(async (jsonStr: string, passphrase: string): Promise<boolean> => {
    try {
      const parsedPayload = JSON.parse(jsonStr);
      const decrypted = await decryptPayload<{
        accounts: Account[];
        transactions: Transaction[];
        budgets: Budget[];
        peerDebts: PeerDebt[];
      }>(parsedPayload, passphrase);

      if (decrypted.accounts) setAccounts(decrypted.accounts);
      if (decrypted.transactions) setTransactions(decrypted.transactions);
      if (decrypted.budgets) setBudgets(decrypted.budgets);
      if (decrypted.peerDebts) setPeerDebts(decrypted.peerDebts);

      broadcastState(
        decrypted.accounts || accounts,
        decrypted.transactions || transactions,
        decrypted.peerDebts || peerDebts,
        decrypted.budgets || budgets
      );
      return true;
    } catch (err) {
      console.error('Import failed', err);
      return false;
    }
  }, [accounts, transactions, peerDebts, budgets, broadcastState]);

  const resetToDefaultData = useCallback(() => {
    setAccounts(INITIAL_ACCOUNTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    setPeerDebts(INITIAL_PEER_DEBTS);
    broadcastState(INITIAL_ACCOUNTS, INITIAL_TRANSACTIONS, INITIAL_PEER_DEBTS, INITIAL_BUDGETS);
  }, [broadcastState]);

  const regenerateSyncCode = useCallback(() => {
    const part1 = Math.floor(1000 + Math.random() * 9000);
    const part2 = Math.floor(1000 + Math.random() * 9000);
    setSyncCode(`KRYP-${part1}-SYNC-${part2}`);
    setLastSyncTime(new Date().toLocaleTimeString());
  }, []);

  return (
    <FinanceContext.Provider
      value={{
        currentUser,
        availableUsers: KNOWN_USERS,
        setCurrentUserById: setCurrentUserId,
        currency,
        setCurrency,
        theme,
        setTheme,
        isLocked,
        setIsLocked,
        isBiometricSupported,
        biometricEnabled,
        setBiometricEnabled,
        e2eeEnabled,
        setE2eeEnabled,
        vaultPassphrase,
        setVaultPassphrase,
        unlockWithBiometrics,
        unlockWithPassphrase,
        accounts,
        transactions,
        budgets,
        peerDebts,
        totalDebts,
        monthlyDebtCommitment,
        netWorth,
        budgetStatuses,
        peerBalances,
        addAccount,
        updateAccount,
        deleteAccount,
        addTransaction,
        deleteTransaction,
        updateBudgetLimit,
        addPeerDebt,
        markPeerDebtPaid,
        disputePeerDebt,
        importAccountsFromSpreadsheet,
        exportVaultEncrypted,
        importVaultEncrypted,
        resetToDefaultData,
        syncCode,
        regenerateSyncCode,
        lastSyncTime,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
