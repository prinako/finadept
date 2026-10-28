import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/financial';
import {
  PieChart,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Sparkles,
  Edit3,
  Calendar,
  Layers,
} from 'lucide-react';

export const BudgetTracker: React.FC = () => {
  const {
    budgetStatuses,
    currency,
    updateBudgetLimit,
  } = useFinance();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLimitValue, setEditLimitValue] = useState<string>('');

  // Calculate overall monthly budget stats
  const totalBudgeted = budgetStatuses.reduce((acc, b) => acc + b.monthlyLimit, 0);
  const totalSpent = budgetStatuses.reduce((acc, b) => acc + b.spent, 0);
  const totalRemaining = Math.max(0, totalBudgeted - totalSpent);
  const overallPercentage = totalBudgeted > 0 ? Math.min(100, (totalSpent / totalBudgeted) * 100) : 0;

  // Days left in current month for daily burn rate allowance
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = Math.max(1, daysInMonth - now.getDate());
  const dailyAllowance = totalRemaining / daysLeft;

  const handleSaveLimit = (id: string) => {
    const val = parseFloat(editLimitValue);
    if (!isNaN(val) && val >= 0) {
      updateBudgetLimit(id, val);
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Budget Overview */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Orçamento Mensal Total
              </span>
              <span className="text-xs font-bold text-emerald-400">
                {overallPercentage.toFixed(1)}% utilizado
              </span>
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {formatCurrency(totalSpent, currency)}
              <span className="text-xs text-slate-500 font-normal ml-2">
                de {formatCurrency(totalBudgeted, currency)}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  overallPercentage >= 100
                    ? 'bg-red-500'
                    : overallPercentage >= 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${overallPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 mt-1.5">
              <span>R$ 0,00</span>
              <span>Disponível: {formatCurrency(totalRemaining, currency)}</span>
            </div>
          </div>
        </div>

        {/* Daily Spending Allowance */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/20 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Meta de Gasto Diário
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
              {daysLeft} dias restantes
            </span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-cyan-300">
            {formatCurrency(dailyAllowance, currency)}
            <span className="text-xs text-slate-400 font-normal ml-1">/ dia</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Ritmo recomendado para não estourar o orçamento até o fim do mês
          </p>
        </div>

        {/* Real-Time Alerts */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Monitoramento em Tempo Real
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <div className="mt-3 space-y-1.5 text-xs">
            {budgetStatuses.filter((b) => b.isOverBudget).length > 0 ? (
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  {budgetStatuses.filter((b) => b.isOverBudget).length} categorias ultrapassaram o limite definido!
                </span>
              </div>
            ) : budgetStatuses.filter((b) => b.isNearLimit).length > 0 ? (
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  Atenção: {budgetStatuses.filter((b) => b.isNearLimit).length} categoria(s) atingiram mais de 80% da cota.
                </span>
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Todos os orçamentos sob controle e dentro dos limites seguros.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Categories Breakdown */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              Categorias & Cotas de Gastos
            </h3>
            <p className="text-xs text-slate-400">
              Acompanhamento detalhado com gatilhos de alerta instantâneos
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgetStatuses.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all ${
                item.isOverBudget
                  ? 'bg-red-950/20 border-red-500/30'
                  : item.isNearLimit
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-semibold text-sm text-slate-200">{item.category}</span>
                </div>

                <div className="flex items-center gap-2">
                  {editingId === item.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        className="w-20 px-2 py-0.5 text-xs bg-slate-800 border border-slate-600 rounded text-white"
                        value={editLimitValue}
                        onChange={(e) => setEditLimitValue(e.target.value)}
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveLimit(item.id)}
                        className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500 text-slate-950 rounded hover:bg-emerald-400"
                      >
                        OK
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(item.id);
                        setEditLimitValue(item.monthlyLimit.toString());
                      }}
                      title="Alterar cota"
                      className="p-1 text-slate-500 hover:text-slate-300 rounded hover:bg-slate-800"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      item.isOverBudget
                        ? 'bg-red-500/20 text-red-400'
                        : item.isNearLimit
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {item.rawPercentage.toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Amount Progress */}
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">
                    Gasto: <strong className="text-white">{formatCurrency(item.spent, currency)}</strong>
                  </span>
                  <span className="text-slate-400">
                    Limite: <strong className="text-slate-300">{formatCurrency(item.monthlyLimit, currency)}</strong>
                  </span>
                </div>

                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      item.isOverBudget
                        ? 'bg-red-500'
                        : item.isNearLimit
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] mt-1.5 text-slate-500">
                  <span>
                    {item.isOverBudget
                      ? `Estourado por ${formatCurrency(item.spent - item.monthlyLimit, currency)}`
                      : `Restam ${formatCurrency(item.remaining, currency)}`}
                  </span>
                  {item.isNearLimit && (
                    <span className="text-amber-400 font-medium">Alerta de limite (80%+)</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
