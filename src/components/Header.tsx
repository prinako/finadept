import React, { useState } from 'react';
import { useFinance, KNOWN_USERS } from '../context/FinanceContext';
import {
  ShieldCheck,
  Lock,
  Moon,
  Sun,
  Flame,
  RefreshCw,
  Share2,
  FileSpreadsheet,
  Code2,
  Users,
} from 'lucide-react';

interface HeaderProps {
  onOpenSync: () => void;
  onOpenTax: () => void;
  onOpenFlutter: () => void;
  activeTab: 'accounts' | 'transactions' | 'budgets' | 'peer_debts';
  setActiveTab: (tab: 'accounts' | 'transactions' | 'budgets' | 'peer_debts') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSync,
  onOpenTax,
  onOpenFlutter,
  activeTab,
  setActiveTab,
}) => {
  const {
    currentUser,
    setCurrentUserById,
    currency,
    setCurrency,
    theme,
    setTheme,
    setIsLocked,
    e2eeEnabled,
    peerBalances,
  } = useFinance();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const toggleTheme = () => {
    if (theme === 'dark') setTheme('midnight');
    else if (theme === 'midnight') setTheme('light');
    else setTheme('dark');
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-900/90 dark:bg-slate-950/95 border-b border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Security Status */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold text-xl">
              K
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  Kryptos<span className="text-emerald-400">Finance</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  {e2eeEnabled ? 'AES-256 E2EE' : 'Vault'}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Finanças Criptografadas & Controle de Dívidas
              </p>
            </div>
          </div>

          {/* User Switcher (For Peer Attribution Simulation) */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-sm text-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              aria-label="Trocar perfil de usuário para testar atribuição de dívida"
            >
              <span className="text-base">{currentUser.avatar}</span>
              <div className="text-left hidden md:block">
                <div className="text-xs font-semibold leading-none">{currentUser.name}</div>
                <div className="text-[10px] text-emerald-400 leading-tight">
                  {currentUser.id === 'user_evellyn' ? 'Conta Principal' : 'Usuário Par'}
                </div>
              </div>
              <Users className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800 mb-1">
                  Atribuição de Dívida: Simular Outro Usuário
                </div>
                {KNOWN_USERS.map((user) => {
                  const isSelected = user.id === currentUser.id;
                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        setCurrentUserById(user.id);
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                        isSelected
                          ? 'bg-emerald-500/15 text-emerald-400 font-medium'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{user.avatar}</span>
                        <div>
                          <div className="text-xs font-medium">{user.name}</div>
                          <div className="text-[10px] text-slate-400">{user.email}</div>
                        </div>
                      </div>
                      {isSelected && (
                        <span className="text-[10px] bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                          Ativo
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions & Settings */}
          <div className="flex items-center space-x-2">
            {/* Currency selector */}
            <div className="hidden sm:flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/80 text-xs">
              {(['BRL', 'USD', 'EUR'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-2 py-1 rounded-md font-semibold transition-all ${
                    currency === c
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {c === 'BRL' ? 'R$' : c === 'USD' ? '$' : '€'}
                </button>
              ))}
            </div>

            {/* Sync Hub */}
            <button
              onClick={onOpenSync}
              title="Sincronização Multiplataforma (Mobile/Desktop)"
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-emerald-400 transition-colors relative"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>

            {/* Tax & Export Reports */}
            <button
              onClick={onOpenTax}
              title="Relatório Fiscal & IRPF"
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-blue-400 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>

            {/* Flutter Codebase Hub */}
            <button
              onClick={onOpenFlutter}
              title="Ver / Baixar Código Flutter (Dart)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-semibold transition-all"
            >
              <Code2 className="w-4 h-4" />
              <span className="hidden md:inline">Flutter App</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={`Tema Atual: ${theme} (Clique para alternar Dark / Midnight / Light)`}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-amber-400 transition-colors"
            >
              {theme === 'light' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : theme === 'midnight' ? (
                <Flame className="w-4 h-4 text-purple-400" />
              ) : (
                <Moon className="w-4 h-4 text-cyan-400" />
              )}
            </button>

            {/* Biometric Quick Lock */}
            <button
              onClick={() => setIsLocked(true)}
              title="Bloquear Cofre com Biometria"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bloquear</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Material 3 Segmented Filter) */}
        <div className="flex space-x-1 sm:space-x-2 border-t border-slate-800/80 py-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('accounts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'accounts'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            💳 Contas & Dívidas
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'transactions'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            📋 Transações & Extrato
          </button>
          <button
            onClick={() => setActiveTab('budgets')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'budgets'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            📊 Orçamento em Tempo Real
          </button>
          <button
            onClick={() => setActiveTab('peer_debts')}
            className={`relative px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'peer_debts'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            🤝 Dívidas Entre Amigos (IOU)
            {peerBalances.owedToMe > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-emerald-500 text-[10px] text-slate-950 font-extrabold">
                +R${Math.round(peerBalances.owedToMe)}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
