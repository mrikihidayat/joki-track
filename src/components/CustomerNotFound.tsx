'use client';

import { useEffect, useState } from 'react';

export default function CustomerNotFound({ slug }: { slug: string }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Diagonal stripe bg */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,1) 0px, rgba(255,255,255,1) 1px, transparent 1px, transparent 20px)',
        }}
      />

      {/* Glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-rose-600/8 blur-[100px]" />

      <div className="relative z-10 text-center max-w-md w-full">
        {/* Icon area */}
        <div className="relative inline-flex items-center justify-center mb-8">
          <div className="w-24 h-24 rounded-3xl bg-slate-800 border border-slate-700/80 flex items-center justify-center">
            <span className="text-4xl">🔍</span>
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
            <span className="text-rose-400 text-sm font-black">!</span>
          </div>
        </div>

        <h1 className="text-2xl font-black text-white mb-2">Klien Tidak Ditemukan</h1>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          Data untuk{' '}
          <code className="bg-slate-800 text-rose-400 px-2 py-0.5 rounded-lg text-xs font-mono">
            {slug}
          </code>
          {' '}tidak ada di sistem.
        </p>

        {/* Info box */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 text-left mb-8">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Kemungkinan penyebab</p>
          <ul className="space-y-2.5">
            {[
              'Link sudah kadaluarsa atau salah',
              'Data klien sudah dihapus dari sistem',
              'Slug berubah setelah update data',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-slate-400">
                <span className="text-rose-500/60 mt-0.5 shrink-0">×</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Scanning animation */}
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl px-5 py-3 mb-8 text-left">
          <p className="font-mono text-xs text-slate-500">
            <span className="text-indigo-400">sys</span>
            <span className="text-slate-600">@joki</span>
            <span className="text-slate-500">:~$ </span>
            <span className="text-slate-300">lookup --slug </span>
            <span className="text-amber-400">{slug}</span>
            <span className="text-rose-400">{dots}</span>
          </p>
          <p className="font-mono text-xs text-rose-400 mt-1.5">→ null — tidak ada record</p>
        </div>

        <a
          href="/"
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-200 font-bold px-5 py-2.5 rounded-xl transition-all duration-200 text-sm"
        >
          ← Kembali
        </a>
      </div>
    </div>
  );
}
