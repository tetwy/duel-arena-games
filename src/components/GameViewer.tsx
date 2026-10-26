import React, { useState, useRef, useEffect } from 'react';
import { GameItem } from '../types';
import { ArrowLeft, RotateCcw, Maximize2, Minimize2, ExternalLink, Loader2, Home } from 'lucide-react';

interface GameViewerProps {
  game: GameItem;
  onBackToMenu: () => void;
}

export const GameViewer: React.FC<GameViewerProps> = ({ game, onBackToMenu }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Fullscreen değişikliklerini izle
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // ESC tuşuyla ana menüye dönme uyarısı / desteği
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.fullscreenElement) {
        // İsteğe bağlı olarak menüye dönüş
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBackToMenu]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen error:', err);
    }
  };

  const reloadGame = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const openInNewTab = () => {
    window.open(game.route, '_blank');
  };

  return (
    <div className="relative w-screen h-screen flex flex-col bg-[#07080c] overflow-hidden select-none">
      {/* Zarif, Yüzen Geri Dönüş Hap Butonu (Navbar Değildir - Ekrandan Yer Kaplamaz) */}
      <div className="fixed top-4 left-4 z-50 flex items-center gap-2 pointer-events-auto">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white backdrop-blur-md border border-white/10 shadow-2xl text-xs font-bold tracking-tight transition-all hover:scale-105 active:scale-95 group cursor-pointer"
          title="Arena Menüsüne Dön"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform text-slate-300 group-hover:text-white" />
          <span>Arena</span>
        </button>
      </div>

      {/* Oyun Görüntüleme Alanı (Iframe - Tam 100vh Ekran) */}
      <main className="relative flex-1 w-full h-full overflow-hidden bg-black">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#07080c] text-slate-200">
            <Loader2 size={36} className="animate-spin mb-4" style={{ color: game.accentColor }} />
            <h3 className="text-lg font-bold tracking-wide">{game.title} Başlatılıyor...</h3>
            <p className="text-xs text-slate-400 mt-1">Oyun alanı yükleniyor, lütfen bekleyin.</p>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={game.route}
          title={game.title}
          onLoad={() => setIsLoading(false)}
          className="w-full h-full border-0 select-auto"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; camera; microphone"
        />
      </main>
    </div>
  );
};
