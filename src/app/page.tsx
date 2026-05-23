'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePinGuard } from '@/hooks/usePinGuard';
import PinGate from '@/components/PinGate';
import Swal from 'sweetalert2';

export default function Home() {
  const { authed, checking, pin, setPin, error, loading, submitPin } = usePinGuard();
  const [customers, setCustomers] = useState([]);

  const fetchCustomers = () => {
    fetch('/api/customer')
      .then(res => res.json())
      .then(data => { if (data.success) setCustomers(data.data); });
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleDelete = async (slug: string, name: string) => {
    const result = await Swal.fire({
      title: `Hapus klien "${name}"?`,
      text: 'Semua data akan terhapus permanen!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#475569',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      background: '#0f172a',
      color: '#e2e8f0',
    });
    if (result.isConfirmed) {
      await fetch(`/api/customer/${slug}`, { method: 'DELETE' });
      fetchCustomers();
      Swal.fire({ title: 'Terhapus!', icon: 'success', background: '#0f172a', color: '#e2e8f0', timer: 1500, showConfirmButton: false });
    }
  };

  // Hitung grand total dari SEMUA klien
  let grandTotal = 0, grandMasuk = 0, grandBelumBayar = 0, grandSesiDone = 0, grandSesiAll = 0;
  customers.forEach((c: any) => {
    c.courses.forEach((course: any) => {
      course.sessions.forEach((s: any) => {
        grandTotal += s.price;
        if (s.isPaid) grandMasuk += s.price;
        else grandBelumBayar += s.price;
        if (s.isDone) grandSesiDone++;
        grandSesiAll++;
      });
    });
  });

  if (checking) return (
    <div className="flex items-center justify-center h-screen bg-slate-950">
      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!authed) return (
    <PinGate pin={pin} setPin={setPin} error={error} loading={loading} onSubmit={submitPin} />
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-500">Joki Center Dashboard</h1>
              <p className="text-slate-400 text-sm mt-1">Kelola data klien dan pendapatan tugas kuliah.</p>
            </div>
            <Link href="/register" className="bg-indigo-600 hover:bg-indigo-500 transition px-4 py-2 rounded-xl text-sm font-bold">
              + Klien Baru
            </Link>
          </div>

          {/* ===== SUMMARY TOTAL SELURUH KLIEN ===== */}
          {customers.length > 0 && (
            <div className="mb-8 bg-gradient-to-br from-slate-900 to-slate-900 border border-slate-700/80 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ringkasan Semua Klien</span>
                <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-bold">{customers.length} Klien</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Total Deal</p>
                  <p className="text-xl font-black text-white">Rp {grandTotal.toLocaleString('id-ID')}</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">{grandSesiAll} total sesi</p>
                </div>
                <div className="bg-emerald-950/50 rounded-xl p-4 border border-emerald-900/40">
                  <p className="text-[10px] text-emerald-600 uppercase font-semibold mb-1">Sudah Masuk</p>
                  <p className="text-xl font-black text-emerald-400">Rp {grandMasuk.toLocaleString('id-ID')}</p>
                  <p className="text-[10px] text-emerald-900 mt-0.5">{grandTotal > 0 ? Math.round((grandMasuk/grandTotal)*100) : 0}% dari total</p>
                </div>
                <div className="bg-rose-950/40 rounded-xl p-4 border border-rose-900/30">
                  <p className="text-[10px] text-rose-600 uppercase font-semibold mb-1">Belum Dibayar</p>
                  <p className="text-xl font-black text-rose-400">Rp {grandBelumBayar.toLocaleString('id-ID')}</p>
                  <p className="text-[10px] text-rose-900 mt-0.5">Piutang aktif</p>
                </div>
                <div className="bg-indigo-950/40 rounded-xl p-4 border border-indigo-900/30">
                  <p className="text-[10px] text-indigo-400 uppercase font-semibold mb-1">Progress Sesi</p>
                  <p className="text-xl font-black text-indigo-400">{grandSesiDone}<span className="text-slate-500 font-normal text-sm">/{grandSesiAll}</span></p>
                  <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: grandSesiAll > 0 ? `${(grandSesiDone/grandSesiAll)*100}%` : '0%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== LIST KLIEN ===== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customers.map((c: any) => {
              let total = 0, masuk = 0;
              c.courses.forEach((course: any) => course.sessions.forEach((s: any) => {
                total += s.price;
                if (s.isPaid) masuk += s.price;
              }));
              return (
                <div key={c._id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-bold text-slate-100">{c.name}</h2>
                        <p className="text-xs text-slate-500 mt-0.5">/track/{c.slug}</p>
                      </div>
                      <button onClick={() => handleDelete(c.slug, c.name)} className="text-slate-600 hover:text-rose-400 transition text-xs border border-slate-800 hover:border-rose-500/30 px-2 py-1 rounded-lg">
                        Hapus
                      </button>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      <div className="bg-slate-800/60 rounded-lg p-2">
                        <p className="text-[10px] text-slate-500">Matkul</p>
                        <p className="text-sm font-bold">{c.courses.length}</p>
                      </div>
                      <div className="bg-slate-800/60 rounded-lg p-2">
                        <p className="text-[10px] text-slate-500">Total</p>
                        <p className="text-sm font-bold">Rp {total.toLocaleString('id-ID')}</p>
                      </div>
                      <div className="bg-emerald-950/50 rounded-lg p-2">
                        <p className="text-[10px] text-emerald-600">Masuk</p>
                        <p className="text-sm font-bold text-emerald-400">Rp {masuk.toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Link href={`/admin/${c.slug}`} className="flex-1 text-center bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 py-2 rounded-xl text-xs font-bold transition">
                      ⚙ Kelola (Admin)
                    </Link>
                    <Link href={`/track/${c.slug}`} className="flex-1 text-center bg-slate-800 hover:bg-slate-700 py-2 rounded-xl text-xs font-bold transition">
                      Link Client ↗
                    </Link>
                  </div>
                </div>
              );
            })}
            {customers.length === 0 && (
              <p className="text-slate-500 text-sm col-span-2 text-center py-12">Belum ada data customer. Silakan tambah klien baru.</p>
            )}
          </div>

        </div>
      </div>
  );
}
