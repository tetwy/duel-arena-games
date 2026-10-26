import React from 'react';
import { X, PlusCircle, Code, Layers, Sparkles } from 'lucide-react';

interface AddGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddGameModal: React.FC<AddGameModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0f121a] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-indigo-500/10 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <PlusCircle size={28} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Yeni Oyun Ekleme Rehberi</h2>
            <p className="text-sm text-slate-400">Ekran dinamik olarak eklenen oyun sayısına göre eşit parçalara bölünür.</p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-slate-300">
          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-2 font-semibold text-indigo-300 mb-2">
              <Layers size={18} />
              <span>1. Oyun Listesini Güncelleyin</span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm mb-3">
              <code className="text-indigo-300 bg-slate-800 px-1.5 py-0.5 rounded">src/games.ts</code> dosyasını açıp yeni oyununuzun bilgilerini ekleyin:
            </p>
            <pre className="bg-black/60 p-3 rounded-lg text-xs font-mono text-emerald-400 overflow-x-auto border border-slate-800">
{`GAMES.push({
  id: 'yeni-oyun',
  title: 'YENİ OYUN ADI',
  subtitle: 'Açıklama Başlığı',
  description: 'Oyunun kısa tanıtımı...',
  tag: 'Kategori',
  players: '2-8 Oyuncu',
  accentColor: '#10b981',
  route: '/games/yeni-oyun/',
  // ...
});`}
            </pre>
          </div>

          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-2 font-semibold text-cyan-300 mb-2">
              <Code size={18} />
              <span>2. Otomatik Eşit Bölünme (Dynamic Split)</span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm">
              Listeye yeni oyun eklendiğinde sistem ekranı otomatik olarak <span className="text-white font-medium">N eşit sütuna</span> böler. 
              2 oyunda <strong>%50 / %50</strong>, 3 oyunda <strong>%33.3 / %33.3 / %33.3</strong>, 4 oyunda <strong>%25'er</strong> paylaştırılır.
            </p>
          </div>

          <div className="p-4 bg-emerald-950/30 rounded-xl border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-start gap-2">
            <Sparkles size={18} className="shrink-0 mt-0.5" />
            <span>
              Her oyun tamamen izole bir ortamda çalıştığı için (Tailwind, Supabase, paket bağımlılıkları) birbirlerini asla etkilemez.
            </span>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/30 text-sm"
          >
            Anladım, Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
