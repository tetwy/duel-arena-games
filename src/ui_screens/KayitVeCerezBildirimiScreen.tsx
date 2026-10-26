import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface KayitVeCerezBildirimiScreenProps {
  onNavigate?: (path: string) => void;
}

export const KayitVeCerezBildirimiScreen: React.FC<KayitVeCerezBildirimiScreenProps> = ({ onNavigate }) => {
  const { signUp, signIn, signInWithOAuth, profile, isSupabaseConfigured = true } = useAuth();
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [abConsentAccepted, setAbConsentAccepted] = useState(true);
  const [marketingAccepted, setMarketingAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const getPasswordStrength = (val: string) => {
    if (!val || val.length === 0) return { score: 0, label: 'Min. 8 karakter', colorClass: 'text-on-surface-variant' };
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    if (score === 1) return { score: 1, label: 'Zayıf Şifre', colorClass: 'text-error' };
    if (score === 2) return { score: 2, label: 'Orta Güçlükte', colorClass: 'text-tertiary' };
    if (score === 3) return { score: 3, label: 'İyi Seviye', colorClass: 'text-primary' };
    return { score: 4, label: 'Maksimum Güvenlik', colorClass: 'text-primary font-bold' };
  };

  const strength = getPasswordStrength(password);

  const generateStrongPassword = () => {
    const charsUpper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const charsLower = 'abcdefghijkmnopqrstuvwxyz';
    const charsDigits = '23456789';
    const charsSpecial = '!@#$%^&*()_+~=';
    const all = charsUpper + charsLower + charsDigits + charsSpecial;
    
    const res = [
      charsUpper[Math.floor(Math.random() * charsUpper.length)],
      charsLower[Math.floor(Math.random() * charsLower.length)],
      charsDigits[Math.floor(Math.random() * charsDigits.length)],
      charsSpecial[Math.floor(Math.random() * charsSpecial.length)],
    ];
    for (let i = 4; i < 14; i++) {
      res.push(all[Math.floor(Math.random() * all.length)]);
    }
    const strongPass = res.sort(() => Math.random() - 0.5).join('');
    setPassword(strongPass);
    setShowPassword(true);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (authMode === 'signup') {
      if (!termsAccepted || !abConsentAccepted) {
        setFeedback({ type: 'error', message: 'Lütfen zorunlu yasal onay kutularını işaretleyin.' });
        return;
      }
      if (!username.trim()) {
        setFeedback({ type: 'error', message: 'Lütfen geçerli bir kullanıcı adı girin.' });
        return;
      }

      setIsSubmitting(true);
      const res = await signUp(email, password, username);
      setIsSubmitting(false);

      if (!res.success) {
        setFeedback({ type: 'error', message: res.error || 'Kayıt işlemi gerçekleştirilemedi.' });
      } else {
        setFeedback({ type: 'success', message: 'Hesabınız başarıyla oluşturuldu! Arenaya aktarılıyorsunuz...' });
        setTimeout(() => {
          onNavigate?.('ortak-portal');
        }, 1200);
      }
    } else {
      // Sign In Mode
      setIsSubmitting(true);
      const res = await signIn(email, password);
      setIsSubmitting(false);

      if (!res.success) {
        setFeedback({ type: 'error', message: res.error || 'Giriş yapılamadı. Bilgilerinizi kontrol edin.' });
      } else {
        setFeedback({ type: 'success', message: 'Giriş başarılı! Hoş geldiniz...' });
        setTimeout(() => {
          onNavigate?.('ortak-portal');
        }, 1000);
      }
    }
  };

  return (
    <main className="w-full min-h-[calc(100vh-5rem)] pt-20 bg-surface flex-1 relative flex flex-col justify-start">
      {/*  BACKGROUND SIMULATION: Dimmed Ortak Giriş Portalı  */}
      <div className="absolute inset-0 opacity-15 filter blur-sm pointer-events-none select-none overflow-hidden -z-10" aria-hidden="true">
        <div className="w-full px-margin py-space-xl">
          {/*  Quick Portal Metrics Bar  */}
          <div className="grid grid-cols-12 gap-gutter mb-space-xl">
            <div className="col-span-12 lg:col-span-8 flex items-center justify-between p-space-lg rounded-xl bg-surface-container">
              <div className="flex items-center gap-space-md">
                <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[28px]">sports_esports</span>
                </div>
                <div>
                  <div className="font-headline-sm text-headline-sm text-on-surface">Canlı Düello Lobisi</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">Çok oyunculu lobi ve gerçek zamanlı rekabet</div>
                </div>
              </div>
              <div className="flex items-center gap-space-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                <span className="font-label-md text-label-md text-primary">Canlı Bağlantı</span>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-4 p-space-lg rounded-xl bg-surface-container flex items-center justify-between">
              <span className="font-title-md text-title-md text-on-surface">Sıralama</span>
              <span className="font-headline-md text-headline-md text-primary font-bold">Canlı ELO</span>
            </div>
          </div>
          {/*  Arena Split Showcase (Veto vs Harfbaz)  */}
          <div className="grid grid-cols-12 gap-gutter">
            <div className="col-span-12 md:col-span-6 rounded-xl bg-surface-container p-space-xl flex flex-col justify-between h-96">
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary">Taktik ve Zeka</span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mt-space-2xs">VETO DÜELLOSU</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">Stratejik hamlelerle rakibinin seçeneklerini tüket, arenada tek kalan sen ol.</p>
              </div>
              <div className="h-32 rounded-lg bg-surface-container-high"></div>
            </div>
            <div className="col-span-12 md:col-span-6 rounded-xl bg-surface-container p-space-xl flex flex-col justify-between h-96">
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Kelime ve Refleks</span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mt-space-2xs">HARFBAZ KAPARDI</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">Hızlı düşün, harfleri birbirine bağla ve sözlük sınırlarını zorla.</p>
              </div>
              <div className="h-32 rounded-lg bg-surface-container-high"></div>
            </div>
          </div>
        </div>
      </div>

      {/*  OVERLAY SCRIM & FORM CONTAINER  */}
      <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-start sm:justify-center px-margin-mobile md:px-margin py-6 sm:py-10 pb-36">
        {/*  AMBIENT GLOW ELEMENT  */}
        <div className="absolute w-[500px] h-[500px] rounded-full bg-primary-container/10 filter blur-[120px] pointer-events-none -z-10"></div>
        {/*  1. MERKEZDE: SUPABASE AUTH UYUMLU KAYIT MODALI  */}
        <div className="w-full max-w-xl bg-surface-container rounded-2xl shadow-2xl p-space-md sm:p-space-lg md:p-space-xl relative border border-outline-variant/30 my-auto transition-all duration-300">
          {/*  Glow Stripe  */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80"></div>
          {/*  Header Section  */}
          <div className="flex items-start justify-between gap-space-md mb-space-md">
            <div className="flex flex-col">
              <div className="flex items-center gap-space-xs mb-space-2xs">
                <span className="material-symbols-outlined text-primary text-[22px]">swords</span>
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">DUEL ARENA • AUTH GİRİŞİ</span>
              </div>
              <h1 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
                {authMode === 'signup' ? "Duel Arena'ya Katıl" : "Arenaya Giriş Yap"}
              </h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                {authMode === 'signup' ? "Veto ve Harfbaz arenasında yerini al, rekabete başla!" : "Kayıtlı hesabınla oturum aç ve düellolara kaldığın yerden devam et."}
              </p>
            </div>
            <button
              aria-label="Pencereyi Kapat"
              onClick={() => onNavigate?.('ortak-portal')}
              className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors shrink-0"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          {/*  Registration / Login Form  */}
          <form className="flex flex-col gap-space-sm md:gap-space-md" id="signup-form" onSubmit={handleRegisterSubmit}>
            {/* Feedback Alert */}
            {feedback && (
              <div className={`p-space-sm rounded-xl text-xs font-semibold flex items-center gap-space-xs ${feedback.type === 'error' ? 'bg-error-container/30 text-error border border-error/30' : 'bg-primary-container/20 text-primary border border-primary/30'}`}>
                <span className="material-symbols-outlined text-[18px]">
                  {feedback.type === 'error' ? 'error' : 'check_circle'}
                </span>
                <span>{feedback.message}</span>
              </div>
            )}

            {/*  Input: E-Posta  */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="email-field">
                E-posta Adresi
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-space-md text-[18px] text-outline pointer-events-none">mail</span>
                <input 
                  className="w-full bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md pl-11 pr-space-md py-3 rounded-lg focus:outline-none focus:bg-surface-container-high transition-colors" 
                  id="email-field" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="gladiator@duelarena.com" 
                  required 
                  type="email"
                />
              </div>
            </div>

            {/*  Input: Kullanıcı Adı (Sadece Kayıt Modunda)  */}
            {authMode === 'signup' && (
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="username-field">Kullanıcı Adı (Oyuncu Kimliği)</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-space-md text-[18px] text-outline pointer-events-none">badge</span>
                  <input 
                    className="w-full bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md pl-11 pr-space-md py-3 rounded-lg focus:outline-none focus:bg-surface-container-high transition-colors" 
                    id="username-field" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    maxLength={16} 
                    placeholder="örn. VetoMaster_06" 
                    required 
                    type="text"
                  />
                </div>
              </div>
            )}

            {/*  Input: Şifre & Güvenlik Göstergesi  */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="password-field">Şifre</label>
                {authMode === 'signup' && (
                  <span className={`font-label-sm text-label-sm ${strength.colorClass}`} id="strength-label">{strength.label}</span>
                )}
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-space-md text-[18px] text-outline pointer-events-none">lock</span>
                <input 
                  className="w-full bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md pl-11 pr-24 py-3 rounded-lg focus:outline-none focus:bg-surface-container-high transition-colors tracking-wide" 
                  id="password-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••" 
                  required 
                  type={showPassword ? "text" : "password"}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {authMode === 'signup' && (
                    <button 
                      type="button"
                      onClick={generateStrongPassword}
                      aria-label="Güvenli Rastgele Şifre Oluştur"
                      title="Güvenli Rastgele Şifre Oluştur"
                      className="p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container-high transition-colors flex items-center justify-center cursor-pointer group"
                    >
                      <span className="material-symbols-outlined text-[19px] group-hover:rotate-180 transition-transform duration-300">vpn_key</span>
                    </button>
                  )}
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Şifreyi Gizle" : "Şifreyi Göster"}
                    title={showPassword ? "Şifreyi Gizle" : "Şifreyi Göster"}
                    className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors flex items-center justify-center cursor-pointer" 
                  >
                    <span className="material-symbols-outlined text-[19px]" id="eye-icon">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>
              {/*  Güvenlik Barı (Sadece Kayıt Modunda)  */}
              {authMode === 'signup' && (
                <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden mt-1 flex gap-1">
                  <div className={`h-full w-1/4 rounded-full transition-all duration-300 ${strength.score >= 1 ? (strength.score === 1 ? "bg-error" : strength.score === 2 ? "bg-tertiary" : "bg-primary") : "bg-surface-variant"}`} id="str-1"></div>
                  <div className={`h-full w-1/4 rounded-full transition-all duration-300 ${strength.score >= 2 ? (strength.score === 2 ? "bg-tertiary" : "bg-primary") : "bg-surface-variant"}`} id="str-2"></div>
                  <div className={`h-full w-1/4 rounded-full transition-all duration-300 ${strength.score >= 3 ? "bg-primary" : "bg-surface-variant"}`} id="str-3"></div>
                  <div className={`h-full w-1/4 rounded-full transition-all duration-300 ${strength.score >= 4 ? "bg-primary-container" : "bg-surface-variant"}`} id="str-4"></div>
                </div>
              )}
            </div>

            {/*  YASAL ZORUNLU ONAY KUTULARI (Sadece Kayıt Modunda)  */}
            {authMode === 'signup' && (
              <div className="flex flex-col gap-space-xs mt-space-2xs pt-space-xs">
                {/*  Onay Kutusu 1 (Zorunlu)  */}
                <label className="flex items-start gap-space-sm p-space-xs rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input 
                      checked={termsAccepted} 
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="peer sr-only" 
                      id="chk-terms" 
                      name="terms" 
                      required 
                      type="checkbox"
                    />
                    <div className="w-5 h-5 rounded bg-surface-container-low peer-checked:bg-primary-container flex items-center justify-center transition-colors">
                      <span className="material-symbols-outlined text-[16px] text-on-primary-container opacity-0 peer-checked:opacity-100 font-bold">check</span>
                    </div>
                  </div>
                  <div className="flex-1 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    <div className="flex items-center gap-space-xs mb-0.5">
                      <span className="bg-secondary-container text-on-secondary-container font-label-sm text-label-sm px-1.5 py-0.5 rounded-full">ZORUNLU</span>
                    </div>
                    <a className="text-primary hover:underline font-label-sm cursor-pointer" onClick={(e) => { e.preventDefault(); onNavigate?.("kullanici-sozlesmesi"); }} href="#">Kullanıcı Sözleşmesi</a> ve 
                    <a className="text-primary hover:underline font-label-sm cursor-pointer ml-1" onClick={(e) => { e.preventDefault(); onNavigate?.("kvkk"); }} href="#">KVKK Aydınlatma Metni</a>'ni okudum, şartları kabul ediyorum.
                  </div>
                </label>
                {/*  Onay Kutusu 2 (Zorunlu Yurtdışı Aktarım Rızası)  */}
                <label className="flex items-start gap-space-sm p-space-xs rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input 
                      checked={abConsentAccepted} 
                      onChange={(e) => setAbConsentAccepted(e.target.checked)}
                      className="peer sr-only" 
                      id="chk-consent" 
                      name="consent_ab" 
                      required 
                      type="checkbox"
                    />
                    <div className="w-5 h-5 rounded bg-surface-container-low peer-checked:bg-primary-container flex items-center justify-center transition-colors">
                      <span className="material-symbols-outlined text-[16px] text-on-primary-container opacity-0 peer-checked:opacity-100 font-bold">check</span>
                    </div>
                  </div>
                  <div className="flex-1 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    <div className="flex items-center gap-space-xs mb-0.5">
                      <span className="bg-secondary-container text-on-secondary-container font-label-sm text-label-sm px-1.5 py-0.5 rounded-full">KVKK RIZA</span>
                    </div>
                    Kişisel verilerimin güvenli sunucularda (<strong className="text-primary font-semibold">Supabase AB / Frankfurt</strong>) işlenmesine ve saklanmasına açık rıza veriyorum.
                  </div>
                </label>
                {/*  Onay Kutusu 3 (İsteğe Bağlı)  */}
                <label className="flex items-start gap-space-sm p-space-xs rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input 
                      checked={marketingAccepted} 
                      onChange={(e) => setMarketingAccepted(e.target.checked)}
                      className="peer sr-only" 
                      id="chk-marketing" 
                      name="marketing" 
                      type="checkbox"
                    />
                    <div className="w-5 h-5 rounded bg-surface-container-low peer-checked:bg-primary-container flex items-center justify-center transition-colors">
                      <span className="material-symbols-outlined text-[16px] text-on-primary-container opacity-0 peer-checked:opacity-100 font-bold">check</span>
                    </div>
                  </div>
                  <div className="flex-1 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    Turnuva duyuruları ve haftalık liderlik ödülleri hakkında e-posta bildirimleri almak istiyorum. <span className="text-outline text-label-sm">(İsteğe bağlı)</span>
                  </div>
                </label>
              </div>
            )}

            {/*  Büyük Amber Buton  */}
            <button 
              className="w-full bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-headline-sm text-headline-sm py-3.5 px-space-xl rounded-full shadow-[0px_4px_20px_rgba(241,112,14,0.35)] transition-all flex items-center justify-center gap-space-xs active:scale-[0.99] font-bold mt-space-2xs disabled:opacity-50 cursor-pointer" 
              type="submit"
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? (authMode === 'signup' ? 'Kayıt Yapılıyor...' : 'Giriş Yapılıyor...') : (authMode === 'signup' ? 'Kayıt Ol ve Arenaya Gir' : 'Giriş Yap ve Arenaya Gir')}</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>

            {/*  Divider  */}
            <div className="flex items-center gap-space-md my-space-2xs">
              <div className="h-px bg-surface-variant flex-1"></div>
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">veya</span>
              <div className="h-px bg-surface-variant flex-1"></div>
            </div>

            {/*  Sosyal Giriş Butonları  */}
            <div className="grid grid-cols-2 gap-space-sm">
              <button 
                onClick={async () => {
                  try {
                    await signInWithOAuth('google');
                  } catch (e: any) {
                    setFeedback({ type: 'error', message: 'Google ile giriş başlatılamadı: ' + e.message });
                  }
                }}
                className="flex items-center justify-center gap-space-xs py-2.5 px-space-md rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface transition-colors font-label-md text-label-md cursor-pointer" 
                type="button"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z"></path>
                </svg>
                <span>Google</span>
              </button>
              <button 
                onClick={async () => {
                  try {
                    await signInWithOAuth('discord');
                  } catch (e: any) {
                    setFeedback({ type: 'error', message: 'Discord ile giriş başlatılamadı: ' + e.message });
                  }
                }}
                className="flex items-center justify-center gap-space-xs py-2.5 px-space-md rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface transition-colors font-label-md text-label-md cursor-pointer" 
                type="button"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"></path>
                </svg>
                <span>Discord</span>
              </button>
            </div>

            {/*  Zaten hesabın var mı? / Hesabın yok mu?  */}
            <div className="text-center font-body-sm text-body-sm text-on-surface-variant mt-space-2xs">
              {authMode === 'signup' ? (
                <>
                  Zaten bir hesabın var mı?{' '}
                  <button 
                    type="button" 
                    onClick={() => { setAuthMode('signin'); setFeedback(null); }}
                    className="font-label-md text-label-md text-primary hover:underline ml-1 cursor-pointer font-semibold"
                  >
                    Giriş Yap
                  </button>
                </>
              ) : (
                <>
                  Henüz hesabın yok mu?{' '}
                  <button 
                    type="button" 
                    onClick={() => { setAuthMode('signup'); setFeedback(null); }}
                    className="font-label-md text-label-md text-primary hover:underline ml-1 cursor-pointer font-semibold"
                  >
                    Kayıt Ol
                  </button>
                </>
              )}
            </div>
          </form>
</div>
</div>

{/*  2. EKRANIN ALT KISMINDA (Sticky / Sabit): İLK GİRİŞ ÇEREZ BİLDİRİM BANDI  */}
<aside className={`fixed bottom-0 left-0 w-full z-40 bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_-8px_32px_rgba(0,0,0,0.6)] px-margin-mobile md:px-margin py-space-md transition-all duration-500 transform ${showCookieBanner ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`} id="cookie-banner">
<div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-space-md">
{/*  Cookie Notice Text & Icon  */}
<div className="flex items-start md:items-center gap-space-md flex-1">
<div className="w-10 h-10 rounded-full bg-secondary-container/60 flex-shrink-0 flex items-center justify-center text-primary text-xl">
          🍪
        </div>
<div className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
<strong className="text-on-surface font-title-md text-title-md mr-1">Çerez &amp; Depolama Bildirimi:</strong>
          Duel Arena, yalnızca güvenli oturum yönetimi (Supabase Auth) ve oyun tercihleriniz için zorunlu teknik çerezler kullanır. Pazarlama veya takip çerezi kullanmıyoruz. Detaylar için 
          <a className="underline text-primary hover:text-on-surface transition-colors font-label-md cursor-pointer ml-1" onClick={(e) => { e.preventDefault(); onNavigate?.('cerez-politikasi'); }} href="#">Çerez Politikası</a>'nı inceleyebilirsiniz.
        </div>
</div>
{/*  Action Buttons  */}
<div className="flex items-center gap-space-sm w-full lg:w-auto justify-end flex-shrink-0">
<button onClick={() => onNavigate?.('cerez-politikasi')} className="flex-1 lg:flex-none font-label-md text-label-md px-space-md py-2.5 rounded-full bg-surface-container-high hover:bg-surface-variant text-on-surface transition-colors text-center cursor-pointer" type="button">
          Ayarları Yönet
        </button>
<button onClick={() => setShowCookieBanner(false)} className="flex-1 lg:flex-none font-label-md text-label-md px-space-lg py-2.5 rounded-full bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary transition-all shadow-[0px_2px_12px_rgba(241,112,14,0.3)] text-center font-bold cursor-pointer" type="button">
          Zorunlu Çerezleri Kabul Et
        </button>
</div>
</div>
</aside>
</main>
  );
};

export default KayitVeCerezBildirimiScreen;
