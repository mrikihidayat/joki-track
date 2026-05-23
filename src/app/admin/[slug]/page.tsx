'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePinGuard } from '@/hooks/usePinGuard';
import PinGate from '@/components/PinGate';
import Swal from 'sweetalert2';
import {
  BookOpen, Clock, CheckCircle, PenLine, ListOrdered,
  Trash2, Plus, X, ExternalLink, ChevronDown, ChevronRight,
} from 'lucide-react';

type WorkStatus = 'antrian' | 'waiting' | 'done' | 'revisi';

const STATUS_CONFIG: Record<WorkStatus, { label: string; icon: React.ReactNode; selectCls: string }> = {
  antrian: { label: 'Antrian',      icon: <ListOrdered size={11} />, selectCls: 'bg-slate-800 text-slate-300 border-slate-600' },
  waiting: { label: 'Waiting List', icon: <Clock size={11} />,       selectCls: 'bg-amber-950 text-amber-300 border-amber-700' },
  done:    { label: 'Selesai',      icon: <CheckCircle size={11} />, selectCls: 'bg-emerald-950 text-emerald-300 border-emerald-700' },
  revisi:  { label: 'Revisi',       icon: <PenLine size={11} />,     selectCls: 'bg-rose-950 text-rose-300 border-rose-700' },
};

export default function AdminControl({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { authed, checking, pin, setPin, error, loading, submitPin } = usePinGuard();
  const [customer, setCustomer] = useState<any>(null);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newSessions, setNewSessions] = useState('');
  const [newType, setNewType] = useState<'diskusi' | 'tugas'>('diskusi');
  const [newPrice, setNewPrice] = useState(8000);
  const [openCourses, setOpenCourses] = useState<Set<number>>(new Set());

  const fetchStatus = async () => {
    const res = await fetch(`/api/customer/${params.slug}`);
    const data = await res.json();
    if (data.success) setCustomer(data.data);
  };

  useEffect(() => { fetchStatus(); }, [params.slug]);

  const swal = (opts: any) => Swal.fire(opts);

  const toggleCourse = (idx: number) => {
    setOpenCourses(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const changeStatus = async (courseIdx: number, sessionIdx: number, newStatus: WorkStatus) => {
    const res = await fetch(`/api/customer/${params.slug}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseIdx, sessionIdx, field: 'status', newValue: newStatus })
    });
    if (res.ok) {
      fetchStatus();
      swal({ toast: true, position: 'top-end', icon: 'success', title: `→ ${STATUS_CONFIG[newStatus].label}`, showConfirmButton: false, timer: 1200 });
    }
  };

  const togglePaid = async (courseIdx: number, sessionIdx: number, currentVal: boolean) => {
    const res = await fetch(`/api/customer/${params.slug}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseIdx, sessionIdx, field: 'isPaid', newValue: !currentVal })
    });
    if (res.ok) {
      fetchStatus();
      swal({ toast: true, position: 'top-end', icon: 'success', title: currentVal ? 'Dibatalkan Lunas' : 'Ditandai Lunas', showConfirmButton: false, timer: 1200 });
    }
  };

  const handleDeleteCustomer = async () => {
    const result = await Swal.fire({
      title: `Hapus klien "${customer.name}"?`,
      text: 'Semua data matkul dan sesi akan ikut terhapus permanen!',
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#ef4444', cancelButtonColor: '#475569',
      confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal',
      background: '#0f172a', color: '#e2e8f0',
    });
    if (result.isConfirmed) {
      await fetch(`/api/customer/${params.slug}`, { method: 'DELETE' });
      await Swal.fire({ title: 'Terhapus!', icon: 'success', background: '#0f172a', color: '#e2e8f0', timer: 1500, showConfirmButton: false });
      router.push('/');
    }
  };

  const handleDeleteCourse = async (cIdx: number, courseName: string) => {
    const result = await Swal.fire({
      title: `Hapus matkul "${courseName}"?`, text: 'Semua sesi ikut terhapus.',
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#ef4444', cancelButtonColor: '#475569',
      confirmButtonText: 'Hapus', cancelButtonText: 'Batal',
      background: '#0f172a', color: '#e2e8f0',
    });
    if (!result.isConfirmed) return;
    const updatedCourses = customer.courses.filter((_: any, i: number) => i !== cIdx);
    const res = await fetch(`/api/customer/${params.slug}/replace-courses`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courses: updatedCourses })
    });
    if (res.ok) { fetchStatus(); swal({ toast: true, position: 'top-end', icon: 'success', title: 'Matkul dihapus', showConfirmButton: false, timer: 1500 }); }
  };

  const handleAddCourse = async () => {
    if (!newCourseName || !newSessions) {
      swal({ icon: 'error', title: 'Oops!', text: 'Nama matkul dan sesi wajib diisi.', background: '#0f172a', color: '#e2e8f0' });
      return;
    }
    const sessionNumbers = newSessions.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
    const sessions = sessionNumbers.map(num => ({ sessionNumber: num, type: newType, price: newPrice, status: 'antrian', isPaid: false }));
    const res = await fetch(`/api/customer/${params.slug}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course: { courseName: newCourseName, sessions } })
    });
    if (res.ok) {
      fetchStatus(); setShowAddCourse(false);
      setNewCourseName(''); setNewSessions(''); setNewPrice(8000);
      swal({ toast: true, position: 'top-end', icon: 'success', title: `"${newCourseName}" ditambahkan!`, showConfirmButton: false, timer: 2000 });
    }
  };

  if (checking) return (
    <div className="flex items-center justify-center h-screen bg-slate-950">
      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!authed) return (
    <PinGate pin={pin} setPin={setPin} error={error} loading={loading} onSubmit={submitPin} />
  );

  if (!customer) return (
    <div className="flex items-center justify-center h-screen bg-slate-950 text-white">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-400 text-sm">Memuat panel admin...</p>
      </div>
    </div>
  );

  let totalDeal = 0, totalMasuk = 0, totalDone = 0, totalRevisi = 0, totalWaiting = 0, totalSesi = 0;
  customer.courses.forEach((c: any) => {
    c.sessions.forEach((s: any) => {
      totalDeal += s.price;
      if (s.isPaid) totalMasuk += s.price;
      const st = s.status ?? (s.isDone ? 'done' : 'antrian');
      if (st === 'done') totalDone++;
      if (st === 'revisi') totalRevisi++;
      if (st === 'waiting') totalWaiting++;
      totalSesi++;
    });
  });
  const sisaTagihan = totalDeal - totalMasuk;

  return (
    <>
      <div className="min-h-screen bg-slate-950 text-slate-100">

        {/* Sticky header */}
        <div className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-10 backdrop-blur">
          <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <a href="/" className="text-slate-500 hover:text-slate-300 text-xs transition flex items-center gap-1">← Dashboard</a>
              <span className="text-slate-700">|</span>
              <div>
                <span className="text-rose-400 font-bold text-sm">Admin Panel</span>
                <span className="text-slate-500 text-xs ml-2">— {customer.name}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <a href={`/track/${params.slug}`} target="_blank" className="bg-slate-900 border border-slate-700 hover:border-slate-600 px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5">
                Lihat Halaman Klien <ExternalLink size={11} />
              </a>
              <button onClick={handleDeleteCustomer} className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5">
                <Trash2 size={11} /> Hapus Klien
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto p-4 md:p-8">

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Total Deal</p>
              <p className="text-lg font-black text-white mt-1">Rp {totalDeal.toLocaleString('id-ID')}</p>
            </div>
            <div className="bg-emerald-950/40 border border-emerald-900/50 rounded-xl p-4">
              <p className="text-[10px] text-emerald-600 uppercase font-semibold">Sudah Masuk</p>
              <p className="text-lg font-black text-emerald-400 mt-1">Rp {totalMasuk.toLocaleString('id-ID')}</p>
            </div>
            <div className="bg-indigo-950/40 border border-indigo-900/50 rounded-xl p-4 ring-1 ring-indigo-500/20">
              <p className="text-[10px] text-indigo-400 uppercase font-semibold">Sisa Tagihan</p>
              <p className="text-lg font-black text-indigo-400 mt-1">Rp {sisaTagihan.toLocaleString('id-ID')}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Progress Sesi</p>
              <p className="text-lg font-black text-white mt-1">{totalDone}<span className="text-slate-500 font-normal text-sm">/{totalSesi}</span></p>
              <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: totalSesi > 0 ? `${(totalDone/totalSesi)*100}%` : '0%' }}></div>
              </div>
            </div>
          </div>

          {/* Mini status legend */}
          <div className="flex gap-2 flex-wrap mb-6">
            {(Object.entries(STATUS_CONFIG) as [WorkStatus, typeof STATUS_CONFIG[WorkStatus]][]).map(([key, cfg]) => (
              <span key={key} className={`text-[10px] px-2.5 py-1 rounded-full font-bold border flex items-center gap-1 ${cfg.selectCls}`}>
                {cfg.icon} {cfg.label}
              </span>
            ))}
            <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-slate-800 text-slate-500">
              Pilih status langsung dari dropdown
            </span>
          </div>

          {/* Header matkul */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Mata Kuliah ({customer.courses.length})</h2>
              <div className="flex gap-1">
                <button onClick={() => setOpenCourses(new Set(customer.courses.map((_: any, i: number) => i)))} className="text-[10px] text-slate-500 hover:text-slate-300 border border-slate-800 px-2 py-1 rounded-lg transition">Buka Semua</button>
                <button onClick={() => setOpenCourses(new Set())} className="text-[10px] text-slate-500 hover:text-slate-300 border border-slate-800 px-2 py-1 rounded-lg transition">Tutup Semua</button>
              </div>
            </div>
            <button onClick={() => setShowAddCourse(!showAddCourse)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5">
              {showAddCourse ? <><X size={12} /> Tutup</> : <><Plus size={12} /> Tambah Matkul</>}
            </button>
          </div>

          {/* Form tambah matkul */}
          {showAddCourse && (
            <div className="bg-slate-900 border border-indigo-500/30 rounded-xl p-5 mb-5 space-y-3">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Tambah Mata Kuliah Baru</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Nama Mata Kuliah</label>
                  <input value={newCourseName} onChange={e => setNewCourseName(e.target.value)} placeholder="Contoh: Algoritma" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Sesi (pisah koma)</label>
                  <input value={newSessions} onChange={e => setNewSessions(e.target.value)} placeholder="1,2,3,4,5" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Jenis</label>
                  <select value={newType} onChange={e => setNewType(e.target.value as any)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs focus:outline-none">
                    <option value="diskusi">Diskusi</option>
                    <option value="tugas">Tugas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Tarif per Sesi (Rp)</label>
                  <input type="number" value={newPrice} onChange={e => setNewPrice(parseInt(e.target.value))} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500" />
                </div>
              </div>
              <button onClick={handleAddCourse} className="w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded-lg text-xs font-bold transition">
                Simpan Matkul
              </button>
            </div>
          )}

          {/* Course accordion */}
          <div className="space-y-2">
            {customer.courses.map((course: any, cIdx: number) => {
              const courseTotal = course.sessions.reduce((a: number, s: any) => a + s.price, 0);
              const coursePaid = course.sessions.filter((s: any) => s.isPaid).reduce((a: number, s: any) => a + s.price, 0);
              const courseDone = course.sessions.filter((s: any) => (s.status ?? (s.isDone ? 'done' : 'antrian')) === 'done').length;
              const isOpen = openCourses.has(cIdx);

              return (
                <div key={cIdx} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                  <div className="flex items-center">
                    <button onClick={() => toggleCourse(cIdx)} className="flex-1 px-4 py-3 flex items-center justify-between hover:bg-slate-800/60 transition text-left">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-slate-500 text-xs">{isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate flex items-center gap-1.5"><BookOpen size={13} className="text-indigo-400 shrink-0" /> {course.courseName}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {course.sessions.length} sesi · {courseDone} selesai · Rp {coursePaid.toLocaleString('id-ID')} / Rp {courseTotal.toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-3 shrink-0">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${courseDone === course.sessions.length ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                          {courseDone}/{course.sessions.length}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${coursePaid >= courseTotal ? 'bg-indigo-500/20 text-indigo-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {coursePaid >= courseTotal ? 'Lunas' : `${Math.round((coursePaid/courseTotal)*100)}%`}
                        </span>
                      </div>
                    </button>
                    <button onClick={() => handleDeleteCourse(cIdx, course.courseName)} className="px-3 py-3 text-rose-500 hover:text-rose-400 hover:bg-rose-500/5 transition text-xs font-bold border-l border-slate-800 flex items-center gap-1">
                      <Trash2 size={12} /> Hapus
                    </button>
                  </div>

                  {isOpen && (
                    <div className="border-t border-slate-800 p-3 space-y-1.5">
                      {course.sessions.map((session: any, sIdx: number) => {
                        // support data lama yg masih pakai isDone
                        const st: WorkStatus = session.status ?? (session.isDone ? 'done' : 'antrian');
                        const cfg = STATUS_CONFIG[st];
                        return (
                          <div key={sIdx} className="flex items-center justify-between bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-bold text-slate-200 shrink-0">Sesi {session.sessionNumber}</span>
                              <span className="text-slate-700">·</span>
                              <span className="capitalize text-slate-400">{session.type}</span>
                              <span className="text-slate-700">·</span>
                              <span className="text-slate-400">Rp {session.price.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex gap-1.5 ml-2 shrink-0">
                              {/* Status dropdown */}
                              <select
                                value={st}
                                onChange={e => changeStatus(cIdx, sIdx, e.target.value as WorkStatus)}
                                className={`px-2 py-1 rounded-lg font-bold text-[11px] border cursor-pointer focus:outline-none transition ${STATUS_CONFIG[st].selectCls}`}
                              >
                                {(Object.entries(STATUS_CONFIG) as [WorkStatus, typeof STATUS_CONFIG[WorkStatus]][]).map(([key, cfg]) => (
                                  <option key={key} value={key}>{cfg.label}</option>
                                ))}
                              </select>
                              {/* Paid button */}
                              <button
                                onClick={() => togglePaid(cIdx, sIdx, session.isPaid)}
                                className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] w-[68px] flex items-center justify-center gap-1 ${session.isPaid ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                              >
                                {session.isPaid ? <><CheckCircle size={10} /> Lunas</> : 'Belum'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
