'use client';

import React, { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { AppLogoIcon } from '@/components/ui/AppLogo';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const verifyEmailParam = searchParams.get('verifyEmail') || '';

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState(verifyEmailParam);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP Verification State
  const [step, setStep] = useState<'register' | 'verify'>(verifyEmailParam ? 'verify' : 'register');
  const [otp, setOtp] = useState('');
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Status
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Countdown timer untuk kirim ulang OTP
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (password.length < 6) {
      setErrorMessage('Kata sandi minimal harus 6 karakter.');
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
        setErrorMessage(data.message || 'Registrasi gagal. Silakan coba lagi.');
        setLoading(false);
        return;
      }

      // Jika pendaftaran memerlukan verifikasi OTP (Brevo)
      if (data.requiresVerification) {
        setStep('verify');
        setSuccessMessage('Kode OTP telah dikirimkan ke email kampus Anda!');
        if (data.devOtp) setDevOtpHint(data.devOtp);
        setResendCooldown(60);
        setLoading(false);
        return;
      }

      // Jika langsung login
      router.push(redirect);
      router.refresh();
    } catch {
      setErrorMessage('Terjadi gangguan koneksi server. Coba beberapa saat lagi.');
      setLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Kode OTP tidak valid atau telah kadaluarsa.');
        setLoading(false);
        return;
      }

      setSuccessMessage('Verifikasi berhasil! Mengalihkan ke aplikasi...');
      setTimeout(() => {
        router.push(redirect);
        router.refresh();
      }, 1000);
    } catch {
      setErrorMessage('Gagal memverifikasi OTP. Coba beberapa saat lagi.');
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Kode OTP baru telah dikirim ulang ke email Anda.');
        if (data.devOtp) setDevOtpHint(data.devOtp);
        setResendCooldown(60);
      } else {
        setErrorMessage(data.message || 'Gagal mengirim ulang OTP.');
      }
    } catch {
      setErrorMessage('Gagal mengirim ulang OTP.');
    } finally {
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
        {/* Kolom Kiri: Form Registrasi / Verifikasi OTP */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between">
          <div>
            {/* Logo Brand */}
            <div className="flex items-center gap-3 mb-8">
              <AppLogoIcon size="sm" />
              <span className="font-display font-extrabold text-neutral-900 text-lg tracking-tight">
                Lapor<span className="text-primary">Kampus</span>
              </span>
            </div>

            {step === 'register' ? (
              <>
                {/* Header Register */}
                <div className="space-y-2 mb-8">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight font-display">
                    Daftar Akun Baru
                  </h1>
                  <p className="text-xs sm:text-sm text-neutral-500 font-sans leading-relaxed">
                    Bergabung dengan civitas kampus untuk pemeliharaan fasilitas bersama.
                  </p>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="mb-6 p-3.5 bg-danger-light border border-danger/20 rounded-[18px] text-danger text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="font-medium leading-relaxed">{errorMessage}</span>
                  </div>
                )}

                {/* Form Registrasi */}
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {/* Nama Lengkap */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5 font-sans">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Contoh: Muhammad Zaidan"
                        className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200/80 rounded-[18px] text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
                      />
                    </div>
                  </div>

                  {/* Email */}
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

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5 font-sans">
                      Kata Sandi (Min. 6 Karakter)
                    </label>
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

                  {/* Tombol Buat Akun Primary */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3.5 px-4 bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-[18px] shadow-btn-3d flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mendaftarkan...</span>
                      </>
                    ) : (
                      <>
                        <span>Daftar Akun Baru</span>
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
                  <span>Daftar dengan Google</span>
                </button>
              </>
            ) : (
              /* Step 2: Form Verifikasi OTP Brevo */
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-primary uppercase tracking-wider bg-primary-50 px-2.5 py-1 rounded-full border border-primary-100">
                    Langkah Verifikasi
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight font-display">
                    Masukkan Kode OTP
                  </h1>
                  <p className="text-xs sm:text-sm text-neutral-500 font-sans leading-relaxed">
                    Kode verifikasi 6-digit telah dikirimkan ke <strong className="text-neutral-800">{email}</strong>.
                  </p>
                </div>

                {devOtpHint && (
                  <div className="p-3 bg-mint-light border border-mint/40 rounded-[18px] text-xs text-neutral-800">
                    <span className="font-bold text-mint-dark">ℹ️ Kode OTP Demo:</span>{' '}
                    <span className="font-mono font-bold text-sm tracking-widest text-primary">{devOtpHint}</span>
                  </div>
                )}

                {errorMessage && (
                  <div className="p-3.5 bg-danger-light border border-danger/20 rounded-[18px] text-danger text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="p-3.5 bg-success-light border border-success/20 rounded-[18px] text-success text-xs flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{successMessage}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5 font-sans">
                      Kode OTP (6 Digit)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="Contoh: 123456"
                      className="w-full text-center tracking-[8px] text-2xl font-bold font-mono py-3 bg-neutral-50 border border-neutral-200/80 rounded-[18px] text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length < 4}
                    className="w-full py-3.5 bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-[18px] shadow-btn-3d flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Memverifikasi...</span>
                      </>
                    ) : (
                      <>
                        <span>Verifikasi & Masuk</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="flex items-center justify-between pt-2 text-xs text-neutral-500 font-sans">
                  <button
                    type="button"
                    onClick={() => setStep('register')}
                    className="text-neutral-500 hover:text-neutral-800 underline"
                  >
                    Ganti data / email
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || loading}
                    className="text-primary font-bold hover:underline disabled:text-neutral-400 disabled:no-underline flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>
                      {resendCooldown > 0 ? `Kirim ulang (${resendCooldown}s)` : 'Kirim Ulang Kode'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Switch ke Login */}
          <div className="mt-8 text-center text-xs text-neutral-600 font-sans">
            Sudah memiliki akun?{' '}
            <Link
              href={`/login${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
              className="font-bold text-primary hover:underline"
            >
              Masuk di Sini
            </Link>
          </div>
        </div>

        {/* Kolom Kanan: Branded Showcase Panel */}
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
              ✦ Komunitas Peduli Kampus
            </span>
          </div>

          {/* Middle: Headline & Feature Highlights */}
          <div className="relative z-10 space-y-8 my-auto">
            <h2 className="text-3xl font-extrabold text-white leading-tight font-display">
              Satu Laporan Anda, Menjaga Kenyamanan Seluruh Kampus.
            </h2>

            <div className="space-y-3">
              <div className="p-4 rounded-[20px] bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-[12px] bg-mint/20 text-mint flex items-center justify-center font-bold text-sm">
                  ✓
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-sans">Lapor Instan 1 Menit</h4>
                  <p className="text-[11px] text-white/60">Pilih ruangan, foto kerusakan, otomatis terdata.</p>
                </div>
              </div>

              <div className="p-4 rounded-[20px] bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-[12px] bg-accent/20 text-accent flex items-center justify-center font-bold text-sm">
                  ✓
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-sans">Bisa Dipakai Saat Offline</h4>
                  <p className="text-[11px] text-white/60">Laporan tersimpan di memori saat tidak ada sinyal internet.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Trust Row */}
          <div className="relative z-10 pt-6 border-t border-white/10 text-white/60 text-[11px] font-sans">
            LaporKampus — Proyek Tugas Akhir Praktikum Pemrograman Perangkat Bergerak
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center bg-background text-xs text-neutral-400">Memuat...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
