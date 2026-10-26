import React from 'react';

/**
 * ARENA Platform Logosu - Vektörel & Keskin Tasarım
 */
export const PlatformLogo: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="logo-grad-1" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="50%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#d946ef" />
      </linearGradient>
      <linearGradient id="logo-glow" x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#a855f7" stopOpacity="0.2" />
      </linearGradient>
    </defs>
    {/* Dış Çerçeve Hexagon */}
    <path
      d="M24 3L42 13.5V34.5L24 45L6 34.5V13.5L24 3Z"
      stroke="url(#logo-grad-1)"
      strokeWidth="2.5"
      strokeLinejoin="round"
      fill="#0c0e17"
    />
    {/* İç Geometrik Duel / Oyun Prizması */}
    <path
      d="M24 10L36 17.5V30.5L24 38L12 30.5V17.5L24 10Z"
      fill="url(#logo-glow)"
      stroke="rgba(255,255,255,0.2)"
      strokeWidth="1"
    />
    {/* Merkez İkon (İki kılıç / Play üçgeni kesişimi) */}
    <path
      d="M20 18L30 24L20 30V18Z"
      fill="#ffffff"
    />
  </svg>
);

/**
 * VETO Oyunu Vektörel Çizimi:
 * Modern cam/neon tabu kartları, yasaklı kelime çaprazı (✕), siber-noir kart masası.
 */
export const VetoArtwork: React.FC<{ isHovered?: boolean }> = ({ isHovered = false }) => (
  <div className="relative w-full h-full flex items-center justify-center overflow-hidden pointer-events-none select-none">
    {/* Arka Plan Ortam Işığı */}
    <div
      className="absolute w-[340px] h-[340px] rounded-full blur-[100px] transition-all duration-700 pointer-events-none"
      style={{
        backgroundColor: '#d946ef',
        opacity: isHovered ? 0.35 : 0.15,
        transform: isHovered ? 'scale(1.15)' : 'scale(1.0)',
      }}
    />

    {/* SVG Vektör Kompozisyonu */}
    <svg
      viewBox="0 0 400 480"
      className="w-full max-w-[340px] max-h-[380px] drop-shadow-2xl transition-transform duration-700 ease-out"
      style={{
        transform: isHovered ? 'translateY(-10px) scale(1.04)' : 'translateY(0) scale(1)',
      }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="card-grad-left" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2e1065" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="card-grad-center" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4c1d95" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="neon-pink" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#d946ef" />
        </linearGradient>
        <filter id="veto-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Arka plan radar / ızgara çizgileri */}
      <circle cx="200" cy="240" r="160" stroke="rgba(217, 70, 239, 0.12)" strokeDasharray="4 6" strokeWidth="1" />
      <circle cx="200" cy="240" r="110" stroke="rgba(217, 70, 239, 0.18)" strokeWidth="1" />
      <line x1="200" y1="60" x2="200" y2="420" stroke="rgba(217, 70, 239, 0.08)" strokeDasharray="3 3" />
      <line x1="40" y1="240" x2="360" y2="240" stroke="rgba(217, 70, 239, 0.08)" strokeDasharray="3 3" />

      {/* 1. Sol Kart (Açılı) */}
      <g transform="translate(100, 230) rotate(-14) translate(-80, -120)">
        <rect
          x="0"
          y="0"
          width="160"
          height="230"
          rx="14"
          fill="url(#card-grad-left)"
          stroke="rgba(192, 132, 252, 0.3)"
          strokeWidth="1.5"
        />
        <rect x="14" y="20" width="132" height="18" rx="4" fill="rgba(255,255,255,0.08)" />
        <rect x="14" y="55" width="132" height="8" rx="2" fill="rgba(255,255,255,0.04)" />
        <rect x="14" y="75" width="132" height="8" rx="2" fill="rgba(255,255,255,0.04)" />
        <rect x="14" y="95" width="132" height="8" rx="2" fill="rgba(255,255,255,0.04)" />
      </g>

      {/* 2. Sağ Kart (Açılı) */}
      <g transform="translate(300, 230) rotate(14) translate(-80, -120)">
        <rect
          x="0"
          y="0"
          width="160"
          height="230"
          rx="14"
          fill="url(#card-grad-left)"
          stroke="rgba(192, 132, 252, 0.3)"
          strokeWidth="1.5"
        />
        <rect x="14" y="20" width="132" height="18" rx="4" fill="rgba(255,255,255,0.08)" />
        <rect x="14" y="55" width="132" height="8" rx="2" fill="rgba(255,255,255,0.04)" />
        <rect x="14" y="75" width="132" height="8" rx="2" fill="rgba(255,255,255,0.04)" />
      </g>

      {/* 3. Ana Merkez Kart (Önde ve Dikey) */}
      <g transform="translate(200, 240) translate(-90, -135)">
        <rect
          x="0"
          y="0"
          width="180"
          height="260"
          rx="16"
          fill="url(#card-grad-center)"
          stroke={isHovered ? '#d946ef' : 'rgba(217, 70, 239, 0.6)'}
          strokeWidth={isHovered ? '2.5' : '1.5'}
        />

        {/* Hedef Kelime Başlık Alanı */}
        <rect x="16" y="20" width="148" height="36" rx="8" fill="#6366f1" />
        <rect x="36" y="32" width="108" height="12" rx="4" fill="#ffffff" fillOpacity="0.9" />

        {/* Yasaklı Kelimeler Çizgileri */}
        <rect x="16" y="76" width="148" height="26" rx="6" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.06)" />
        <rect x="30" y="85" width="120" height="8" rx="3" fill="#f43f5e" fillOpacity="0.75" />

        <rect x="16" y="112" width="148" height="26" rx="6" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.06)" />
        <rect x="30" y="121" width="90" height="8" rx="3" fill="#e2e8f0" fillOpacity="0.5" />

        <rect x="16" y="148" width="148" height="26" rx="6" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.06)" />
        <rect x="30" y="157" width="105" height="8" rx="3" fill="#e2e8f0" fillOpacity="0.5" />

        <rect x="16" y="184" width="148" height="26" rx="6" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.06)" />
        <rect x="30" y="193" width="75" height="8" rx="3" fill="#e2e8f0" fillOpacity="0.5" />

        {/* Alt Pas / Puan İndikatörü */}
        <circle cx="32" cy="235" r="7" fill="#22c55e" />
        <circle cx="56" cy="235" r="7" fill="#eab308" />
        <circle cx="80" cy="235" r="7" fill="#ef4444" />
      </g>

      {/* YASAKLI İŞARETİ (Glow ✕ Rozeti) */}
      <g transform="translate(200, 370)" filter="url(#veto-glow)">
        <circle cx="0" cy="0" r="28" fill="#0f172a" stroke="#d946ef" strokeWidth="2.5" />
        <path
          d="M-10 -10L10 10M10 -10L-10 10"
          stroke="#f43f5e"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>
    </svg>
  </div>
);

/**
 * HARFBAZ Oyunu Vektörel Çizimi:
 * Hızlı kelime yarışı, 3D izometrik harf blokları, şimşekler ve hız göstergesi halkası.
 */
export const HarfbazArtwork: React.FC<{ isHovered?: boolean }> = ({ isHovered = false }) => (
  <div className="relative w-full h-full flex items-center justify-center overflow-hidden pointer-events-none select-none">
    {/* Arka Plan Ortam Işığı */}
    <div
      className="absolute w-[340px] h-[340px] rounded-full blur-[100px] transition-all duration-700 pointer-events-none"
      style={{
        backgroundColor: '#06b6d4',
        opacity: isHovered ? 0.35 : 0.15,
        transform: isHovered ? 'scale(1.15)' : 'scale(1.0)',
      }}
    />

    {/* SVG Vektör Kompozisyonu */}
    <svg
      viewBox="0 0 400 480"
      className="w-full max-w-[340px] max-h-[380px] drop-shadow-2xl transition-transform duration-700 ease-out"
      style={{
        transform: isHovered ? 'translateY(-10px) scale(1.04)' : 'translateY(0) scale(1)',
      }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="harf-cube-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0891b2" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="harf-cube-side1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0e7490" />
          <stop offset="100%" stopColor="#155e75" />
        </linearGradient>
        <linearGradient id="harf-cube-side2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#164e63" />
          <stop offset="100%" stopColor="#083344" />
        </linearGradient>
        <filter id="harfbaz-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Dönen Şimşek / Hız Halka Yörüngeleri */}
      <ellipse cx="200" cy="240" rx="160" ry="110" stroke="rgba(6, 182, 212, 0.2)" strokeWidth="1.5" strokeDasharray="6 8" />
      <ellipse cx="200" cy="240" rx="120" ry="75" stroke="rgba(6, 182, 212, 0.3)" strokeWidth="1" />

      {/* Şimşek Kıvılcımları */}
      <path
        d="M90 180L125 210L110 215L150 250"
        stroke="#38bdf8"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#harfbaz-glow)"
      />
      <path
        d="M290 270L265 295L275 300L240 335"
        stroke="#38bdf8"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#harfbaz-glow)"
      />

      {/* 1. Küçük Sol Harf Küpü ('B') */}
      <g transform="translate(80, 270)">
        <polygon points="40,0 80,20 40,40 0,20" fill="url(#harf-cube-top)" stroke="rgba(255,255,255,0.3)" />
        <polygon points="0,20 40,40 40,80 0,60" fill="url(#harf-cube-side1)" />
        <polygon points="40,40 80,20 80,60 40,80" fill="url(#harf-cube-side2)" />
        <text x="40" y="27" fill="#ffffff" fontSize="18" fontWeight="900" textAnchor="middle" fontFamily="'Space Grotesk', sans-serif">
          B
        </text>
      </g>

      {/* 2. Küçük Sağ Harf Küpü ('Z') */}
      <g transform="translate(240, 130)">
        <polygon points="40,0 80,20 40,40 0,20" fill="url(#harf-cube-top)" stroke="rgba(255,255,255,0.3)" />
        <polygon points="0,20 40,40 40,80 0,60" fill="url(#harf-cube-side1)" />
        <polygon points="40,40 80,20 80,60 40,80" fill="url(#harf-cube-side2)" />
        <text x="40" y="27" fill="#ffffff" fontSize="18" fontWeight="900" textAnchor="middle" fontFamily="'Space Grotesk', sans-serif">
          Z
        </text>
      </g>

      {/* 3. Büyük Merkez Harf Küpü ('A' - Aktif Harf) */}
      <g transform="translate(140, 180)">
        {/* Üst Yüzey */}
        <polygon
          points="60,0 120,30 60,60 0,30"
          fill="url(#harf-cube-top)"
          stroke={isHovered ? '#67e8f9' : 'rgba(255,255,255,0.5)'}
          strokeWidth="2"
        />
        {/* Sol Yüzey */}
        <polygon points="0,30 60,60 60,130 0,100" fill="url(#harf-cube-side1)" stroke="rgba(6, 182, 212, 0.4)" />
        {/* Sağ Yüzey */}
        <polygon points="60,60 120,30 120,100 60,130" fill="url(#harf-cube-side2)" stroke="rgba(6, 182, 212, 0.4)" />

        {/* Küp Üstündeki Büyük Parlayan 'A' Harfi */}
        <text
          x="60"
          y="42"
          fill="#ffffff"
          fontSize="36"
          fontWeight="900"
          textAnchor="middle"
          fontFamily="'Space Grotesk', sans-serif"
          filter="url(#harfbaz-glow)"
        >
          A
        </text>
      </g>

      {/* Alt Hız Rozeti / STOP Butonu İllüstrasyonu */}
      <g transform="translate(200, 365)" filter="url(#harfbaz-glow)">
        <rect x="-60" y="-18" width="120" height="36" rx="10" fill="#0c1222" stroke="#06b6d4" strokeWidth="2" />
        <circle cx="-38" cy="0" r="5" fill="#38bdf8" />
        <text x="5" y="6" fill="#38bdf8" fontSize="14" fontWeight="800" textAnchor="middle" letterSpacing="2" fontFamily="'Space Grotesk', sans-serif">
          STOP!
        </text>
      </g>
    </svg>
  </div>
);
