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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(urlError || '');

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
        if (data.requiresVerification) {
          router.push(`/register?verifyEmail=${encodeURIComponent(email)}`);
          return;
        }
        setErrorMessage(data.message || 'Email atau password yang Anda masukkan salah.');
        setLoading(false);
        return;
      }

      router.push(redirect);
      router.refresh();
    } catch {
      setErrorMessage('Terjadi gangguan jaringan ke server. Coba beberapa saat lagi.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    window.location.href = `/api/auth/google?redirect=${encodeURIComponent(redirect)}`;
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

            {/* Divider OR */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px bg-neutral-200 flex-1" />
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider font-sans">
                Atau
              </span>
              <div className="h-px bg-neutral-200 flex-1" />
            </div>

            {/* Tombol Google OAuth */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full py-3 px-4 bg-white hover:bg-neutral-50 active:scale-[0.99] border border-neutral-200/80 rounded-[18px] text-xs sm:text-sm font-bold text-neutral-700 shadow-soft-3d flex items-center justify-center gap-3 transition-all"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              )}
              <span>Lanjutkan dengan Google</span>
            </button>
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

        {/* Kolom Kanan: Branded Showcase Panel (Desktop Saja) */}
        <div
          className="hidden lg:flex lg:col-span-6 p-12 flex-col justify-between relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #2d2a45 0%, #1e1b38 60%, #141226 100%)',
          }}
        >
          {/* Soft 3D Glow Orbs */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Badge */}
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold text-accent tracking-wide uppercase border border-white/10">
              ✦ Sistem Terpadu Kampus
            </span>
          </div>

          {/* Middle: Headline & Testimonial */}
          <div className="relative z-10 space-y-8 my-auto">
            <h2 className="text-3xl font-extrabold text-white leading-tight font-display">
              Fasilitas Kampus Nyaman, Kuliah Jauh Lebih Tenang.
            </h2>

            {/* Testimonial Quote Card */}
            <div className="p-6 rounded-[24px] bg-white/10 backdrop-blur-md border border-white/15 space-y-4">
              <p className="text-xs text-white/90 leading-relaxed font-sans italic">
                “LaporKampus mempercepat respon perbaikan fasilitas mulai dari ruang kelas, lab komputer, hingga sanitasi kampus secara terdata dan transparan.”
              </p>

              <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                <div className="w-9 h-9 rounded-full bg-accent text-neutral-900 font-black text-xs flex items-center justify-center shrink-0">
                  BS
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight font-sans">
                    Budi Santoso, S.T.
                  </h4>
                  <p className="text-[10px] text-white/60 font-medium">
                    Kepala Bagian Sarana & Prasarana
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Campus Units */}
          <div className="relative z-10 pt-6 border-t border-white/10">
            <p className="text-[10px] uppercase font-bold text-white/50 tracking-wider mb-2 font-sans">
              Mencakup Seluruh Fasilitas Kampus:
            </p>
            <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-white/80">
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">Ruang Kuliah GKB</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">Lab Komputer & AI</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">Perpustakaan Pusat</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">Fasilitas Sanitasi</span>
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
