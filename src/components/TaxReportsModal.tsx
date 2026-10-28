import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, generateTaxSummary, exportToCsv } from '../utils/financial';
import {
  FileSpreadsheet,
  Download,
  Printer,
  ShieldCheck,
  FileCheck,
  Lock,
  Upload,
  Calendar,
  X,
  CheckCircle2,
} from 'lucide-react';

interface TaxReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TaxReportsModal: React.FC<TaxReportsModalProps> = ({ isOpen, onClose }) => {
  const {
    transactions,
    accounts,
    peerDebts,
    currency,
    currentUser,
    exportVaultEncrypted,
    importVaultEncrypted,
    vaultPassphrase,
  } = useFinance();

  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [backupPassphrase, setBackupPassphrase] = useState<string>(vaultPassphrase || 'kryptos@2026');
  const [backupJsonOutput, setBackupJsonOutput] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'tax_summary' | 'backup_e2ee'>('tax_summary');

  if (!isOpen) return null;

  const taxSummary = generateTaxSummary(transactions, accounts, selectedYear);

  const handleDownloadCsv = () => {
    const csvContent = exportToCsv(transactions, accounts, peerDebts);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kryptos_relatorio_fiscal_${selectedYear}_${currentUser.name.replace(/\s+/g, '_')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleGenerateEncryptedBackup = async () => {
    const jsonStr = await exportVaultEncrypted(backupPassphrase);
    setBackupJsonOutput(jsonStr);

    // Also download file
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kryptos_vault_backup_e2ee_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result as string;
      const ok = await importVaultEncrypted(content, backupPassphrase);
      if (ok) {
        setImportStatus('Backup restaurado com sucesso! Dados sincronizados.');
      } else {
        setImportStatus('Erro: Senha mestra incorreta ou arquivo corrompido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in print:p-0 print:bg-white">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative print:border-none print:shadow-none print:max-h-none print:w-full print:bg-white print:text-black">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white print:text-black">
              Relatório Fiscal & Gestão Pessoal de Registros (IRPF)
            </h2>
            <p className="text-xs text-slate-400 print:text-gray-600">
              Extrato consolidado com despesas dedutíveis, bens e dívidas declaradas
            </p>
          </div>
        </div>

        {/* Mode Selector (Tabs) */}
        <div className="flex space-x-2 border-b border-slate-800 pb-3 mb-6 print:hidden">
          <button
            onClick={() => setActiveTab('tax_summary')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'tax_summary'
                ? 'bg-blue-500 text-slate-950 shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            📋 Demonstrativo Fiscal ({selectedYear})
          </button>
          <button
            onClick={() => setActiveTab('backup_e2ee')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'backup_e2ee'
                ? 'bg-blue-500 text-slate-950 shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            🔐 Backup Criptografado E2EE (AES-256)
          </button>
        </div>

        {activeTab === 'tax_summary' ? (
          <div className="space-y-6">
            {/* Year Selector & Quick Export Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 print:hidden">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-300">Ano-Calendário:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 text-xs text-white"
                >
                  <option value={2026}>2026 (Exercício 2027)</option>
                  <option value={2025}>2025 (Exercício 2026)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadCsv}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  Baixar Planilha CSV
                </button>
                <button
                  onClick={handlePrintReport}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-xs font-bold text-slate-950 shadow-md shadow-blue-500/20"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir / PDF Oficial
                </button>
              </div>
            </div>

            {/* Official Tax Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-xs text-slate-400">Rendimentos Tributáveis</span>
                <div className="mt-1 text-xl font-bold text-white print:text-black">
                  {formatCurrency(taxSummary.totalIncome, currency)}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-xs text-slate-400">Total Despesas Declaradas</span>
                <div className="mt-1 text-xl font-bold text-slate-200 print:text-black">
                  {formatCurrency(taxSummary.totalExpenses, currency)}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <span className="text-xs text-blue-400 font-semibold">Total Deduções Fiscais</span>
                <div className="mt-1 text-xl font-black text-blue-300 print:text-black">
                  {formatCurrency(taxSummary.totalDeductible, currency)}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-xs text-emerald-400 font-semibold">Bens e Direitos (Ativos)</span>
                <div className="mt-1 text-xl font-black text-emerald-300 print:text-black">
                  {formatCurrency(taxSummary.totalAssetsDeclared, currency)}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <span className="text-xs text-red-400 font-semibold">Dívidas e Ônus Reais (Passivos)</span>
                <div className="mt-1 text-xl font-black text-red-300 print:text-black">
                  {formatCurrency(taxSummary.totalDebtsDeclared, currency)}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <span className="text-xs text-purple-400 font-semibold">Base de Cálculo Líquida</span>
                <div className="mt-1 text-xl font-black text-purple-300 print:text-black">
                  {formatCurrency(taxSummary.netTaxableBase, currency)}
                </div>
              </div>
            </div>

            {/* Deductions Breakdown by Category */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <h4 className="text-sm font-bold text-white mb-3 print:text-black">
                Detalhamento das Deduções Legais (Saúde, Educação, Previdência)
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Despesas Médicas & Saúde (Sem limite legal)</span>
                  <span className="font-semibold text-white print:text-black">
                    {formatCurrency(taxSummary.deductionsByCategory.health, currency)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Instrução & Educação</span>
                  <span className="font-semibold text-white print:text-black">
                    {formatCurrency(taxSummary.deductionsByCategory.education, currency)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Despesas de Atividade Profissional / Livro Caixa</span>
                  <span className="font-semibold text-white print:text-black">
                    {formatCurrency(taxSummary.deductionsByCategory.business, currency)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Previdência Complementar & Outras</span>
                  <span className="font-semibold text-white print:text-black">
                    {formatCurrency(taxSummary.deductionsByCategory.housing, currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Declared Debts breakdown table */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <h4 className="text-sm font-bold text-white mb-2 print:text-black">
                Quadro de Dívidas Declaradas (Código 11 - Dívidas e Ônus Reais)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800">
                      <th className="py-2">Credor / Instituição</th>
                      <th className="py-2">Tipo</th>
                      <th className="py-2">Saldo Devedor</th>
                      <th className="py-2">Parcela Mensal</th>
                      <th className="py-2">Vencimento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {accounts
                      .filter((a) => a.totalDebt > 0)
                      .map((acc) => (
                        <tr key={acc.id} className="text-slate-200 print:text-black">
                          <td className="py-2 font-medium">{acc.institution}</td>
                          <td className="py-2">{acc.type}</td>
                          <td className="py-2 font-bold text-red-400">
                            {formatCurrency(acc.totalDebt, currency)}
                          </td>
                          <td className="py-2 text-amber-300">
                            {formatCurrency(acc.monthlyInstallment, currency)}
                          </td>
                          <td className="py-2">{acc.dueDate || '-'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* E2EE Backup Section */
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-slate-300">
              <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm mb-1">
                <ShieldCheck className="w-5 h-5" />
                Criptografia Ponta a Ponta de Conhecimento Zero
              </div>
              Todos os seus dados financeiros, contas e dívidas são criptografados no navegador usando{' '}
              <strong>AES-GCM de 256 bits</strong> com chave derivada via <strong>PBKDF2 (100.000 iterações)</strong>.
              Nenhum dado desprotegido trafega pela rede.
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Chave Mestra de Criptografia do Cofre
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={backupPassphrase}
                    onChange={(e) => setBackupPassphrase(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                  />
                  <button
                    onClick={handleGenerateEncryptedBackup}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md whitespace-nowrap"
                  >
                    Gerar & Baixar Backup (.json)
                  </button>
                </div>
              </div>

              {/* Restore Section */}
              <div className="pt-4 border-t border-slate-800">
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-cyan-400" />
                  Restaurar Backup Criptografado
                </h4>
                <p className="text-xs text-slate-400 mb-3">
                  Selecione um arquivo .json exportado previamente para restaurar contas e transações.
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileRestore}
                  className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                />
                {importStatus && (
                  <p className="text-xs text-emerald-400 font-medium mt-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    {importStatus}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
