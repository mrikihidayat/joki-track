'use client';

import { KeyboardEvent } from 'react';

interface PinGateProps {
  pin: string;
  setPin: (v: string) => void;
  error: string;
  loading: boolean;
  onSubmit: () => void;
}

export default function PinGate({ pin, setPin, error, loading, onSubmit }: PinGateProps) {
  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSubmit();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-xs">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🔐</div>
          <h1 className="text-xl font-black text-white">Admin Area</h1>
          <p className="text-slate-500 text-sm mt-1">Masukkan PIN untuk melanjutkan</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wider">PIN</label>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={e => setPin(e.target.value)}
              onKeyDown={handleKey}
              placeholder="••••"
              autoFocus
              maxLength={8}
              className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] text-white focus:outline-none transition placeholder:text-slate-700 placeholder:text-base placeholder:tracking-normal"
            />
          </div>

          {error && (
            <p className="text-rose-400 text-xs text-center font-semibold">⚠ {error}</p>
          )}

          <button
            onClick={onSubmit}
            disabled={loading || !pin}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition text-sm"
          >
            {loading ? 'Memeriksa...' : 'Masuk'}
          </button>
        </div>

        <p className="text-center text-[10px] text-slate-700 mt-6">
          Halaman ini hanya untuk admin
        </p>
      </div>
    </div>
  );
}
