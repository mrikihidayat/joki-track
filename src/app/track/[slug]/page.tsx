'use client';

import { BookOpen, CalendarDays, Clock, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import useSWR from 'swr';
import { useState } from 'react';
import CustomerNotFound from '@/components/CustomerNotFound';

type WorkStatus = 'antrian' | 'waiting' | 'done' | 'revisi';

const STATUS_BADGE: Record<WorkStatus, { label: string; cls: string }> = {
  antrian: { label: 'Antrian',      cls: 'bg-slate-700 text-slate-300' },
  waiting: { label: 'Waiting List', cls: 'bg-amber-500/20 text-amber-300 border border-amber-600/40' },
  done:    { label: 'Selesai',      cls: 'bg-emerald-500/20 text-emerald-300 border border-emerald-600/40' },
  revisi:  { label: 'Revisi',       cls: 'bg-rose-500/20 text-rose-300 border border-rose-600/40' },
};

const fetcher = (url: string) => fetch(url).then(r => r.json()).then(d => d.success ? d.data : null);

export default function TrackCustomer({ params }: { params: { slug: string } }) {
  const { data: customer, isLoading } = useSWR(
    `/api/customer/${params.slug}`,
    fetcher,
    { refreshInterval: 4000, revalidateOnFocus: true }
  );

  const [openCourses, setOpenCourses] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<'matkul' | 'persesi'>('matkul');

  const toggleCourse = (idx: number) => {
    setOpenCourses(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen bg-slate-900 text-white">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-400 text-sm">Memuat tracker...</p>
      </div>
    </div>
  );
  if (!customer) return <CustomerNotFound slug={params.slug} />;

  // ── helper status (backward compat) ──
  const getStatus = (s: any): WorkStatus => s.status ?? (s.isDone ? 'done' : 'antrian');

  // ── global stats ──
  let totalBiaya = 0, sudahBayar = 0, totalDone = 0, totalSesi = 0;
  customer.courses.forEach((c: any) => c.sessions.forEach((s: any) => {
    totalBiaya += s.price;
    if (s.isPaid) sudahBayar += s.price;
    if (getStatus(s) === 'done') totalDone++;
    totalSesi++;
  }));
  const sisaTagihan = totalBiaya - sudahBayar;
  const progressPct = totalSesi > 0 ? Math.round((totalDone / totalSesi) * 100) : 0;
  const bayarPct = totalBiaya > 0 ? Math.round((sudahBayar / totalBiaya) * 100) : 0;

  // ── per-sesi grouping ──
  const sesiMap = new Map<number, {
    items: { courseName: string; type: string; price: number; status: WorkStatus; isPaid: boolean }[];
    totalPrice: number; totalPaid: number;
  }>();
  customer.courses.forEach((course: any) => {
    course.sessions.forEach((session: any) => {
      const n = session.sessionNumber;
      if (!sesiMap.has(n)) sesiMap.set(n, { items: [], totalPrice: 0, totalPaid: 0 });
      const e = sesiMap.get(n)!;
      e.items.push({ courseName: course.courseName, type: session.type, price: session.price, status: getStatus(session), isPaid: session.isPaid });
      e.totalPrice += session.price;
      if (session.isPaid) e.totalPaid += session.price;
    });
  });
  const sesiGroups = Array.from(sesiMap.entries()).sort((a, b) => a[0] - b[0]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Live</span>
            </div>
            <h1 className="text-2xl font-black text-indigo-400">Billing Realtime Tracker</h1>
            <p className="text-slate-400 text-sm mt-1">Klien: <span className="text-white font-semibold">{customer.name}</span></p>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <p className="text-[10px] text-slate-400 font-medium uppercase leading-tight">Total Deal</p>
              <p className="text-base font-bold mt-1">Rp {totalBiaya.toLocaleString('id-ID')}</p>
            </div>
            <div className="bg-emerald-950/50 p-3 rounded-xl border border-emerald-900/40">
              <p className="text-[10px] text-emerald-500 font-medium uppercase leading-tight">Sudah Masuk</p>
              <p className="text-base font-bold mt-1 text-emerald-400">Rp {sudahBayar.toLocaleString('id-ID')}</p>
            </div>
            <div className="bg-indigo-950/50 p-3 rounded-xl border border-indigo-800/50 ring-1 ring-indigo-500/20">
              <p className="text-[10px] text-indigo-400 font-medium uppercase leading-tight">Sisa Tagihan</p>
              <p className="text-base font-bold mt-1 text-indigo-400">Rp {sisaTagihan.toLocaleString('id-ID')}</p>
            </div>
          </div>

          {/* Progress bars */}
          <div className="bg-slate-800/40 rounded-xl border border-slate-700/40 p-4 mb-6 space-y-3">
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Progress Pengerjaan</span>
                <span className="font-bold text-white">{totalDone}/{totalSesi} sesi ({progressPct}%)</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Progress Pembayaran</span>
                <span className="font-bold text-white">{bayarPct}% terbayar</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${bayarPct}%` }}></div>
              </div>
            </div>
            {/* Status legend */}
            <div className="flex gap-2 flex-wrap pt-1">
              {(Object.entries(STATUS_BADGE) as [WorkStatus, { label: string; cls: string }][]).map(([k, v]) => (
                <span key={k} className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${v.cls}`}>{v.label}</span>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/40 mb-4">
            <button onClick={() => setActiveTab('matkul')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${activeTab === 'matkul' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
              <BookOpen size={12} /> Per Matkul ({customer.courses.length})
            </button>
            <button onClick={() => setActiveTab('persesi')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${activeTab === 'persesi' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
              <CalendarDays size={12} /> Per Sesi ({sesiGroups.length})
            </button>
          </div>

          {/* ══ TAB: Per Matkul ══ */}
          {activeTab === 'matkul' && (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Detail per Mata Kuliah</p>
                <div className="flex gap-2">
                  <button onClick={() => setOpenCourses(new Set(customer.courses.map((_: any, i: number) => i)))} className="text-[10px] text-slate-500 hover:text-slate-300 border border-slate-700 px-2 py-1 rounded-lg transition">Buka Semua</button>
                  <button onClick={() => setOpenCourses(new Set())} className="text-[10px] text-slate-500 hover:text-slate-300 border border-slate-700 px-2 py-1 rounded-lg transition">Tutup Semua</button>
                </div>
              </div>
              <div className="space-y-2">
                {customer.courses.map((course: any, cIdx: number) => {
                  const cTotal = course.sessions.reduce((a: number, s: any) => a + s.price, 0);
                  const cPaid = course.sessions.filter((s: any) => s.isPaid).reduce((a: number, s: any) => a + s.price, 0);
                  const cDone = course.sessions.filter((s: any) => getStatus(s) === 'done').length;
                  const isOpen = openCourses.has(cIdx);
                  return (
                    <div key={cIdx} className="bg-slate-800 rounded-xl border border-slate-700/80 overflow-hidden">
                      <button onClick={() => toggleCourse(cIdx)} className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-700/40 transition text-left">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-slate-500 text-xs">{isOpen ? '▼' : '▶'}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                              <BookOpen size={13} className="text-indigo-400 shrink-0" /> {course.courseName}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{course.sessions.length} sesi · Rp {cPaid.toLocaleString('id-ID')} / Rp {cTotal.toLocaleString('id-ID')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-3 shrink-0">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${cDone === course.sessions.length ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                            {cDone}/{course.sessions.length} <CheckCircle size={10} />
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${cPaid >= cTotal ? 'bg-indigo-500/20 text-indigo-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {cPaid >= cTotal ? 'Lunas' : `${Math.round((cPaid/cTotal)*100)}%`}
                          </span>
                        </div>
                      </button>
                      {isOpen && (
                        <div className="border-t border-slate-700">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="text-slate-500 bg-slate-800/80 uppercase">
                                <th className="px-4 py-2">Sesi</th>
                                <th className="px-4 py-2">Tipe</th>
                                <th className="px-4 py-2">Tarif</th>
                                <th className="px-4 py-2 text-center">Status</th>
                                <th className="px-4 py-2 text-center">Bayar</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/40">
                              {course.sessions.map((session: any, sIdx: number) => {
                                const st = getStatus(session);
                                const badge = STATUS_BADGE[st];
                                return (
                                  <tr key={sIdx} className="hover:bg-slate-700/20">
                                    <td className="px-4 py-2.5 font-semibold text-slate-200">Sesi {session.sessionNumber}</td>
                                    <td className="px-4 py-2.5 capitalize text-slate-400">{session.type}</td>
                                    <td className="px-4 py-2.5 text-slate-400">Rp {session.price.toLocaleString('id-ID')}</td>
                                    <td className="px-4 py-2.5 text-center">
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.cls}`}>{badge.label}</span>
                                    </td>
                                    <td className="px-4 py-2.5 text-center">
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${session.isPaid ? 'bg-indigo-500/20 text-indigo-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                        {session.isPaid ? 'Lunas' : 'Belum'}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ══ TAB: Per Sesi ══ */}
          {activeTab === 'persesi' && (
            <>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Tagihan per Nomor Sesi</p>
              <div className="space-y-3">
                {sesiGroups.map(([sesiNum, group]) => {
                  const lunasSemua = group.totalPaid >= group.totalPrice;
                  const lunasCount = group.items.filter(i => i.isPaid).length;
                  return (
                    <div key={sesiNum} className="bg-slate-800 rounded-xl border border-slate-700/80 overflow-hidden">
                      <div className="px-4 py-3 flex items-center justify-between border-b border-slate-700/60 bg-slate-800/80">
                        <div>
                          <p className="text-sm font-black text-white flex items-center gap-1.5">
                            <Clock size={13} className="text-indigo-400" /> Sesi {sesiNum}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{group.items.length} matkul · {lunasCount}/{group.items.length} lunas</p>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-black text-indigo-300">Rp {group.totalPrice.toLocaleString('id-ID')}</p>
                          <p className={`text-[10px] font-bold mt-0.5 flex items-center justify-end gap-1 ${lunasSemua ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {lunasSemua ? <><CheckCircle size={10} /> Lunas semua</> : `Rp ${group.totalPaid.toLocaleString('id-ID')} masuk`}
                          </p>
                        </div>
                      </div>
                      <div className="divide-y divide-slate-700/40">
                        {group.items.map((item, idx) => {
                          const badge = STATUS_BADGE[item.status];
                          return (
                            <div key={idx} className="flex items-center justify-between px-4 py-2.5 text-xs hover:bg-slate-700/20">
                              <div className="flex items-center gap-2 min-w-0">
                                <BookOpen size={11} className="text-slate-600 shrink-0" />
                                <span className="text-slate-300 font-medium truncate">{item.courseName}</span>
                                <span className="text-slate-600">·</span>
                                <span className="text-slate-500 capitalize">{item.type}</span>
                              </div>
                              <div className="flex items-center gap-2 ml-3 shrink-0">
                                <span className="text-slate-400">Rp {item.price.toLocaleString('id-ID')}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.cls}`}>{badge.label}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.isPaid ? 'bg-indigo-500/20 text-indigo-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                  {item.isPaid ? 'Lunas' : 'Belum'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {group.items.length > 1 && (
                        <div className="px-4 py-2 bg-slate-900/60 flex justify-between items-center border-t border-slate-700/60">
                          <span className="text-[10px] text-slate-500 font-bold uppercase">Total Sesi {sesiNum}</span>
                          <span className="text-sm font-black text-white">Rp {group.totalPrice.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <p className="text-center text-[10px] text-slate-700 mt-8 flex items-center justify-center gap-1">
            <RefreshCw size={9} /> Auto-refresh setiap 4 detik · pause otomatis saat tab tidak aktif
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-4 mt-4">
        <p className="text-center text-[11px] text-slate-600">
          Joki by <span className="text-indigo-400 font-bold">Riki</span> · Tracker ini hanya bisa dilihat oleh klien yang bersangkutan
        </p>
      </footer>
    </div>
  );
}
