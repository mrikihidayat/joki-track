'use client';

import { useState, useEffect } from 'react';

const SESSION_KEY = 'joki_admin_auth';

export function usePinGuard() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const val = sessionStorage.getItem(SESSION_KEY);
    if (val === '1') setAuthed(true);
    setChecking(false);
  }, []);

  const submitPin = async () => {
    if (!pin) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem(SESSION_KEY, '1');
        setAuthed(true);
      } else {
        setError(data.message || 'PIN salah.');
        setPin('');
      }
    } catch {
      setError('Gagal menghubungi server.');
    }
    setLoading(false);
  };

  return { authed, checking, pin, setPin, error, loading, submitPin };
}
