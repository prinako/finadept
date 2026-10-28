import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Fingerprint, Lock, ShieldCheck, KeyRound, Sparkles, CheckCircle2 } from 'lucide-react';

export const BiometricModal: React.FC = () => {
  const {
    isLocked,
    unlockWithBiometrics,
    unlockWithPassphrase,
    currentUser,
    isBiometricSupported,
  } = useFinance();

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  if (!isLocked) return null;

  const handleBiometricClick = async () => {
    setIsScanning(true);
    try {
      await unlockWithBiometrics();
    } finally {
      setIsScanning(false);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = unlockWithPassphrase(pinInput);
    if (!success) {
      setPinError(true);
      setTimeout(() => setPinError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-12 -left-12 w-40 h-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-40 h-40 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        {/* Security Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
          <ShieldCheck className="w-3.5 h-3.5" />
          Cofre Criptografado AES-256
        </div>

        {/* User Avatar */}
        <div className="text-4xl mb-2">{currentUser.avatar}</div>
        <h2 className="text-xl font-black text-white tracking-tight">{currentUser.name}</h2>
        <p className="text-xs text-slate-400 mt-1 mb-8">
          Autentique com biometria ou PIN para acessar suas finanças
        </p>

        {/* Biometric Scanner Button */}
        <div className="relative flex justify-center mb-8">
          <button
            onClick={handleBiometricClick}
            disabled={isScanning}
            className={`w-24 h-24 rounded-full flex items-center justify-center relative transition-all duration-300 focus:outline-none ${
              isScanning
                ? 'bg-emerald-500/20 text-emerald-300 scale-105'
                : 'bg-slate-800/80 hover:bg-slate-700/80 text-emerald-400 hover:text-emerald-300 shadow-xl border border-slate-700 hover:border-emerald-500/50'
            }`}
          >
            {/* Animated scanning waves */}
            {isScanning && (
              <span className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-75" />
            )}
            <Fingerprint className={`w-12 h-12 ${isScanning ? 'animate-pulse' : ''}`} />
          </button>
        </div>

        <button
          onClick={handleBiometricClick}
          className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/20 mb-4"
        >
          {isScanning ? 'Verificando Sensor Biométrico...' : 'Autenticar com Biometria (Touch / Face ID)'}
        </button>

        {/* PIN / Passphrase fallback */}
        <div className="pt-4 border-t border-slate-800/80">
          <p className="text-[11px] text-slate-400 mb-2">Ou digite o PIN / Senha Mestra (Padrão: 1234):</p>
          <form onSubmit={handlePinSubmit} className="flex gap-2">
            <input
              type="password"
              placeholder="PIN de 4 dígitos"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-center text-sm text-white tracking-widest focus:outline-none focus:ring-2 ${
                pinError
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-800 focus:ring-emerald-500'
              }`}
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              OK
            </button>
          </form>
          {pinError && (
            <p className="text-[11px] text-red-400 mt-1">PIN incorreto. Tente "1234" ou use biometria.</p>
          )}
        </div>
      </div>
    </div>
  );
};
