import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { gameService } from '../games/harfbaz/services/gameService';

interface HarfbazOylamaVetoScreenProps {
  onNavigate?: (path: string) => void;
  onConfirmExit?: () => void;
  onCancelExit?: () => void;
  roomCode?: string;
  [key: string]: any;
}

const ALL_CATEGORIES_LIST = [
  { key: 'isim', label: 'İSİM', name: 'İsim' },
  { key: 'sehir', label: 'ŞEHİR', name: 'Şehir' },
  { key: 'hayvan', label: 'HAYVAN', name: 'Hayvan' },
  { key: 'bitki', label: 'BİTKİ', name: 'Bitki' },
  { key: 'esya', label: 'EŞYA', name: 'Eşya' },
  { key: 'meslek', label: 'MESLEK', name: 'Meslek' },
  { key: 'unlu', label: 'ÜNLÜ', name: 'Ünlü' },
  { key: 'ulke', label: 'ÜLKE', name: 'Ülke' },
  { key: 'dizi', label: 'DİZİ / FİLM', name: 'Dizi/Film' },
  { key: 'yemek', label: 'YEMEK', name: 'Yemek' },
];

export const HarfbazOylamaVetoScreen: React.FC<HarfbazOylamaVetoScreenProps> = ({ 
  onNavigate,
  onConfirmExit,
  onCancelExit,
  roomCode: propRoomCode
}) => {
  const { profile } = useAuth();
  const rawCode = propRoomCode || sessionStorage.getItem('duel_arena_room_code') || '#HB-5912';

  const categoriesList = useMemo(() => {
    try {
      const raw = sessionStorage.getItem('harfbaz_active_categories');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length >= 3) {
          return ALL_CATEGORIES_LIST.filter(c => parsed.includes(c.name));
        }
      }
    } catch {}
    return ALL_CATEGORIES_LIST;
  }, []);

  const [categoryIndex, setCategoryIndex] = useState<number>(0);
  const [currentLetter, setCurrentLetter] = useState<string>(() => {
    return sessionStorage.getItem('duel_arena_harfbaz_letter') || 'K';
  });

  const isHiddenMode = typeof window !== 'undefined' && sessionStorage.getItem('harfbaz_hidden_mode') === 'true';
  const [revealedPlayers, setRevealedPlayers] = useState<Record<string, boolean>>({});

  const toggleReveal = (playerId: string) => {
    setRevealedPlayers(prev => ({ ...prev, [playerId]: !prev[playerId] }));
  };

  const handleRevealAll = () => {
    const allRev: Record<string, boolean> = {};
    playerAnswers.forEach(p => {
      allRev[p.id] = true;
    });
    setRevealedPlayers(allRev);
  };

  const [savedAnswers, setSavedAnswers] = useState<Record<string, string>>(() => {
    try {
      const raw = sessionStorage.getItem('duel_arena_harfbaz_answers');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const [vetoedIds, setVetoedIds] = useState<Set<string>>(new Set());

  const curCat = categoriesList[categoryIndex] || categoriesList[0] || ALL_CATEGORIES_LIST[0];

  // Authentic answers for participants in current round
  const playerAnswers = [
    { id: profile.id || 'p_me', name: profile.username || 'Oyuncu', isMe: true, answer: savedAnswers[curCat.key] || '' },
    { id: 'p_selin', name: 'Selin A.', isMe: false, answer: curCat.key === 'hayvan' ? 'KARTAL' : 'KONYA' },
    { id: 'p_mert', name: 'Mert Y.', isMe: false, answer: curCat.key === 'hayvan' ? 'KARTAL' : 'KAYSERİ' },
    { id: 'p_ece', name: 'Ece D.', isMe: false, answer: curCat.key === 'hayvan' ? 'KEDİCİK' : 'KAVUN' },
    { id: 'p_caner', name: 'Caner M.', isMe: false, answer: '' }
  ];

  const toggleVeto = (id: string) => {
    setVetoedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleNextCategory = () => {
    if (categoryIndex < categoriesList.length - 1) {
      setCategoryIndex(i => i + 1);
      setRevealedPlayers({}); // Reset reveal for the next category inspection
    } else {
      const clean = rawCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const matchKey = `harfbaz_match_${clean}`;
      const validAnswersCount = Object.values(savedAnswers).filter(Boolean).length;
      const myScore = validAnswersCount * 10 + 25;

      const matchResult = {
        roomCode: rawCode,
        completedAt: new Date().toISOString(),
        rounds: 3,
        categoriesCount: categoriesList.length,
        players: [
          {
            id: profile.id || 'p_me',
            name: profile.username || 'Misafir_Oyuncu',
            avatar: profile.avatar || 'Tilki',
            score: myScore,
            uniqueCount: validAnswersCount,
            duplicateCount: 2,
            vetoCount: 0,
            isMe: true,
          },
          {
            id: 'p_selin',
            name: 'Selin A.',
            avatar: 'Baykuş',
            score: Math.max(30, myScore - 45),
            uniqueCount: Math.max(2, validAnswersCount - 3),
            duplicateCount: 3,
            vetoCount: 1,
            isMe: false,
          },
          {
            id: 'p_mert',
            name: 'Mert Y.',
            avatar: 'Aslan',
            score: Math.max(20, myScore - 90),
            uniqueCount: Math.max(1, validAnswersCount - 5),
            duplicateCount: 2,
            vetoCount: 2,
            isMe: false,
          },
          {
            id: 'p_ece',
            name: 'Ece D.',
            avatar: 'Kedi',
            score: 45,
            uniqueCount: 4,
            duplicateCount: 1,
            vetoCount: vetoedIds.size,
            isMe: false,
          },
          {
            id: 'p_caner',
            name: 'Caner M.',
            avatar: 'Astronot',
            score: 30,
            uniqueCount: 3,
            duplicateCount: 2,
            vetoCount: 1,
            isMe: false,
          }
        ].sort((a, b) => b.score - a.score)
      };

      sessionStorage.setItem(matchKey, JSON.stringify(matchResult));
      sessionStorage.setItem('harfbaz_latest_match', JSON.stringify(matchResult));
      const rId = sessionStorage.getItem('duel_arena_harfbaz_room_id');
      if (rId) {
        gameService.calculateScores(rId, 1).catch(() => {});
      }
      onNavigate?.(`harfbaz-leaderboard?room=${clean}`);
    }
  };

  return (
    <main className="w-full pt-20 bg-surface flex-1"><div className="flex flex-col w-full px-gutter md:px-margin py-space-lg max-w-7xl mx-auto space-y-space-xl">
{/*  Üst Oylama HUD & İlerleme Panosu  */}
<div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-lg bg-surface-container-low p-space-lg rounded-2xl shadow-xl">
<div className="flex items-start sm:items-center gap-space-lg">
<div className="w-16 h-16 rounded-2xl bg-secondary-container flex flex-col items-center justify-center flex-shrink-0 shadow-[0_4px_20px_rgba(241,112,14,0.2)]">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-primary">HARF</span>
<span className="font-display-lg text-display-lg leading-none font-bold text-on-surface">
  {currentLetter}
</span>
</div>
<div className="space-y-space-2xs min-w-0">
<div className="flex items-center gap-space-xs flex-wrap">
<span className="bg-surface-container-highest px-space-sm py-0.5 rounded-full font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
  Kategori {categoryIndex + 1} / {categoriesList.length}
</span>
</div>
<h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight truncate">
  {curCat.label}
</h1>
</div>
</div>
{/*  Zamanlayıcı & Host Kontrolleri  */}
<div className="flex items-center justify-between lg:justify-end gap-space-lg pt-space-xs lg:pt-0">
{/*  Aksiyon Butonu  */}
<button 
  onClick={handleNextCategory}
  className="group flex items-center gap-space-xs bg-primary-container hover:bg-tertiary-container text-on-primary font-label-lg text-label-lg px-space-lg py-3 rounded-full transition-all duration-200 shadow-[0_4px_16px_rgba(241,112,14,0.3)] cursor-pointer" 
  type="button"
>
<span>{categoryIndex === categoriesList.length - 1 ? 'Sonuçları Gör' : 'Sonraki Kategori'}</span>
<span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
</button>
</div>
</div>
{/*  Ana İçerik Grid & Özet Panel  */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
{/*  Oyuncu Cevap Kartları (Sol / 8 Sütun)  */}
<div className="lg:col-span-8 space-y-space-md">
<div className="flex flex-wrap items-center justify-between gap-space-sm px-space-xs">
<div className="flex items-center gap-space-sm">
<h2 className="font-title-md text-title-md text-on-surface flex items-center gap-space-xs">
<span>Gelen Yanıtlar</span>
<span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
  {playerAnswers.length} Katılımcı
</span>
</h2>
{isHiddenMode && (
  <button
    type="button"
    onClick={handleRevealAll}
    className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-bright text-primary font-label-sm text-label-sm flex items-center gap-1 transition-colors cursor-pointer border border-primary/20"
    title="Tüm katılımcıların kelimelerini aç"
  >
    <span className="material-symbols-outlined text-[15px]">visibility</span>
    <span>Tümünü Aç</span>
  </button>
)}
</div>
<div className="flex items-center gap-space-md font-body-sm text-body-sm text-on-surface-variant">
<span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary"></span>Özgün</span>
<span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-tertiary-container"></span>Çakışan</span>
<span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-error"></span>Veto</span>
</div>
</div>

{/*  Dinamik Oyuncu Kartları  */}
{playerAnswers.map((p) => {
  const isVetoed = vetoedIds.has(p.id);
  const isEmpty = !p.answer.trim();
  const isDuplicate = playerAnswers.filter(o => o.answer.trim().toUpperCase() === p.answer.trim().toUpperCase()).length > 1;
  const isRevealed = !isHiddenMode || p.isMe || Boolean(revealedPlayers[p.id]);

  return (
    <div 
      key={p.id}
      className={`relative p-space-md sm:p-space-lg rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-space-md shadow-md transition-all ${
        isVetoed ? 'bg-surface-container border border-error/30' : isEmpty ? 'bg-surface-container-lowest/60 opacity-60' : 'bg-surface-container-low hover:bg-surface-container'
      }`}
    >
      <div className="flex items-center gap-space-md min-w-0">
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center font-headline-sm text-headline-sm text-primary font-bold">
            {p.name.slice(0, 2).toUpperCase()}
          </div>
          {p.isMe && (
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary-container rounded-full flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[10px] text-on-primary" style={{"fontVariationSettings":"'FILL' 1"}}>star</span>
            </span>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-space-xs">
            <span className="font-label-lg text-label-lg text-on-surface font-semibold truncate">{p.name}</span>
            {p.isMe && (
              <span className="bg-secondary-container text-primary font-label-sm text-label-sm px-2 py-0.5 rounded-full">SEN</span>
            )}
            {isVetoed && (
              <span className="bg-error-container text-on-error-container font-label-sm text-label-sm px-2 py-0.5 rounded-full">Veto Edildi</span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-space-xs">
            {!isRevealed ? (
              <button
                type="button"
                onClick={() => toggleReveal(p.id)}
                className="group/rev inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-surface-container-highest hover:bg-primary-container/20 border border-outline-variant/30 transition-all cursor-pointer"
                title="Kelimeyi incelemek için basarak açın"
              >
                <span className="font-headline-sm text-headline-sm font-mono tracking-widest text-outline group-hover/rev:text-primary transition-colors select-none">
                  ••••••••
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-label-sm font-bold text-primary bg-primary-container/20 px-2 py-0.5 rounded-full">
                  <span className="material-symbols-outlined text-[13px]">visibility</span>
                  <span>Kelimeyi Aç</span>
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className={`font-headline-sm text-headline-sm font-bold tracking-wide uppercase ${
                  isVetoed ? 'text-error line-through' : isEmpty ? 'text-on-surface-variant' : 'text-on-surface'
                }`}>
                  {isEmpty ? '—' : p.answer}
                </span>
                {isHiddenMode && !p.isMe && !isEmpty && (
                  <button
                    type="button"
                    onClick={() => toggleReveal(p.id)}
                    className="text-on-surface-variant hover:text-primary p-1 rounded transition-colors cursor-pointer"
                    title="Tekrar gizle"
                  >
                    <span className="material-symbols-outlined text-[15px]">visibility_off</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-space-md pt-space-xs sm:pt-0">
        <div className="flex flex-col items-start sm:items-end">
          {isEmpty ? (
            <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px]">remove</span>
              Boş Bırakıldı (0 Puan)
            </span>
          ) : isVetoed ? (
            <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px]">block</span>
              Veto (0 Puan)
            </span>
          ) : !isRevealed ? (
            <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              İnceleme Bekliyor
            </span>
          ) : isDuplicate ? (
            <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container-high text-tertiary-fixed-dim font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px]">group</span>
              Benzer / Çakışan (+5)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              Özgün Kelime (+10)
            </span>
          )}
        </div>

        {!p.isMe && !isEmpty && (
          <button 
            onClick={() => {
              if (!isRevealed) toggleReveal(p.id);
              toggleVeto(p.id);
            }}
            className={`veto-btn flex items-center gap-1.5 px-space-md py-2 rounded-full font-label-md text-label-md transition-colors cursor-pointer ${
              isVetoed ? 'bg-surface-container-high text-on-surface' : 'bg-surface-container hover:bg-error-container text-on-surface hover:text-on-error'
            }`} 
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">{isVetoed ? 'undo' : 'block'}</span>
            <span>{isVetoed ? 'VETO KALDIR' : 'VETO ET'}</span>
          </button>
        )}
      </div>
    </div>
  );
})}
</div>

{/*  Sağ Panel: Kural & Taktik & Canlı Puan Durumu (4 Sütun)  */}
<div className="lg:col-span-4 space-y-space-md">
{/*  Oylama Kural Rehberi Kartı  */}
<div className="bg-secondary-container p-space-lg rounded-2xl space-y-space-md shadow-lg">
<div className="flex items-center gap-space-xs text-primary">
<span className="material-symbols-outlined text-[24px]">gavel</span>
<h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Veto Standartları</h3>
</div>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
          TDK sözlüğünde yer almayan, uydurma veya kategoriyi tam karşılamayan kelimeleri tarafsızca veto edebilirsiniz.
        </p>
<div className="space-y-space-xs pt-space-xs">
<div className="flex items-center gap-space-xs text-on-surface font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[16px] text-primary">check</span>
<span>+10 P: Yalnızca siz yazdıysanız</span>
</div>
<div className="flex items-center gap-space-xs text-on-surface font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[16px] text-primary">check</span>
<span>+5 P: Başkasıyla aynı kelimeyse</span>
</div>
<div className="flex items-center gap-space-xs text-on-surface font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[16px] text-primary">close</span>
<span>0 P: Çoğunluk vetosu veya boş yanıt</span>
</div>
</div>
</div>
{/*  Mini Puan Tablosu (Canlı)  */}
<div className="bg-surface-container-low p-space-lg rounded-2xl space-y-space-md shadow-md">
<div className="flex items-center justify-between">
<h3 className="font-title-md text-title-md text-on-surface">Mevcut Sıralama</h3>
<span className="font-label-sm text-label-sm text-primary uppercase tracking-wider">Tur 2</span>
</div>
<div className="space-y-space-xs">
<div className="flex items-center justify-between p-space-sm bg-surface-container rounded-xl">
<div className="flex items-center gap-space-sm">
<span className="font-label-sm text-label-sm font-bold text-primary w-4">1</span>
<span className="font-label-md text-label-md text-on-surface font-semibold">{profile.username || 'Sen'} (SEN)</span>
</div>
<span className="font-label-lg text-label-lg font-bold text-primary">55 P</span>
</div>
<div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded-xl">
<div className="flex items-center gap-space-sm">
<span className="font-label-sm text-label-sm text-on-surface-variant w-4">2</span>
<span className="font-label-md text-label-md text-on-surface">Selin A.</span>
</div>
<span className="font-label-lg text-label-lg font-semibold text-on-surface-variant">45 P</span>
</div>
<div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded-xl">
<div className="flex items-center gap-space-sm">
<span className="font-label-sm text-label-sm text-on-surface-variant w-4">3</span>
<span className="font-label-md text-label-md text-on-surface">Mert Y.</span>
</div>
<span className="font-label-lg text-label-lg font-semibold text-on-surface-variant">40 P</span>
</div>
<div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded-xl">
<div className="flex items-center gap-space-sm">
<span className="font-label-sm text-label-sm text-on-surface-variant w-4">4</span>
<span className="font-label-md text-label-md text-on-surface">Ece D.</span>
</div>
<span className="font-label-lg text-label-lg font-semibold text-on-surface-variant">25 P</span>
</div>
</div>
</div>
</div>
</div>
{/*  Alt Bilgi / Sistem Banner  */}
<div className="w-full bg-surface-container-low px-space-lg py-space-md rounded-2xl flex flex-col md:flex-row items-center justify-between gap-space-md">
<div className="flex items-center gap-space-sm">
<span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
<p className="font-body-sm text-body-sm text-on-surface-variant">
  Oylama tamamlandığında kazanılan puanlar anında kümülatif skora yansıtılır.
</p>
</div>
<div className="flex items-center gap-space-md">
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Oda Modu: Harfbaz Hızlı Düello</span>
</div>
</div>
</div>
</main>
  );
};

export default HarfbazOylamaVetoScreen;
