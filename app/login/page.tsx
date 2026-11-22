'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldAlert, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Login gagal. Periksa kembali email dan password.');
        setLoading(false);
        return;
      }

      // Berhasil login
      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      setErrorMessage('Terjadi kesalahan jaringan. Silakan coba lagi.');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-5 sm:px-6 py-10 bg-neutral-50/50">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-primary rounded-2xl mx-auto flex items-center justify-center shadow-md shadow-primary/20 mb-3">
          <ShieldAlert className="w-8 h-8 text-white stroke-[2.2]" />
        </div>
        <h1 className="text-2xl font-black text-neutral-900 tracking-tight">LaporKampus</h1>
        <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
          Sistem Pelaporan Sarana & Fasilitas Kampus Berbasis Progressive Web App
        </p>
      </div>

      {/* Card Form */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-6 max-w-md mx-auto w-full">
        <h2 className="text-lg font-bold text-neutral-900 mb-1">Masuk ke Akun</h2>
        <p className="text-xs text-neutral-500 mb-5">
          Gunakan akun mahasiswa atau birokrasi kampus Anda
        </p>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
            <span className="font-bold">•</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Email Kampus
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@kampus.ac.id"
                className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-semibold text-sm rounded-xl shadow-sm shadow-primary/20 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Accounts Pill */}
        <div className="mt-5 pt-4 border-t border-neutral-100 space-y-2">
          <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            Akun Percobaan (Demo Responsi):
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setEmail('zaidan@kampus.ac.id');
                setPassword('mahasiswa123');
              }}
              className="p-2 text-left rounded-lg bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 transition-colors"
            >
              <div className="font-semibold text-neutral-800">👨‍🎓 Mahasiswa</div>
              <div className="text-neutral-500 text-[10px] truncate">zaidan@kampus.ac.id</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('budi@kampus.ac.id');
                setPassword('birokrasi123');
              }}
              className="p-2 text-left rounded-lg bg-primary-50/50 hover:bg-primary-50 border border-primary-200/60 transition-colors"
            >
              <div className="font-semibold text-primary">🏛️ Birokrasi</div>
              <div className="text-primary/70 text-[10px] truncate">budi@kampus.ac.id</div>
            </button>
          </div>
        </div>
      </div>

      {/* Switch ke Register */}
      <div className="mt-6 text-center text-xs text-neutral-600">
        Belum memiliki akun LaporKampus?{' '}
        <Link
          href={`/register${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
          className="font-bold text-primary hover:underline"
        >
          Daftar Sekarang
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center p-8 text-xs text-gray-400">Memuat...</div>}>
      <LoginForm />
    </Suspense>
  );
}
