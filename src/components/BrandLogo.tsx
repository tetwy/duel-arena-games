import React from 'react';

interface BrandLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

/**
 * ARENA Platform Logosu
 * macOS tarzı 3D parlak squircle amblem ve minimalist delta apeksi.
 * Her türlü oyun sayısından bağımsız, zamansız marka kimliği.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 28, showText = true, className = '' }) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* 3D Parlak Squircle İkon */}
      <div
        className="relative rounded-[8px] overflow-hidden shadow-md flex items-center justify-center shrink-0 bg-gradient-to-b from-[#2563eb] via-[#1d4ed8] to-[#1e40af] border border-white/20 transition-transform duration-300 hover:scale-105"
        style={{ width: size, height: size }}
      >
        {/* Üst Cam Parlama Efekti */}
        <div className="absolute top-0 left-0 right-0 h-[42%] bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

        {/* Minimalist Beyaz "Arena Delta" Amblemi */}
        <svg
          width={Math.round(size * 0.55)}
          height={Math.round(size * 0.55)}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 3L21 20H16.5L12 11.5L7.5 20H3L12 3Z"
            fill="#ffffff"
          />
          <circle cx="12" cy="16.5" r="1.8" fill="#ffffff" />
        </svg>
      </div>

      {showText && (
        <span className="text-[15px] font-bold text-white tracking-tight font-sans">
          Arena
        </span>
      )}
    </div>
  );
};
