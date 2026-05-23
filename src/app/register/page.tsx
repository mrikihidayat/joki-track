'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePinGuard } from '@/hooks/usePinGuard';
import PinGate from '@/components/PinGate';
import Swal from 'sweetalert2';

export default function RegisterCustomer() {
  const { authed, checking, pin: guardPin, setPin: setGuardPin, error: guardError, loading: guardLoading, submitPin } = usePinGuard();
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [courses, setCourses] = useState<any[]>([]);

  const [currentCourseName, setCurrentCourseName] = useState('');
  const [sessionsInput, setSessionsInput] = useState('');
  const [typeInput, setTypeInput] = useState<'diskusi' | 'tugas'>('diskusi');
  const [priceInput, setPriceInput] = useState(8000);

  const swal = (opts: any) => Swal.fire(opts);

  const addCourse = () => {
    if (!currentCourseName || !sessionsInput) {
      swal({ icon: 'warning', title: 'Isi dulu!', text: 'Nama matkul dan sesi wajib diisi.', background: '#0f172a', color: '#e2e8f0' });
      return;
    }
    const sessionNumbers = sessionsInput.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num));
    if (sessionNumbers.length === 0) {
      swal({ icon: 'error', title: 'Format sesi salah', text: 'Pisah nomor sesi dengan koma. Contoh: 1,2,4,6,8', background: '#0f172a', color: '#e2e8f0' });
      return;
    }
    const sessionsData = sessionNumbers.map(num => ({ sessionNumber: num, type: typeInput, price: priceInput, isDone: false, isPaid: false }));
    setCourses([...courses, { courseName: currentCourseName, sessions: sessionsData }]);
    setCurrentCourseName('');
    setSessionsInput('');
    swal({ toast: true, position: 'top-end', icon: 'success', title: `"${currentCourseName}" ditambahkan`, showConfirmButton: false, timer: 1500 });
  };

  const handleSubmit = async () => {
    if (!name || !slug) {
      swal({ icon: 'warning', title: 'Profil belum lengkap', text: 'Nama dan slug wajib diisi!', background: '#0f172a', color: '#e2e8f0' });
      return;
    }
    if (courses.length === 0) {
      swal({ icon: 'warning', title: 'Belum ada matkul', text: 'Tambahkan minimal 1 mata kuliah dulu.', background: '#0f172a', color: '#e2e8f0' });
      return;
    }
    const res = await fetch('/api/customer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, slug: slug.toLowerCase(), courses }),
    });
    const data = await res.json();
    if (data.success) {
      await swal({ icon: 'success', title: 'Klien berhasil dibuat!', text: `Link: /track/${slug}`, background: '#0f172a', color: '#e2e8f0', timer: 2000, showConfirmButton: false });
      router.push('/');
    } else {
      swal({ icon: 'error', title: 'Gagal!', text: data.error || 'Terjadi kesalahan.', background: '#0f172a', color: '#e2e8f0' });
    }
  };

  if (checking) return (
    <div className="flex items-center justify-center h-screen bg-slate-950">
      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!authed) return (
    <PinGate pin={guardPin} setPin={setGuardPin} error={guardError} loading={guardLoading} onSubmit={submitPin} />
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <a href="/" className="text-slate-500 hover:text-slate-300 text-xs transition">← Dashboard</a>
            <span className="text-slate-700">|</span>
            <h1 className="text-xl font-bold text-teal-400">Tambah Klien Baru</h1>
          </div>

          <div className="space-y-5">
            {/* Profil */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">1. Profil Klien</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-300">Nama Lengkap</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Audi" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-300">Slug URL (huruf kecil, tanpa spasi)</label>
                  <input type="text" value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} placeholder="contoh: audi" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
              </div>
            </div>

            {/* Tambah Matkul */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">2. Tambah Mata Kuliah</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Nama Mata Kuliah</label>
                  <input type="text" value={currentCourseName} onChange={e => setCurrentCourseName(e.target.value)} placeholder="Contoh: Basis Data" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Sesi Target (pisah koma)</label>
                  <input type="text" value={sessionsInput} onChange={e => setSessionsInput(e.target.value)} placeholder="1,2,4,6,8" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Jenis Tugas</label>
                  <select value={typeInput} onChange={e => setTypeInput(e.target.value as any)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none">
                    <option value="diskusi">Diskusi</option>
                    <option value="tugas">Tugas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Tarif per Sesi (Rp)</label>
                  <input type="number" value={priceInput} onChange={e => setPriceInput(parseInt(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500" />
                </div>
              </div>
              <button type="button" onClick={addCourse} className="w-full bg-slate-800 hover:bg-slate-700 text-xs py-2 rounded-lg font-bold border border-slate-700/50 transition">
                + Tambahkan Matkul ke Daftar
              </button>

              {/* Daftar matkul yang sudah ditambah */}
              {courses.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">{courses.length} Matkul Ditambahkan</p>
                  {courses.map((c, idx) => (
                    <div key={idx} className="bg-slate-950 p-2.5 rounded-lg text-xs border border-slate-800 flex justify-between items-center">
                      <span>📚 <b>{c.courseName}</b> <span className="text-slate-500">({c.sessions.length} sesi · Rp {(c.sessions[0]?.price || 0).toLocaleString('id-ID')}/sesi)</span></span>
                      <button type="button" onClick={() => setCourses(courses.filter((_, i) => i !== idx))} className="text-rose-400 font-bold hover:underline ml-3 shrink-0">Hapus</button>
                    </div>
                  ))}
                  <p className="text-[10px] text-slate-600 pt-1">
                    Total: {courses.reduce((a, c) => a + c.sessions.length, 0)} sesi · Rp {courses.reduce((a, c) => a + c.sessions.reduce((b: number, s: any) => b + s.price, 0), 0).toLocaleString('id-ID')}
                  </p>
                </div>
              )}
            </div>

            <button onClick={handleSubmit} className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-bold transition text-sm">
              Simpan & Terbitkan Link Tracker
            </button>
          </div>
        </div>
      </div>
  );
}
