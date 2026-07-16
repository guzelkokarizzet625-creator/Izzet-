'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Bot, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Loader2, 
  ArrowRight, 
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';

interface AuthPortalProps {
  initialMode?: 'login' | 'register' | 'forgot';
  onClose?: () => void;
  isModal?: boolean;
}

export default function AuthPortal({ initialMode = 'login', onClose, isModal = false }: AuthPortalProps) {
  const { signIn, signUp, resetPassword, authError, clearAuthError } = useApp();
  
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleClear = () => {
    clearAuthError();
    setLocalError(null);
    setSuccessMessage(null);
  };

  const handleModeChange = (newMode: 'login' | 'register' | 'forgot') => {
    handleClear();
    setMode(newMode);
    setPassword('');
  };

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    handleClear();

    if (!email || !password) {
      setLocalError('Lütfen tüm alanları doldurun.');
      return;
    }

    if (!validateEmail(email)) {
      setLocalError('Lütfen geçerli bir e-posta adresi girin.');
      return;
    }

    // --- Rate Limiting Check ---
    const ATTEMPTS_LIMIT = 5;
    const COOLDOWN_MS = 60000; // 60 seconds
    const now = Date.now();
    const storedAttempts = Number(localStorage.getItem('al_login_attempts') || '0');
    const storedTimestamp = Number(localStorage.getItem('al_last_attempt_time') || '0');

    if (storedAttempts >= ATTEMPTS_LIMIT && now - storedTimestamp < COOLDOWN_MS) {
      const remainingSec = Math.ceil((COOLDOWN_MS - (now - storedTimestamp)) / 1000);
      setLocalError(`Güvenlik nedeniyle hesabınız geçici olarak kilitlendi. Lütfen ${remainingSec} saniye sonra tekrar deneyin.`);
      return;
    }

    setLoading(true);
    const success = await signIn(email, password);
    setLoading(false);
    
    if (success) {
      localStorage.removeItem('al_login_attempts');
      localStorage.removeItem('al_last_attempt_time');
    } else {
      const newAttempts = storedAttempts + 1;
      localStorage.setItem('al_login_attempts', String(newAttempts));
      localStorage.setItem('al_last_attempt_time', String(Date.now()));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    handleClear();

    if (!email || !password || !name) {
      setLocalError('Lütfen tüm alanları doldurun.');
      return;
    }

    if (!validateEmail(email)) {
      setLocalError('Lütfen geçerli bir e-posta adresi girin.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Şifre en az 6 karakterden oluşmalıdır.');
      return;
    }

    setLoading(true);
    const success = await signUp(email, password, name);
    setLoading(false);

    if (success) {
      setSuccessMessage('Hesabınız başarıyla oluşturuldu! Ofis paneline yönlendiriliyorsunuz.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    handleClear();

    if (!email) {
      setLocalError('Lütfen e-posta adresinizi girin.');
      return;
    }

    if (!validateEmail(email)) {
      setLocalError('Lütfen geçerli bir e-posta adresi girin.');
      return;
    }

    setLoading(true);
    const success = await resetPassword(email);
    setLoading(false);

    if (success) {
      setSuccessMessage('Şifre sıfırlama e-postası başarıyla gönderildi. Lütfen gelen kutunuzu kontrol edin.');
    }
  };

  const displayError = localError || authError;

  return (
    <div className={isModal ? "w-full max-w-md bg-charcoal border border-slateGrey/60 rounded-3xl p-8 shadow-2xl relative" : "min-h-screen w-full flex items-center justify-center bg-midnight text-ivory px-4 py-12 relative overflow-hidden font-sans"}>
      
      {!isModal && (
        <>
          {/* Decorative background grid & glow effects */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-goldDark/10 via-midnight/80 to-midnight -z-10" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-goldDark/5 blur-[120px] rounded-full -z-10" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amberAccent/5 blur-[120px] rounded-full -z-10" />
        </>
      )}

      {/* Auth Card Container */}
      <div className={isModal ? "relative w-full" : "w-full"}>
        {onClose && (
          <button 
            type="button" 
            onClick={onClose} 
            className="absolute right-0 top-0 text-softGrey hover:text-ivory transition-colors p-1.5 rounded-full hover:bg-slateGrey/20 z-10"
            style={{ minHeight: '40px', minWidth: '40px' }}
          >
            <X className="w-5 h-5" />
          </button>
        )}
        
        {/* Branding header */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex bg-gradient-to-br from-goldDark to-amberAccent p-3.5 rounded-2xl text-midnight shadow-lg shadow-goldDark/20 mx-auto">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black text-goldLight tracking-wider font-display uppercase glow-gold">
              AL HUKUK AI
            </h1>
            <span className="text-[10px] text-softGrey tracking-widest uppercase block mt-1">
              Yapay Zekâ Destekli Hukuk Otomasyonu
            </span>
          </div>
        </div>

        {/* Action Message Center */}
        {displayError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-red-300 font-medium leading-relaxed">{displayError}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3 animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-300 font-medium leading-relaxed">{successMessage}</p>
          </div>
        )}

        {/* --- 1. LOGIN FORM --- */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-ivory">Giriş Yapın</h2>
              <p className="text-xs text-softGrey">Sisteme erişmek için kimlik bilgilerinizi girin.</p>
            </div>

            <div className="space-y-3">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black tracking-wider text-softGrey/80">E-Posta Adresi</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-softGrey" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-midnight/80 border border-slateGrey/50 focus:border-goldDark/60 rounded-xl py-3 pl-11 pr-4 text-xs font-medium text-ivory outline-none placeholder:text-softGrey/40 transition-all"
                    placeholder="ornek@baro.org.tr"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase font-black tracking-wider text-softGrey/80">Şifre</label>
                  <button
                    type="button"
                    onClick={() => handleModeChange('forgot')}
                    className="text-[10px] font-bold text-goldDark hover:text-goldLight transition-colors"
                  >
                    Şifremi Unuttum
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-softGrey" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-midnight/80 border border-slateGrey/50 focus:border-goldDark/60 rounded-xl py-3 pl-11 pr-11 text-xs font-medium text-ivory outline-none placeholder:text-softGrey/40 transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-softGrey hover:text-ivory transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-goldDark to-amberAccent hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 text-midnight font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 mt-6 transition-all shadow-md shadow-goldDark/10 outline-none"
              style={{ minHeight: '48px' }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Giriş Yap</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-center text-xs text-softGrey pt-4">
              Hesabınız yok mu?{' '}
              <button
                type="button"
                onClick={() => handleModeChange('register')}
                className="font-bold text-goldDark hover:text-goldLight transition-colors"
              >
                Kayıt Olun
              </button>
            </p>
          </form>
        )}

        {/* --- 2. REGISTER FORM --- */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-ivory">Kayıt Olun</h2>
              <p className="text-xs text-softGrey">Hemen ücretsiz hesabınızı oluşturup asistana başlayın.</p>
            </div>

            <div className="space-y-3">
              {/* Full Name Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black tracking-wider text-softGrey/80">Ad Soyad (Ünvan)</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-softGrey" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-midnight/80 border border-slateGrey/50 focus:border-goldDark/60 rounded-xl py-3 pl-11 pr-4 text-xs font-medium text-ivory outline-none placeholder:text-softGrey/40 transition-all"
                    placeholder="Av. Kerem Soylu"
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black tracking-wider text-softGrey/80">E-Posta Adresi</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-softGrey" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-midnight/80 border border-slateGrey/50 focus:border-goldDark/60 rounded-xl py-3 pl-11 pr-4 text-xs font-medium text-ivory outline-none placeholder:text-softGrey/40 transition-all"
                    placeholder="ornek@baro.org.tr"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black tracking-wider text-softGrey/80">Şifre (En az 6 karakter)</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-softGrey" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-midnight/80 border border-slateGrey/50 focus:border-goldDark/60 rounded-xl py-3 pl-11 pr-11 text-xs font-medium text-ivory outline-none placeholder:text-softGrey/40 transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-softGrey hover:text-ivory transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-goldDark to-amberAccent hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 text-midnight font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 mt-6 transition-all shadow-md shadow-goldDark/10 outline-none"
              style={{ minHeight: '48px' }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Hesap Oluştur</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-center text-xs text-softGrey pt-4">
              Zaten hesabınız var mı?{' '}
              <button
                type="button"
                onClick={() => handleModeChange('login')}
                className="font-bold text-goldDark hover:text-goldLight transition-colors"
              >
                Giriş Yapın
              </button>
            </p>
          </form>
        )}

        {/* --- 3. FORGOT PASSWORD FORM --- */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-ivory">Şifremi Unuttum</h2>
              <p className="text-xs text-softGrey">E-posta adresinizi girerek şifre sıfırlama bağlantısı talep edin.</p>
            </div>

            <div className="space-y-3">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black tracking-wider text-softGrey/80">E-Posta Adresi</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-softGrey" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-midnight/80 border border-slateGrey/50 focus:border-goldDark/60 rounded-xl py-3 pl-11 pr-4 text-xs font-medium text-ivory outline-none placeholder:text-softGrey/40 transition-all"
                    placeholder="ornek@baro.org.tr"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-goldDark to-amberAccent hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 text-midnight font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 mt-6 transition-all shadow-md shadow-goldDark/10 outline-none"
              style={{ minHeight: '48px' }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Sıfırlama Bağlantısı Gönder</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => handleModeChange('login')}
                className="text-xs font-bold text-goldDark hover:text-goldLight transition-colors"
              >
                Giriş Ekranına Dön
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
