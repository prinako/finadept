/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Header } from './components/Header';
import { AccountsView } from './components/AccountsView';
import { TransactionsView } from './components/TransactionsView';
import { BudgetTracker } from './components/BudgetTracker';
import { PeerDebtLedger } from './components/PeerDebtLedger';
import { BiometricModal } from './components/BiometricModal';
import { TaxReportsModal } from './components/TaxReportsModal';
import { SyncModal } from './components/SyncModal';
import { FlutterExportModal } from './components/FlutterExportModal';
import {
  CreditCard,
  Receipt,
  PieChart,
  Users,
  ShieldCheck,
  Smartphone,
  Plus,
} from 'lucide-react';

function MainLayout() {
  const [activeTab, setActiveTab] = useState<'accounts' | 'transactions' | 'budgets' | 'peer_debts'>('accounts');
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const [isTaxOpen, setIsTaxOpen] = useState(false);
  const [isFlutterOpen, setIsFlutterOpen] = useState(false);

  const { e2eeEnabled, currentUser, peerBalances } = useFinance();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Biometric Security Modal (triggers on lock) */}
      <BiometricModal />

      {/* Main App Bar Header */}
      <Header
        onOpenSync={() => setIsSyncOpen(true)}
        onOpenTax={() => setIsTaxOpen(true)}
        onOpenFlutter={() => setIsFlutterOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 sm:pb-12">
        {activeTab === 'accounts' && <AccountsView />}
        {activeTab === 'transactions' && <TransactionsView />}
        {activeTab === 'budgets' && <BudgetTracker />}
        {activeTab === 'peer_debts' && <PeerDebtLedger />}
      </main>

      {/* Flutter-style Bottom Navigation Bar for Mobile Viewports */}
      <nav
        aria-label="Navegação Principal Mobile"
        className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 sm:hidden px-2 py-1.5 flex justify-around items-center"
      >
        <button
          onClick={() => setActiveTab('accounts')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'accounts' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Contas</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'transactions' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Extrato</span>
        </button>

        <button
          onClick={() => setActiveTab('budgets')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'budgets' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PieChart className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Metas</span>
        </button>

        <button
          onClick={() => setActiveTab('peer_debts')}
          className={`relative flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'peer_debts' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Dívidas</span>
          {peerBalances.owedToMe > 0 && (
            <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>
      </nav>

      {/* Modals */}
      <TaxReportsModal isOpen={isTaxOpen} onClose={() => setIsTaxOpen(false)} />
      <SyncModal isOpen={isSyncOpen} onClose={() => setIsSyncOpen(false)} />
      <FlutterExportModal isOpen={isFlutterOpen} onClose={() => setIsFlutterOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <MainLayout />
    </FinanceProvider>
  );
}
