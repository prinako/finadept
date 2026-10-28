import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/financial';
import { TaxCategory, Transaction, TransactionType } from '../types/finance';
import {
  ListFilter,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Tag,
  ShieldCheck,
  Calendar,
  Trash2,
  Receipt,
  FileCheck2,
} from 'lucide-react';

export const TransactionsView: React.FC = () => {
  const {
    transactions,
    accounts,
    currency,
    addTransaction,
    deleteTransaction,
  } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [txType, setTxType] = useState<TransactionType>('expense');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('Alimentação & Mercado');
  const [txDescription, setTxDescription] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().slice(0, 10));
  const [isTaxDeductible, setIsTaxDeductible] = useState(false);
  const [taxCategory, setTaxCategory] = useState<TaxCategory>('health');

  // Filter logic
  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterType === 'income') return t.type === 'income';
    if (filterType === 'expense') return t.type === 'expense';
    if (filterType === 'debt_payment') return t.type === 'debt_payment';
    if (filterType === 'deductible') return t.isTaxDeductible;
    return true;
  });

  const totalInflow = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalOutflow = transactions
    .filter((t) => t.type === 'expense' || t.type === 'debt_payment')
    .reduce((acc, t) => acc + t.amount, 0);

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(txAmount);
    if (!amount || amount <= 0 || !txDescription.trim()) return;

    addTransaction({
      accountId: accountId || accounts[0]?.id || 'acc_default',
      type: txType,
      amount,
      category: txCategory,
      description: txDescription.trim(),
      date: txDate,
      status: 'cleared',
      isTaxDeductible,
      taxCategory: isTaxDeductible ? taxCategory : 'none',
    });

    setIsAddOpen(false);
    setTxAmount('');
    setTxDescription('');
    setIsTaxDeductible(false);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Entradas</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-1 text-2xl font-bold text-emerald-400">
            +{formatCurrency(totalInflow, currency)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Saídas & Parcelas</span>
            <ArrowUpRight className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-1 text-2xl font-bold text-red-400">
            -{formatCurrency(totalOutflow, currency)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Despesas Dedutíveis (IRPF)</span>
            <FileCheck2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-1 text-2xl font-bold text-blue-400">
            {formatCurrency(
              transactions
                .filter((t) => t.isTaxDeductible)
                .reduce((acc, t) => acc + t.amount, 0),
              currency
            )}
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por descrição, estabelecimento ou categoria..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'income', label: 'Entradas' },
            { id: 'expense', label: 'Saídas' },
            { id: 'debt_payment', label: 'Parcelas' },
            { id: 'deductible', label: 'Dedutível' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Nova Transação
          </button>
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <div className="divide-y divide-slate-800/80">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Nenhuma transação encontrada com os filtros atuais.
            </div>
          ) : (
            filtered.map((tx) => {
              const account = accounts.find((a) => a.id === tx.accountId);
              const isIncome = tx.type === 'income';

              return (
                <div
                  key={tx.id}
                  className="p-4 hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isIncome
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : tx.type === 'debt_payment'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-red-500/15 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : tx.type === 'debt_payment' ? (
                        <CreditCard className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {tx.description}
                        </span>
                        {tx.isTaxDeductible && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            IRPF {tx.taxCategory.toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span>{tx.category}</span>
                        <span>•</span>
                        <span>{account?.name || 'Conta Padrão'}</span>
                        <span>•</span>
                        <span>{tx.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div
                        className={`text-sm sm:text-base font-extrabold ${
                          isIncome
                            ? 'text-emerald-400'
                            : tx.type === 'debt_payment'
                            ? 'text-amber-300'
                            : 'text-red-400'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                        {formatCurrency(tx.amount, currency)}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {tx.status === 'cleared' ? 'Liquidado' : 'Pendente'}
                      </span>
                    </div>

                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      title="Excluir transação"
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal: New Transaction */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-1">Registrar Nova Transação</h3>
            <p className="text-xs text-slate-400 mb-4">
              Lançamento com categorização e marcação para dedução de impostos
            </p>

            <form onSubmit={handleCreateTransaction} className="space-y-3.5">
              {/* Type Switcher */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'expense', label: 'Despesa' },
                  { id: 'income', label: 'Receita' },
                  { id: 'debt_payment', label: 'Parcela Dívida' },
                ].map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setTxType(t.id as TransactionType)}
                    className={`py-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                      txType === t.id
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Account Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Conta de Origem/Destino</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.type === 'credit' ? `Dívida: R$ ${a.totalDebt.toFixed(2)}` : `Saldo: R$ ${a.balance.toFixed(2)}`})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Categoria</label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Alimentação & Mercado">Alimentação & Mercado</option>
                  <option value="Dívidas & Empréstimos">Dívidas & Empréstimos</option>
                  <option value="Moradia & Contas">Moradia & Contas</option>
                  <option value="Transporte">Transporte</option>
                  <option value="Saúde & Farmácia">Saúde & Farmácia</option>
                  <option value="Educação">Educação</option>
                  <option value="Lazer & Cultura">Lazer & Cultura</option>
                  <option value="Salário & Renda">Salário & Renda</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Parcela Banco Pan, Supermercado..."
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Tax deductible toggle */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTaxDeductible}
                    onChange={(e) => setIsTaxDeductible(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-800 border-slate-700"
                  />
                  <span className="text-xs font-semibold text-slate-200">
                    Despesa dedutível para fins fiscais (IRPF / Declaração)
                  </span>
                </label>

                {isTaxDeductible && (
                  <div className="pl-6 pt-1">
                    <select
                      value={taxCategory}
                      onChange={(e) => setTaxCategory(e.target.value as TaxCategory)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                    >
                      <option value="health">Saúde (Médicos, Dentistas, Hospitais)</option>
                      <option value="education">Educação (Faculdade, Escolas, Cursos)</option>
                      <option value="business">Despesa Profissional / Livro Caixa</option>
                      <option value="charity">Doações Incentivadas</option>
                      <option value="housing">Previdência Privada / PGBL</option>
                    </select>
                  </div>
                )}
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
                  Registrar Transação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
