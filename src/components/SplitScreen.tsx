import React, { useState } from 'react';
import { GameItem } from '../types';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface SplitScreenProps {
  games: GameItem[];
  onSelectGame: (game: GameItem) => void;
}

export const SplitScreen: React.FC<SplitScreenProps> = ({ games, onSelectGame }) => {
  const [hoveredGameId, setHoveredGameId] = useState<string | null>(null);

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#090c15] via-[#05060a] to-[#030406] text-white flex flex-col select-none overflow-x-hidden relative">
      {/* 
        1. EKRAN (100vh):
        - Supaste tarzı notch ada navbar
        - Lüks atmosferik arka plan ışıklandırması (Navbar ve Oyunları öne çıkaran derinlik)
        - Altta Samurai Jack 60:30:10 vitrini (50% / 50%)
      */}
      <div className="w-full h-screen flex flex-col justify-between shrink-0 relative overflow-hidden">
        
        {/* ========================================================================= */}
        {/* LÜKS ATMOSFERİK ARKA PLAN IŞIKLARI & SAHNE KATMANLARI                     */}
        {/* ========================================================================= */}
        
        {/* 1. ÜST NAVBAR ARKASI SPOTLIGHT (Çentiği ve üst adayı öne çıkaran huzme) */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[260px] pointer-events-none z-0"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 50% -10%, rgba(59, 130, 246, 0.28), rgba(99, 102, 241, 0.14), transparent 75%)',
          }}
        />

        {/* 2. SOL (VETO) ATMOSFERİK AMBIENT IŞIK (Pembe / Fuşya Düello Aurası) */}
        <div
          className="absolute left-[-5%] top-[10%] w-[750px] h-[750px] rounded-full blur-[130px] pointer-events-none transition-all duration-700 ease-out z-0"
          style={{
            background: 'radial-gradient(circle, rgba(255, 0, 127, 0.28) 0%, rgba(192, 38, 211, 0.12) 45%, transparent 70%)',
            opacity: hoveredGameId === 'veto' ? 1 : hoveredGameId === 'harfbaz' ? 0.35 : 0.75,
            transform: hoveredGameId === 'veto' ? 'scale(1.15) translateY(-10px)' : 'scale(1)',
          }}
        />

        {/* 3. SAĞ (HARFBAZ) ATMOSFERİK AMBIENT IŞIK (Siyan / Turkuaz Düello Aurası) */}
        <div
          className="absolute right-[-5%] top-[10%] w-[750px] h-[750px] rounded-full blur-[130px] pointer-events-none transition-all duration-700 ease-out z-0"
          style={{
            background: 'radial-gradient(circle, rgba(0, 240, 255, 0.28) 0%, rgba(14, 165, 233, 0.12) 45%, transparent 70%)',
            opacity: hoveredGameId === 'harfbaz' ? 1 : hoveredGameId === 'veto' ? 0.35 : 0.75,
            transform: hoveredGameId === 'harfbaz' ? 'scale(1.15) translateY(-10px)' : 'scale(1)',
          }}
        />

        {/* 4. MERKEZ SAHNE DERİNLİK GRADYANI (Vignette & Kontrast) */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: 'radial-gradient(ellipse 95% 75% at 50% 50%, rgba(15, 23, 42, 0.35) 0%, #030406 95%)',
          }}
        />

        {/* 5. PRESTİJLİ MİKRO STÜDYO NOKTA IZGARA DOKUSU (Merkeze yumuşak odaklanmış) */}
        <div
          className="absolute inset-0 pointer-events-none z-0 opacity-35"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.35) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            maskImage: 'radial-gradient(ellipse 90% 75% at 50% 50%, black 30%, transparent 90%)',
            WebkitMaskImage: 'radial-gradient(ellipse 90% 75% at 50% 50%, black 30%, transparent 90%)',
          }}
        />

        {/* SUPASTE TARZI NOTCH ADA NAVBAR */}
        <Navbar onPlayClick={() => onSelectGame(games[0])} />

        {/* 
          ANA OYUN ALANI (50% / 50% Sinematik Vitrin)
          - Dış çerçeve: Modern, yumuşak kavisli (rounded-3xl) estetik çerçeve.
          - Nefes alan kenar boşlukları ile arka plandaki atmosferi ve sahne ışığını ortaya çıkarır.
          - Başlangıçta: Saf, net, blursuz ve yazısız çizim.
          - Hover olduğunda: Arka plan blurlanır, ortada (center) sinematik başlık ve açıklama belirir.
        */}
        <main className="relative z-10 flex-1 flex flex-col md:flex-row w-full max-w-[1720px] mx-auto p-4 sm:p-6 md:px-8 pt-20 sm:pt-22 pb-5 sm:pb-7 gap-4 sm:gap-6 overflow-hidden box-border">
          {games.map((game) => {
            const isHovered = hoveredGameId === game.id;
            const isVeto = game.id === 'veto';

            return (
              <div
                key={game.id}
                onClick={() => onSelectGame(game)}
                onMouseEnter={() => setHoveredGameId(game.id)}
                onMouseLeave={() => setHoveredGameId(null)}
                className="group relative flex-1 min-w-0 min-h-0 cursor-pointer rounded-3xl overflow-hidden border transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-center"
                style={{
                  borderColor: isHovered 
                    ? game.accentColor 
                    : 'rgba(255, 255, 255, 0.16)',
                  boxShadow: isHovered
                    ? `0 30px 80px -10px ${game.glowColor}, inset 0 0 50px -10px ${game.glowColor}`
                    : `0 20px 50px -10px rgba(0, 0, 0, 0.85), 0 0 45px -10px ${isVeto ? 'rgba(255, 0, 127, 0.35)' : 'rgba(0, 240, 255, 0.35)'}`,
                  backgroundColor: '#07080c',
                  flexGrow: isHovered ? 1.25 : 1,
                }}
              >
                {/* Kart Üst Cam Yansıma Hattı (Specular Edge) */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none z-20" />
                {/* 
                  SAMURAI JACK 60:30:10 ARKA PLAN ÇİZİMİ
                  - Normal: Kristal netliğinde saf çizim.
                  - Hover: Akıcı blur efekti, hafif zoom ve sinematik karartma.
                */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src={game.banner}
                    alt={game.title}
                    className="w-full h-full object-cover object-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] select-none pointer-events-none"
                    style={{
                      transform: isHovered ? 'scale(1.08)' : 'scale(1.0)',
                      filter: isHovered
                        ? 'blur(12px) brightness(0.38) saturate(1.2)'
                        : 'blur(0px) brightness(1.0) saturate(1.0)',
                    }}
                  />

                  {/* Hover durumunda ekstra karartma ve odak katmanı */}
                  <div
                    className={`absolute inset-0 bg-black/40 transition-opacity duration-700 pointer-events-none ${
                      isHovered ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  {/* Arka plan siber ızgara dokusu (hafif) */}
                  <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                      backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px)',
                      backgroundSize: '20px 20px',
                    }}
                  />
                </div>

                {/* 
                  TAM ORTADA (CENTER) SİNEMATİK OYUN ADI VE AÇIKLAMA:
                  - Başlangıçta görünmez.
                  - Hover olunca arka plan blurlanırken kartın TAM ORTASINDA sinematik olarak belirir.
                */}
                <div
                  className={`relative z-10 p-6 sm:p-12 flex flex-col items-center justify-center text-center max-w-lg mx-auto transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none ${
                    isHovered
                      ? 'opacity-100 translate-y-0 scale-100'
                      : 'opacity-0 translate-y-6 scale-95'
                  }`}
                >
                  {/* Sinematik Başlık */}
                  <h2
                    className={`text-7xl sm:text-8xl md:text-9xl font-black uppercase m-0 leading-none tracking-wider font-bebas text-white ${
                      isVeto ? 'comic-shadow-pink' : 'comic-shadow-cyan'
                    }`}
                  >
                    {game.title}
                  </h2>

                  {/* Oyun Açıklaması */}
                  <p className="text-sm sm:text-base text-slate-200 mt-4 font-sans font-medium leading-relaxed drop-shadow-lg max-w-md">
                    {game.description}
                  </p>
                </div>
              </div>
            );
          })}
        </main>
      </div>

      {/* 
        2. EKRAN: SCROLL YAPILDIĞINDA ÇIKAN PROFESYONEL FOOTER
        Kullanıcı sayfayı aşağı kaydırdığında doğal olarak görünür.
      */}
      <Footer />
    </div>
  );
};
