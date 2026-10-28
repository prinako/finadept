import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, parseBrazilianCsv } from '../utils/financial';
import { Account, AccountType } from '../types/finance';
import {
  CreditCard,
  Building2,
  Calendar,
  AlertTriangle,
  Plus,
  FileSpreadsheet,
  Trash2,
  Edit2,
  Wallet,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';

const BANK_PRESETS = [
  { name: 'Banco Pan', color: '#0055ff', institution: 'Banco Pan' },
  { name: 'Nubank', color: '#820ad1', institution: 'Nubank' },
  { name: 'Santander', color: '#ec0000', institution: 'Santander' },
  { name: 'Neon', color: '#00e5b7', institution: 'Neon' },
  { name: 'Banco Inter', color: '#ff7a00', institution: 'Banco Inter' },
  { name: 'Itaú', color: '#ec7000', institution: 'Itaú' },
  { name: 'Bradesco', color: '#cc092f', institution: 'Bradesco' },
  { name: 'Caixa', color: '#0066b3', institution: 'Caixa Econômica' },
];

export const AccountsView: React.FC = () => {
  const {
    accounts,
    currency,
    totalDebts,
    monthlyDebtCommitment,
    netWorth,
    addAccount,
    updateAccount,
    deleteAccount,
    importAccountsFromSpreadsheet,
  } = useFinance();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [csvRawText, setCsvRawText] = useState(
`Santander,,,Neon,,,Banco Pan,
Total ,"R$ 0,00",,Total ,"R$ 0,00",,Total ,"R$ 2.497,11"
Valor por mês,"R$ 0,00",,Valor por mês,"R$ 0,00",,Valor por mês,"R$ 553,39"
Data de vencimento,10/11/2026,,Data de vencimento,02/11/2026,,Data de vencimento,13/11/2026
,,,,,,,
Nubank,,,,,,,
Total ,"R$ 0,00",,,,,,
Valor por mês,"R$ 0,00",,,,,,
Data de vencimento,05/11/2026,,,,,,
,,,,,,,
O Valor Total em Dívidas,,,"R$ 2.497,11",,,,
O Valor Total em Dívidas Por mês,,,"R$ 553,39",,,,`
  );

  // Form state
  const [formName, setFormName] = useState('');
  const [formInstitution, setFormInstitution] = useState('');
  const [formType, setFormType] = useState<AccountType>('credit');
  const [formBalance, setFormBalance] = useState('0');
  const [formTotalDebt, setFormTotalDebt] = useState('0');
  const [formMonthlyInstallment, setFormMonthlyInstallment] = useState('0');
  const [formDueDate, setFormDueDate] = useState('');
  const [formColor, setFormColor] = useState('#0055ff');

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    addAccount({
      name: formName.trim(),
      institution: formInstitution.trim() || formName.trim(),
      type: formType,
      balance: parseFloat(formBalance) || 0,
      totalDebt: parseFloat(formTotalDebt) || 0,
      monthlyInstallment: parseFloat(formMonthlyInstallment) || 0,
      dueDate: formDueDate.trim() || undefined,
      color: formColor,
      accountNumber: `•••• ${Math.floor(1000 + Math.random() * 9000)}`,
    });

    setIsAddOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormName('');
    setFormInstitution('');
    setFormType('credit');
    setFormBalance('0');
    setFormTotalDebt('0');
    setFormMonthlyInstallment('0');
    setFormDueDate('');
    setFormColor('#0055ff');
  };

  const handleImportCsv = () => {
    if (!csvRawText.trim()) return;
    const parsed = parseBrazilianCsv(csvRawText);
    importAccountsFromSpreadsheet(parsed);
    setIsImportOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Total Debts & Monthly Commitment (Matching user's spreadsheet attachment) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Debts Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-950/60 via-slate-900 to-slate-900 border border-red-500/30 p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4" />
              O Valor Total em Dívidas
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300">
              Passivos
            </span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-white tracking-tight">
            {formatCurrency(totalDebts, currency)}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Soma consolidada de cartões & linhas de crédito
          </p>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-red-500/10 blur-xl pointer-events-none"></div>
        </div>

        {/* Monthly Installment / Commitment */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-900 border border-amber-500/30 p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              O Valor Total em Dívidas Por Mês
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
              Compromisso Mensal
            </span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
            {formatCurrency(monthlyDebtCommitment, currency)}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Parcelas correntes com vencimento neste mês
          </p>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-amber-500/10 blur-xl pointer-events-none"></div>
        </div>

        {/* Liquid Assets / Net Worth */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              Patrimônio Líquido Real
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
              Ativos - Dívidas
            </span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
            {formatCurrency(netWorth, currency)}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Disponível em conta corrente e investimentos
          </p>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-emerald-500/10 blur-xl pointer-events-none"></div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            Contas Bancárias & Cartões de Crédito
          </h2>
          <p className="text-xs text-slate-400">
            Gerenciamento com controle de vencimentos e amortização de dívidas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Importar / Sincronizar Planilha
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            Adicionar Conta / Linha
          </button>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {accounts.map((acc) => {
          const isDebtAccount = acc.totalDebt > 0 || acc.type === 'credit';
          return (
            <div
              key={acc.id}
              className="relative overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all p-5 shadow-lg flex flex-col justify-between group"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-md"
                      style={{ backgroundColor: acc.color }}
                    >
                      {acc.institution.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm">{acc.name}</h3>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        {acc.type === 'credit'
                          ? 'Cartão de Crédito / Fatura'
                          : acc.type === 'checking'
                          ? 'Conta Corrente'
                          : acc.type === 'savings'
                          ? 'Reserva / Investimento'
                          : 'Empréstimo'}
                        {acc.accountNumber && ` • ${acc.accountNumber}`}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteAccount(acc.id)}
                    title="Remover conta"
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Values Breakdown */}
                <div className="mt-5 space-y-2.5">
                  {/* Total Debt if any */}
                  {acc.totalDebt > 0 ? (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-red-400 font-medium">Total em Dívida:</span>
                        <span className="font-extrabold text-red-300 text-sm">
                          {formatCurrency(acc.totalDebt, currency)}
                        </span>
                      </div>
                      {acc.monthlyInstallment > 0 && (
                        <div className="flex items-center justify-between text-xs mt-1.5 pt-1.5 border-t border-red-500/15">
                          <span className="text-slate-400">Valor por mês:</span>
                          <span className="font-semibold text-amber-300">
                            {formatCurrency(acc.monthlyInstallment, currency)}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-emerald-400 font-medium">Saldo Disponível:</span>
                        <span className="font-extrabold text-emerald-300 text-sm">
                          {formatCurrency(acc.balance, currency)}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Zero dívida acumulada • Situação Regular
                      </div>
                    </div>
                  )}

                  {/* Due Date Indicator */}
                  {acc.dueDate && (
                    <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/60 px-3 py-2 rounded-lg border border-slate-800/80">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        Data de vencimento:
                      </span>
                      <span className="font-bold text-slate-200">{acc.dueDate}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">
                  {acc.totalDebt > 0 ? 'Status: Com parcelamento ativo' : 'Status: Liquidado'}
                </span>
                {acc.totalDebt > 0 && (
                  <button
                    onClick={() => {
                      updateAccount(acc.id, {
                        totalDebt: Math.max(0, acc.totalDebt - (acc.monthlyInstallment || 100)),
                      });
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    Amortizar Parcela →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add New Account */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-1">Nova Conta ou Cartão de Crédito</h3>
            <p className="text-xs text-slate-400 mb-4">
              Cadastre contas com controle de fatura, parcelas e vencimentos
            </p>

            <form onSubmit={handleCreateAccount} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nome da Conta / Cartão
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Banco Pan, Santander, Nubank"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tipo</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as AccountType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="credit">Cartão / Linha de Crédito</option>
                    <option value="checking">Conta Corrente</option>
                    <option value="savings">Poupança / Reserva</option>
                    <option value="loan">Empréstimo / Financiamento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Vencimento (DD/MM/AAAA)
                  </label>
                  <input
                    type="text"
                    placeholder="13/11/2026"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {formType === 'credit' || formType === 'loan' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Total em Dívida (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formTotalDebt}
                      onChange={(e) => setFormTotalDebt(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Valor por mês (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formMonthlyInstallment}
                      onChange={(e) => setFormMonthlyInstallment(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Saldo Inicial (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formBalance}
                    onChange={(e) => setFormBalance(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              {/* Bank Color presets */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Instituição & Cor
                </label>
                <div className="flex flex-wrap gap-2">
                  {BANK_PRESETS.map((b) => (
                    <button
                      type="button"
                      key={b.name}
                      onClick={() => {
                        setFormInstitution(b.institution);
                        setFormColor(b.color);
                        if (!formName) setFormName(b.name);
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200"
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20"
                >
                  Salvar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Import / Sincronizar Planilha CSV */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              Importar Planilha de Dívidas & Bancos (CSV)
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Formato compatível com a planilha anexada (Santander, Neon, Banco Pan, Nubank).
            </p>

            <div className="space-y-3">
              <textarea
                rows={8}
                value={csvRawText}
                onChange={(e) => setCsvRawText(e.target.value)}
                className="w-full font-mono text-xs bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs text-slate-300">
                <div className="font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4" />
                  Visualização Prévia do Parser:
                </div>
                {(() => {
                  try {
                    const parsed = parseBrazilianCsv(csvRawText);
                    return (
                      <div className="space-y-1 mt-1 text-[11px]">
                        {parsed.map((p, i) => (
                          <div key={i} className="flex justify-between border-b border-slate-700/40 pb-1">
                            <span className="font-bold text-slate-100">{p.name}:</span>
                            <span>Total: R$ {p.totalDebt?.toFixed(2)} | Parcela: R$ {p.monthlyInstallment?.toFixed(2)} | Venc: {p.dueDate || '-'}</span>
                          </div>
                        ))}
                      </div>
                    );
                  } catch {
                    return <span className="text-red-400">Erro ao interpretar CSV.</span>;
                  }
                })()}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsImportOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={handleImportCsv}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20"
                >
                  Importar & Atualizar Saldos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
