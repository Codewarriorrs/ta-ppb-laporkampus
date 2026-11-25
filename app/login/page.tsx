'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { AppLogoIcon } from '@/components/ui/AppLogo';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const urlError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(urlError || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setErrorMessage('Kata sandi minimal harus 8 karakter.');
      return;
    }

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
        if (data.requiresVerification) {
          router.push(`/register?verifyEmail=${encodeURIComponent(email)}`);
          return;
        }
        setErrorMessage(data.message || 'Email atau password yang Anda masukkan salah.');
        setLoading(false);
        return;
      }

      const userRole = data.data?.user?.role;
      if (redirect && redirect !== '/') {
        router.push(redirect);
      } else if (userRole === 'birokrasi') {
        router.push('/birokrasi');
      } else {
        router.push('/');
      }
      router.refresh();
    } catch {
      setErrorMessage('Terjadi gangguan jaringan ke server. Coba beberapa saat lagi.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="w-full max-w-5xl bg-white rounded-[32px] shadow-card-3d border border-white/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* Kolom Kiri: Form Login */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between">
          <div>
            {/* Logo Brand */}
            <div className="flex items-center gap-3 mb-8">
              <AppLogoIcon size="sm" />
              <span className="font-display font-extrabold text-neutral-900 text-lg tracking-tight">
                Lapor<span className="text-primary">Kampus</span>
              </span>
            </div>

            {/* Header Form */}
            <div className="space-y-2 mb-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight font-display">
                Selamat Datang Kembali!
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 font-sans leading-relaxed">
                Masuk untuk melaporkan dan memantau pemeliharaan fasilitas kampus secara cepat.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-6 p-3.5 bg-danger-light border border-danger/20 rounded-[18px] text-danger text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input Email */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5 font-sans">
                  Email Kampus
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@kampus.ac.id"
                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200/80 rounded-[18px] text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
                  />
                </div>
              </div>

              {/* Input Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-neutral-700 font-sans">
                    Kata Sandi
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 bg-neutral-50 border border-neutral-200/80 rounded-[18px] text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Tombol Masuk Primary */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-[18px] shadow-btn-3d flex items-center justify-center gap-2 transition-all disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk Sekarang</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Switch ke Register */}
          <div className="mt-8 text-center text-xs text-neutral-600 font-sans">
            Belum memiliki akun LaporKampus?{' '}
            <Link
              href={`/register${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
              className="font-bold text-primary hover:underline"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>

        {/* Kolom Kanan: Panel Profil Teknik Komputer Undip (Clean Editorial & Technical Style) */}
        <div className="hidden lg:flex lg:col-span-6 p-10 xl:p-12 flex-col justify-between bg-primary text-white relative">
          {/* Header Info Departemen */}
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/15">
              <div>
                <p className="text-[11px] font-bold text-sky-300 tracking-wider uppercase font-sans">
                  Departemen Teknik Komputer
                </p>
                <p className="text-xs text-white/70 font-sans">
                  Fakultas Teknik Universitas Diponegoro
                </p>
              </div>
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md bg-white/10 text-white font-mono">
                Kampus Tembalang
              </span>
            </div>

            <div className="mt-8 space-y-4">
              <h2 className="text-2xl xl:text-3xl font-extrabold text-white leading-snug font-display">
                Layanan Pelaporan Fasilitas &amp; Sarana Prasarana Terpadu
              </h2>
              <p className="text-xs xl:text-sm text-white/80 leading-relaxed font-sans">
                Platform terpusat untuk mahasiswa dan civitas akademika dalam menyampaikan kendala perangkat lab, ruang kuliah, dan jaringan di lingkungan Departemen Teknik Komputer Undip.
              </p>
            </div>
          </div>

          {/* Cakupan Laboratorium & Fasilitas Utama */}
          <div className="space-y-4 my-8">
            <p className="text-[11px] uppercase font-bold text-white/60 tracking-wider font-sans">
              Fasilitas Laboratorium &amp; Riset Utama:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs font-bold text-white">Lab. Sistem Tertanam</p>
                <p className="text-[10px] text-white/70 mt-0.5">Embedded System &amp; Robotika</p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs font-bold text-white">Lab. Jaringan Komputer</p>
                <p className="text-[10px] text-white/70 mt-0.5">Network &amp; Cyber Security</p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs font-bold text-white">Lab. Rekayasa Perangkat Lunak</p>
                <p className="text-[10px] text-white/70 mt-0.5">Software Eng. &amp; Mobile</p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs font-bold text-white">Lab. Multimedia &amp; Sinyal</p>
                <p className="text-[10px] text-white/70 mt-0.5">Pengolahan Citra &amp; Multimedia</p>
              </div>
            </div>
          </div>

          {/* Kutipan Pengelola Sarpras / Tendik (Disamarkan) */}
          <div className="pt-4 border-t border-white/15">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-300 font-bold text-xs flex items-center justify-center shrink-0 border border-sky-400/30">
                TK
              </div>
              <div>
                <p className="text-xs font-bold text-white font-sans">
                  Subbagian Sarana &amp; Prasarana
                </p>
                <p className="text-[10px] text-white/60 font-sans">
                  Gedung Departemen Teknik Komputer Undip, Tembalang
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center bg-background text-xs text-neutral-400">Memuat...</div>}>
      <LoginForm />
    </Suspense>
  );
}
