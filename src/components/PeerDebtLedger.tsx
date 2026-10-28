import React, { useState } from 'react';
import { useFinance, KNOWN_USERS } from '../context/FinanceContext';
import { formatCurrency } from '../utils/financial';
import { PeerDebt } from '../types/finance';
import {
  Users,
  HandCoins,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Share2,
  Copy,
  Check,
  QrCode,
  DollarSign,
} from 'lucide-react';

export const PeerDebtLedger: React.FC = () => {
  const {
    currentUser,
    availableUsers,
    setCurrentUserById,
    peerDebts,
    peerBalances,
    currency,
    addPeerDebt,
    markPeerDebtPaid,
    disputePeerDebt,
  } = useFinance();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [qrModalDebt, setQrModalDebt] = useState<PeerDebt | null>(null);

  // Form State
  const [targetUserId, setTargetUserId] = useState<string>('user_carlos');
  const [customDebtorName, setCustomDebtorName] = useState<string>('');
  const [debtAmount, setDebtAmount] = useState<string>('');
  const [debtDescription, setDebtDescription] = useState<string>('');
  const [debtDueDate, setDebtDueDate] = useState<string>('15/11/2026');
  const [direction, setDirection] = useState<'they_owe_me' | 'i_owe_them'>('they_owe_me');

  // Debts where others owe current user
  const owedToMeList = peerDebts.filter(
    (d) => d.creditorId === currentUser.id
  );

  // Debts where current user owes others
  const iOweList = peerDebts.filter(
    (d) => d.debtorId === currentUser.id
  );

  const handleCreatePeerDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(debtAmount);
    if (!amount || amount <= 0 || !debtDescription.trim()) return;

    const targetUser = availableUsers.find((u) => u.id === targetUserId);
    const targetName = targetUser ? targetUser.name : (customDebtorName || 'Amigo Convidado');

    if (direction === 'they_owe_me') {
      // Current user is creditor, target is debtor
      addPeerDebt({
        creditorId: currentUser.id,
        creditorName: currentUser.name,
        debtorId: targetUserId,
        debtorName: targetName,
        amount,
        description: debtDescription.trim(),
        dueDate: debtDueDate || undefined,
        category: 'Cobrança Compartilhada',
      });
    } else {
      // Target is creditor, current user is debtor
      addPeerDebt({
        creditorId: targetUserId,
        creditorName: targetName,
        debtorId: currentUser.id,
        debtorName: currentUser.name,
        amount,
        description: debtDescription.trim(),
        dueDate: debtDueDate || undefined,
        category: 'Dívida a Pagar',
      });
    }

    setIsAddModalOpen(false);
    setDebtAmount('');
    setDebtDescription('');
  };

  const copyPaymentLink = (debt: PeerDebt) => {
    const link = `https://kryptos.finance/pay?id=${debt.id}&amount=${debt.amount}&to=${encodeURIComponent(
      debt.creditorName
    )}`;
    navigator.clipboard?.writeText(link);
    setCopiedId(debt.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Simulation Banner (Switch User to see peer view live) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/60 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              Simulação de Usuários em Tempo Real
            </h4>
            <p className="text-xs text-slate-300">
              Você está visualizando como <strong className="text-emerald-400">{currentUser.name}</strong>.
              Troque para outro usuário para ver as dívidas atribuídas aparecerem diretamente na conta dele!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {availableUsers.map((u) => (
            <button
              key={u.id}
              onClick={() => setCurrentUserById(u.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                u.id === currentUser.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <span>{u.avatar}</span>
              <span>{u.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Owed To Current User */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
              Quem Me Deve (A Receber)
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
              Crédito
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-400">
            {formatCurrency(peerBalances.owedToMe, currency)}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {owedToMeList.filter((d) => d.status === 'unpaid').length} cobrança(s) pendente(s) de terceiros
          </p>
        </div>

        {/* Total Current User Owes */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 text-red-400" />
              A Quem Eu Devo (A Pagar)
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300">
              Débito
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-red-400">
            {formatCurrency(peerBalances.iOwe, currency)}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {iOweList.filter((d) => d.status === 'unpaid').length} pagamento(s) pendente(s) a amigos
          </p>
        </div>

        {/* Net Peer Balance */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/20 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
              Balanço Líquido Entre Amigos
            </span>
            <span className="text-xs font-bold text-slate-400">Saldo Net</span>
          </div>
          <div className="mt-2 text-2xl font-black text-white">
            {peerBalances.netPeerBalance >= 0 ? '+' : ''}
            {formatCurrency(peerBalances.netPeerBalance, currency)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {peerBalances.netPeerBalance >= 0
              ? 'Você tem saldo positivo a receber de terceiros'
              : 'Você tem mais dívidas com amigos do que a receber'}
          </p>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <HandCoins className="w-5 h-5 text-emerald-400" />
            Livro de Dívidas & Repasse entre Usuários
          </h3>
          <p className="text-xs text-slate-400">
            Atribua despesas compartilhadas para que apareçam na conta da outra pessoa
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          Atribuir Nova Cobrança
        </button>
      </div>

      {/* Main Grid: Who Owes Me vs Who I Owe */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Who Owes Me */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <ArrowDownLeft className="w-4 h-4" />
              Cobranças Emitidas por Você (A Receber)
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {owedToMeList.length} registro(s)
            </span>
          </div>

          {owedToMeList.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              Nenhuma dívida atribuída a amigos no momento.
            </div>
          ) : (
            owedToMeList.map((debt) => (
              <div
                key={debt.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  debt.status === 'paid'
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    : 'bg-slate-950/70 border-emerald-500/20 hover:border-emerald-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{debt.debtorName}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          debt.status === 'paid'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : debt.status === 'disputed'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-cyan-500/20 text-cyan-400'
                        }`}
                      >
                        {debt.status === 'paid'
                          ? 'Liquidado'
                          : debt.status === 'disputed'
                          ? 'Em Contestação'
                          : 'Aguardando Pagamento'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">{debt.description}</p>
                    {debt.dueDate && (
                      <span className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" /> Vence em: {debt.dueDate}
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-base font-extrabold text-emerald-400">
                      +{formatCurrency(debt.amount, currency)}
                    </div>
                    {debt.status !== 'paid' && (
                      <div className="flex items-center justify-end gap-1.5 mt-2">
                        <button
                          onClick={() => copyPaymentLink(debt)}
                          title="Copiar Link de Cobrança PIX"
                          className="p-1.5 text-xs text-slate-400 hover:text-white rounded bg-slate-800 hover:bg-slate-700"
                        >
                          {copiedId === debt.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => setQrModalDebt(debt)}
                          title="Exibir QR Code PIX"
                          className="p-1.5 text-xs text-slate-400 hover:text-white rounded bg-slate-800 hover:bg-slate-700"
                        >
                          <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                        </button>
                        <button
                          onClick={() => markPeerDebtPaid(debt.id)}
                          className="px-2 py-1 text-[11px] font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded shadow-sm"
                        >
                          Confirmar Recebido
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Section 2: Who I Owe */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-sm font-bold text-red-400 flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4" />
              Dívidas Atribuídas a Você (A Pagar)
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {iOweList.length} registro(s)
            </span>
          </div>

          {iOweList.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              Você não deve nada a nenhum amigo. Tudo quitado!
            </div>
          ) : (
            iOweList.map((debt) => (
              <div
                key={debt.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  debt.status === 'paid'
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    : 'bg-slate-950/70 border-red-500/20 hover:border-red-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{debt.creditorName}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          debt.status === 'paid'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : debt.status === 'disputed'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {debt.status === 'paid' ? 'Pago' : 'Você deve pagar'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">{debt.description}</p>
                    {debt.dueDate && (
                      <span className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" /> Vencimento: {debt.dueDate}
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-base font-extrabold text-red-400">
                      -{formatCurrency(debt.amount, currency)}
                    </div>
                    {debt.status !== 'paid' && (
                      <div className="flex items-center justify-end gap-1.5 mt-2">
                        <button
                          onClick={() => disputePeerDebt(debt.id)}
                          className="px-2 py-1 text-[11px] text-slate-400 hover:text-white rounded bg-slate-800 hover:bg-slate-700"
                        >
                          Contestar
                        </button>
                        <button
                          onClick={() => markPeerDebtPaid(debt.id)}
                          className="px-3 py-1 text-[11px] font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded shadow-md shadow-emerald-500/20 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Pagar Agora
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal: Atribuir Dívida a Outro Usuário */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <HandCoins className="w-5 h-5 text-emerald-400" />
              Atribuir Cobrança / Dívida a Outro Usuário
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Essa pendência aparecerá imediatamente na conta do usuário selecionado.
            </p>

            <form onSubmit={handleCreatePeerDebt} className="space-y-3.5">
              {/* Direction selector */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tipo de Registro</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDirection('they_owe_me')}
                    className={`p-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                      direction === 'they_owe_me'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    Outra pessoa me deve
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirection('i_owe_them')}
                    className={`p-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                      direction === 'i_owe_them'
                        ? 'bg-red-500/20 border-red-500 text-red-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    Eu devo para outra pessoa
                  </button>
                </div>
              </div>

              {/* User Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Selecionar Contato / Usuário
                </label>
                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {availableUsers
                    .filter((u) => u.id !== currentUser.id)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.avatar} {u.name} ({u.email})
                      </option>
                    ))}
                  <option value="custom">+ Outro Contato (Digitar Nome)</option>
                </select>
              </div>

              {targetUserId === 'custom' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nome do Amigo</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Roberto Santos"
                    value={customDebtorName}
                    onChange={(e) => setCustomDebtorName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
              )}

              {/* Amount & Due Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={debtAmount}
                    onChange={(e) => setDebtAmount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Data Limite</label>
                  <input
                    type="text"
                    placeholder="15/11/2026"
                    value={debtDueDate}
                    onChange={(e) => setDebtDueDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Motivo / Descrição da Despesa
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Almoço restaurante, Uber dividido, Show..."
                  value={debtDescription}
                  onChange={(e) => setDebtDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20"
                >
                  Registrar & Atribuir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrModalDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center relative">
            <h3 className="text-base font-bold text-white mb-1">Cobrança Instantânea PIX</h3>
            <p className="text-xs text-slate-400 mb-4">
              {qrModalDebt.description} • {formatCurrency(qrModalDebt.amount, currency)}
            </p>

            <div className="bg-white p-4 rounded-2xl inline-block mx-auto mb-4 shadow-lg">
              {/* Simulated QR Code SVG */}
              <svg className="w-44 h-44 text-slate-950" viewBox="0 0 100 100" fill="currentColor">
                <path d="M10 10h30v30h-30zM15 15v20h20v-20zM22 22h6v6h-6zM60 10h30v30h-30zM65 15v20h20v-20zM72 22h6v6h-6zM10 60h30v30h-30zM15 65v20h20v-20zM22 72h6v6h-6zM55 55h10v10h-10zM70 55h15v5h-15zM55 70h5v15h-5zM65 80h20v5h-20zM80 65h5v15h-5z" />
              </svg>
            </div>

            <p className="text-[11px] text-slate-400 font-mono break-all mb-4 bg-slate-950 p-2 rounded-lg border border-slate-800">
              00020126580014br.gov.bcb.pix0136kryptos-e2ee-{qrModalDebt.id}5204000053039865405{qrModalDebt.amount.toFixed(2)}5802BR5913{qrModalDebt.creditorName}
            </p>

            <button
              onClick={() => setQrModalDebt(null)}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
