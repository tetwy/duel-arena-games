import React from 'react';

export interface ProfileAvatarDef {
  id: string;
  name: string;
  title: string;
  tag: string;
  color: string;
  glow: string;
  image: string;
}

export const PROFILE_AVATARS: ProfileAvatarDef[] = [
  {
    id: 'runner',
    name: 'Gölge Koşucu',
    title: 'Hız Arenası Rekortmeni',
    tag: 'KİNETİK',
    color: '#00f0ff',
    glow: 'rgba(0, 240, 255, 0.45)',
    image: '/avatars/runner.jpg',
  },
  {
    id: 'ronin',
    name: 'Harf Ronini',
    title: 'Söz Kılıcı Ustası',
    tag: 'SAMURAY',
    color: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.45)',
    image: '/avatars/ronin.jpg',
  },
  {
    id: 'mask',
    name: 'Yasak Muhafızı',
    title: 'Veto Şampiyonu',
    tag: 'GÖLGE',
    color: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.45)',
    image: '/avatars/mask.jpg',
  },
  {
    id: 'kunoichi',
    name: 'Rüzgar Gölgesi',
    title: 'Hızlı Kalem Suikastçisi',
    tag: 'ŞİNOBİ',
    color: '#22d3ee',
    glow: 'rgba(34, 211, 238, 0.45)',
    image: '/avatars/kunoichi.jpg',
  },
  {
    id: 'monk',
    name: 'Söz Bilgesi',
    title: 'Kadim Kelime Rahibi',
    tag: 'BİLGE',
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.45)',
    image: '/avatars/monk.jpg',
  },
  {
    id: 'oni',
    name: 'Siber Oni',
    title: 'Kelime Fırtınası Devi',
    tag: 'İBLİS',
    color: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.45)',
    image: '/avatars/oni.jpg',
  },
  {
    id: 'falcon',
    name: 'Gök Şahini',
    title: 'Keskin Harf Gözcüsü',
    tag: 'AVCI',
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.45)',
    image: '/avatars/falcon.jpg',
  },
  {
    id: 'shogun',
    name: 'Altın Şogun',
    title: 'Arena Başyargıcı',
    tag: 'LİDER',
    color: '#eab308',
    glow: 'rgba(234, 179, 8, 0.45)',
    image: '/avatars/shogun.jpg',
  },
];

export const DEFAULT_AVATAR_ID = 'runner';

interface PlayerAvatarProps {
  avatar: string;
  size?: number;
  className?: string;
  showGlow?: boolean;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  avatar,
  size = 48,
  className = '',
  showGlow = false,
}) => {
  const profile = PROFILE_AVATARS.find((p) => p.id === avatar) || PROFILE_AVATARS[0];

  const renderIcon = () => {
    switch (profile.id) {
      case 'runner':
        return (
          <g>
            <circle cx="50" cy="50" r="44" fill="#070c14" stroke="#00f0ff" strokeWidth="2" strokeOpacity="0.4" />
            <path d="M 18 36 L 36 28 L 28 44 L 42 40 L 22 68 L 28 50 L 14 54 Z" fill="#00f0ff" fillOpacity="0.85" />
            <path d="M 40 22 C 58 20 74 30 76 46 C 78 62 68 76 52 78 C 42 78 34 72 32 64 C 38 66 50 64 56 58 C 64 50 64 36 50 30 C 44 28 38 28 40 22 Z" fill="#020408" stroke="#00f0ff" strokeWidth="2.5" />
            <path d="M 48 38 L 74 42 L 62 48 L 44 43 Z" fill="#00f0ff" />
            <circle cx="68" cy="43" r="2.5" fill="#ffffff" />
            <path d="M 68 20 L 76 28 L 70 30 L 82 40" stroke="#facc15" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>
        );

      case 'ronin':
        return (
          <g>
            <circle cx="50" cy="50" r="44" fill="#070c14" stroke="#38bdf8" strokeWidth="2" strokeOpacity="0.4" />
            <line x1="20" y1="20" x2="80" y2="80" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            <line x1="80" y1="20" x2="20" y2="80" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
            <polygon points="50,22 84,48 16,48" fill="#03060a" stroke="#38bdf8" strokeWidth="2.5" />
            <line x1="28" y1="48" x2="72" y2="48" stroke="#38bdf8" strokeWidth="1.5" />
            <path d="M 32 48 L 68 48 L 62 76 L 50 82 L 38 76 Z" fill="#03060a" stroke="#38bdf8" strokeWidth="2" />
            <rect x="40" y="54" width="20" height="4" rx="2" fill="#00f0ff" />
            <circle cx="45" cy="56" r="1.5" fill="#ffffff" />
            <circle cx="55" cy="56" r="1.5" fill="#ffffff" />
          </g>
        );

      case 'mask':
        return (
          <g>
            <circle cx="50" cy="50" r="44" fill="#070c14" stroke="#fbbf24" strokeWidth="2" strokeOpacity="0.4" />
            <path d="M 32 30 C 26 14 18 16 16 8 C 26 14 36 24 38 32 Z" fill="#fbbf24" />
            <path d="M 68 30 C 74 14 82 16 84 8 C 74 14 64 24 62 32 Z" fill="#fbbf24" />
            <path d="M 28 32 C 28 24 72 24 72 32 C 76 56 72 74 50 82 C 28 74 24 56 28 32 Z" fill="#0b0f19" stroke="#fbbf24" strokeWidth="2.5" />
            <ellipse cx="38" cy="48" rx="5" ry="3" fill="#020408" stroke="#fbbf24" strokeWidth="1.5" />
            <ellipse cx="62" cy="48" rx="5" ry="3" fill="#020408" stroke="#fbbf24" strokeWidth="1.5" />
            <circle cx="38" cy="48" r="1.5" fill="#fbbf24" />
            <circle cx="62" cy="48" r="1.5" fill="#fbbf24" />
            <path d="M 40 64 Q 50 72 60 64" stroke="#fbbf24" strokeWidth="2" fill="none" strokeLinecap="round" />
            <line x1="50" y1="36" x2="50" y2="54" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
          </g>
        );

      case 'kunoichi':
        return (
          <g>
            <circle cx="50" cy="50" r="44" fill="#070c14" stroke="#22d3ee" strokeWidth="2" strokeOpacity="0.4" />
            <path d="M 30 24 C 40 18 60 18 70 24 C 74 34 76 50 70 70 C 66 60 60 54 50 54 C 40 54 34 60 30 70 C 24 50 26 34 30 24 Z" fill="#020408" stroke="#22d3ee" strokeWidth="2" />
            <rect x="28" y="44" width="44" height="28" rx="6" fill="#080e18" stroke="#22d3ee" strokeWidth="2" />
            <ellipse cx="40" cy="38" rx="4" ry="2.5" fill="#22d3ee" />
            <ellipse cx="60" cy="38" rx="4" ry="2.5" fill="#22d3ee" />
            <circle cx="41" cy="38" r="1" fill="#ffffff" />
            <circle cx="61" cy="38" r="1" fill="#ffffff" />
            <circle cx="50" cy="24" r="3" fill="#f43f5e" />
          </g>
        );

      case 'monk':
        return (
          <g>
            <circle cx="50" cy="50" r="44" fill="#070c14" stroke="#f59e0b" strokeWidth="2" strokeOpacity="0.4" />
            <circle cx="50" cy="50" r="40" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 4" fill="none" opacity="0.6" />
            <circle cx="50" cy="46" r="22" fill="#04060a" stroke="#f59e0b" strokeWidth="2" />
            <circle cx="50" cy="32" r="2.5" fill="#f59e0b" />
            <path d="M 40 44 Q 44 48 48 44" stroke="#f59e0b" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 52 44 Q 56 48 60 44" stroke="#f59e0b" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 46 54 Q 50 56 54 54" stroke="#f59e0b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M 28 72 C 34 64 66 64 72 72 L 72 82 L 28 82 Z" fill="#090d16" stroke="#f59e0b" strokeWidth="2" />
          </g>
        );

      case 'oni':
        return (
          <g>
            <circle cx="50" cy="50" r="44" fill="#0c0406" stroke="#ef4444" strokeWidth="2" strokeOpacity="0.4" />
            <path d="M 28 34 L 16 14 L 34 24 Z" fill="#ef4444" />
            <path d="M 72 34 L 84 14 L 66 24 Z" fill="#ef4444" />
            <path d="M 26 30 C 30 20 70 20 74 30 C 80 50 78 72 50 82 C 22 72 20 50 26 30 Z" fill="#180408" stroke="#ef4444" strokeWidth="2.5" />
            <polygon points="36,44 46,46 42,50 34,48" fill="#facc15" />
            <polygon points="64,44 54,46 58,50 66,48" fill="#facc15" />
            <circle cx="40" cy="46" r="1.5" fill="#ffffff" />
            <circle cx="60" cy="46" r="1.5" fill="#ffffff" />
            <path d="M 38 62 L 42 56 L 46 62 L 50 56 L 54 62 L 58 56 L 62 62" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinejoin="round" />
          </g>
        );

      case 'falcon':
        return (
          <g>
            <circle cx="50" cy="50" r="44" fill="#040c08" stroke="#10b981" strokeWidth="2" strokeOpacity="0.4" />
            <path d="M 26 36 L 50 18 L 74 36 L 68 64 L 50 78 L 32 64 Z" fill="#020a06" stroke="#10b981" strokeWidth="2.5" />
            <polygon points="50,44 60,56 50,68 40,56" fill="#061f12" stroke="#10b981" strokeWidth="2" />
            <line x1="32" y1="42" x2="44" y2="46" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="68" y1="42" x2="56" y2="46" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="38" cy="48" r="2" fill="#34d399" />
            <circle cx="62" cy="48" r="2" fill="#34d399" />
          </g>
        );

      case 'shogun':
      default:
        return (
          <g>
            <circle cx="50" cy="50" r="44" fill="#0a0802" stroke="#eab308" strokeWidth="2" strokeOpacity="0.4" />
            <path d="M 50 12 L 56 26 L 72 26 L 60 36 L 66 50 L 50 40 L 34 50 L 40 36 L 28 26 L 44 26 Z" fill="#eab308" opacity="0.8" />
            <rect x="26" y="38" width="48" height="34" rx="4" fill="#080602" stroke="#eab308" strokeWidth="2.5" />
            <line x1="26" y1="52" x2="74" y2="52" stroke="#eab308" strokeWidth="1.5" />
            <line x1="50" y1="38" x2="50" y2="72" stroke="#eab308" strokeWidth="1.5" />
            <circle cx="38" cy="46" r="3" fill="#eab308" />
            <circle cx="62" cy="46" r="3" fill="#eab308" />
            <circle cx="38" cy="62" r="3" fill="#eab308" />
            <circle cx="62" cy="62" r="3" fill="#eab308" />
          </g>
        );
    }
  };

  const [hasError, setHasError] = React.useState(false);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-2xl overflow-hidden select-none transition-transform bg-[#050811] ${className}`}
      style={{
        width: size,
        height: size,
        boxShadow: showGlow ? `0 0 16px ${profile.glow}` : undefined,
        border: `1.5px solid ${profile.color}50`,
      }}
    >
      {!hasError && profile.image ? (
        <img
          src={profile.image}
          alt={profile.name}
          className="w-full h-full object-cover object-center pointer-events-none"
          onError={() => setHasError(true)}
          loading="lazy"
        />
      ) : (
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-md"
        >
          {renderIcon()}
        </svg>
      )}
    </div>
  );
};

export default PlayerAvatar;
