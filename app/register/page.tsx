'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldAlert, User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password.length < 8) {
      setErrorMessage('Kata sandi minimal harus 8 karakter.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Registrasi akun gagal. Silakan coba lagi.');
        setLoading(false);
        return;
      }

      // Berhasil registrasi & login otomatis
      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      setErrorMessage('Terjadi gangguan koneksi ke server. Coba beberapa saat lagi.');
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
          Daftarkan akun Anda untuk mulai menyampaikan laporan fasilitas
        </p>
      </div>

      {/* Card Form */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-6 max-w-md mx-auto w-full">
        <h2 className="text-lg font-bold text-neutral-900 mb-1">Daftar Akun Baru</h2>
        <p className="text-xs text-neutral-500 mb-5">
          Lengkapi data diri Anda di bawah ini
        </p>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
            <span className="font-bold">•</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Lengkap */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Nama Lengkap
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Muhammad Zaidan"
                className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

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
              Kata Sandi (Minimal 8 karakter)
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
                <span>Mendaftarkan Akun...</span>
              </>
            ) : (
              <>
                <span>Daftar Akun Baru</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Switch ke Login */}
      <div className="mt-6 text-center text-xs text-neutral-600">
        Sudah memiliki akun?{' '}
        <Link
          href={`/login${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
          className="font-bold text-primary hover:underline"
        >
          Masuk di Sini
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center p-8 text-xs text-gray-400">Memuat...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
