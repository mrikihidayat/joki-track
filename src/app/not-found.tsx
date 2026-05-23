'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 overflow-hidden relative">
      {/* Scanline overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 4px)',
        }}
      />

      {/* Noise grid */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(99,102,241,0.6) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Glow blobs */}
      <div className="pointer-events-none fixed top-1/4 -left-32 w-96 h-96 rounded-full bg-indigo-600/10 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-1/4 -right-32 w-96 h-96 rounded-full bg-rose-600/10 blur-[120px]" />

      <div className="relative z-10 text-center max-w-lg w-full">
        {/* Big 404 */}
        <div className="relative mb-2 select-none">
          <p
            className="text-[clamp(6rem,25vw,11rem)] font-black leading-none tabular-nums"
            style={{
              color: 'transparent',
              WebkitTextStroke: '1px rgba(99,102,241,0.3)',
              textShadow: '0 0 80px rgba(99,102,241,0.15)',
              letterSpacing: '-0.04em',
            }}
          >
            404
          </p>
          {/* Glitch layer 1 */}
          <p
            aria-hidden
            className="absolute inset-0 text-[clamp(6rem,25vw,11rem)] font-black leading-none tabular-nums text-rose-500/30"
            style={{
              letterSpacing: '-0.04em',
              clipPath: 'polygon(0 30%, 100% 30%, 100% 50%, 0 50%)',
              transform: 'translateX(-4px)',
              animation: 'glitch1 3.5s infinite',
            }}
          >
            404
          </p>
          {/* Glitch layer 2 */}
          <p
            aria-hidden
            className="absolute inset-0 text-[clamp(6rem,25vw,11rem)] font-black leading-none tabular-nums text-indigo-400/30"
            style={{
              letterSpacing: '-0.04em',
              clipPath: 'polygon(0 60%, 100% 60%, 100% 75%, 0 75%)',
              transform: 'translateX(4px)',
              animation: 'glitch2 4s infinite 0.5s',
            }}
          >
            404
          </p>
        </div>

        {/* Terminal box */}
        <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-6 mb-8 text-left backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
            <div className="w-3 h-3 rounded-full bg-rose-500/70" />
            <div className="w-3 h-3 rounded-full bg-amber-500/70" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
            <span className="text-slate-600 text-xs ml-2 font-mono">joki-tracker ~ error</span>
          </div>
          <div className="font-mono text-xs space-y-1.5">
            <p><span className="text-rose-400">ERROR</span> <span className="text-slate-500">route not found</span></p>
            <p><span className="text-slate-600">›</span> <span className="text-amber-400">status</span><span className="text-slate-500">:</span> <span className="text-white">404 Page Not Found</span></p>
            <p><span className="text-slate-600">›</span> <span className="text-amber-400">message</span><span className="text-slate-500">:</span> <span className="text-slate-300">Halaman yang kamu cari tidak ada.</span></p>
            <p className="pt-1">
              <span className="text-indigo-400">$</span>
              {' '}
              <span className="text-slate-300">cd /home</span>
              <span className="inline-block w-2 h-3.5 bg-indigo-400 ml-1 align-middle" style={{ animation: 'blink 1s step-end infinite' }} />
            </p>
          </div>
        </div>

        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          URL yang kamu akses tidak terdaftar.<br />
          Cek lagi link-nya atau balik ke halaman utama.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl transition-all duration-200 text-sm hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5"
        >
          ← Balik ke Dashboard
        </Link>
      </div>

      <style jsx global>{`
        @keyframes glitch1 {
          0%, 90%, 100% { transform: translateX(-4px); opacity: 0.3; }
          92% { transform: translateX(6px); opacity: 0.7; }
          94% { transform: translateX(-6px); opacity: 0.5; }
          96% { transform: translateX(0); opacity: 0; }
        }
        @keyframes glitch2 {
          0%, 85%, 100% { transform: translateX(4px); opacity: 0.3; }
          87% { transform: translateX(-8px); opacity: 0.6; }
          89% { transform: translateX(8px); opacity: 0.4; }
          91% { transform: translateX(0); opacity: 0; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
