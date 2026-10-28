import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  Smartphone,
  Laptop,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  QrCode,
  X,
  Radio,
  CheckCircle2,
} from 'lucide-react';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({ isOpen, onClose }) => {
  const { syncCode, regenerateSyncCode, lastSyncTime } = useFinance();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(syncCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Sincronização Multiplataforma</h2>
            <p className="text-xs text-slate-400">
              Sincronize em tempo real entre celular (iOS/Android) e computador (Desktop/Web)
            </p>
          </div>
        </div>

        {/* Real-time Status Card */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 mb-6">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Broadcast Sync Ativo
            </span>
            <span className="text-[11px] text-slate-500">Último envio: {lastSyncTime}</span>
          </div>
          <p className="text-xs text-slate-300 mt-2">
            Qualquer alteração feita no desktop ou em abas abertas sincroniza instantaneamente sem necessidade de recarregar a página.
          </p>
        </div>

        {/* Sync Code & Pairing */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Código Criptografado de Pareamento de Dispositivo
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 font-mono text-base font-bold text-cyan-400 tracking-wider">
                {syncCode}
              </div>
              <button
                onClick={handleCopyCode}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
              <button
                onClick={regenerateSyncCode}
                title="Gerar novo código"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Pairing Instructions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <Smartphone className="w-5 h-5 text-cyan-400 mb-1.5" />
              <h4 className="text-xs font-bold text-white">No Celular (Mobile PWA)</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Abra no Safari ou Chrome e selecione <strong>"Adicionar à Tela de Início"</strong> para instalar o aplicativo nativo com suporte offline.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <Laptop className="w-5 h-5 text-emerald-400 mb-1.5" />
              <h4 className="text-xs font-bold text-white">No Computador (Desktop)</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Os dados são salvos no cofre criptografado local e transmitidos em tempo real para qualquer janela conectada.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
