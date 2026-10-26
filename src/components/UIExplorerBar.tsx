import React, { useState } from 'react';

export interface ScreenItem {
  id: string;
  name: string;
  category: 'Portal' | 'Veto' | 'Harfbaz' | 'Sistem' | 'Yasal & Auth';
  path: string;
}

export const SCREEN_CATALOG: ScreenItem[] = [
  { id: 'ortak_giri_portal_sade_modern', name: '1. Ortak Giriş Portalı', category: 'Portal', path: 'portal' },
  { id: 'veto_nas_l_oynan_r_kural_k_lavuzu', name: '2. Veto Kural Kılavuzu', category: 'Veto', path: 'veto-rules' },
  { id: 'veto_tak_m_d_ello_lobisi_sade_modern', name: '3. Veto Takım Lobisi', category: 'Veto', path: 'veto-lobby' },
  { id: 'veto_canl_d_ello_alan_sade_modern', name: '4. Veto Canlı Düello', category: 'Veto', path: 'veto-match' },
  { id: 'veto_ampiyonluk_zafer_sade_modern', name: '5. Veto Şampiyonluk & Zafer', category: 'Veto', path: 'veto-victory' },
  { id: 'harfbaz_profil_lobi_kat_lma', name: '6. Harfbaz Profil & Katıl', category: 'Harfbaz', path: 'harfbaz-profile' },
  { id: 'harfbaz_bekleme_odas', name: '7. Harfbaz Bekleme Odası', category: 'Harfbaz', path: 'harfbaz-lobby' },
  { id: 'harfbaz_canl_oyun_ekran', name: '8. Harfbaz Canlı Oyun', category: 'Harfbaz', path: 'harfbaz-game' },
  { id: 'harfbaz_oylama_veto_ekran', name: '9. Harfbaz Oylama & Veto', category: 'Harfbaz', path: 'harfbaz-veto' },
  { id: 'harfbaz_liderlik_tablosu_podyum', name: '10. Harfbaz Podyum & Skor', category: 'Harfbaz', path: 'harfbaz-leaderboard' },
  { id: 'duel_arena_k_onay_penceresi', name: '11. Çıkış Onay Modalı', category: 'Sistem', path: 'exit-confirm' },
  { id: 'duel_arena_404_sayfa_bulunamad', name: '12. 404 Bulunamadı', category: 'Sistem', path: '404' },
  { id: 'duel_arena_kvkk_ayd_nlatma_metni', name: '13. KVKK Aydınlatma Metni', category: 'Yasal & Auth', path: 'privacy-notice' },
  { id: 'duel_arena_kullan_c_s_zle_mesi', name: '14. Kullanıcı Sözleşmesi', category: 'Yasal & Auth', path: 'terms-of-service' },
  { id: 'duel_arena_erez_politikas', name: '15. Çerez Politikası', category: 'Yasal & Auth', path: 'cookie-policy' },
  { id: 'duel_arena_kay_t_erez_bildirimi_supabase_auth', name: '16. Kayıt & Çerez Bildirimi', category: 'Yasal & Auth', path: 'register' },
];

interface UIExplorerBarProps {
  currentPath: string;
  onSelectPath: (path: string) => void;
}

export const UIExplorerBar: React.FC<UIExplorerBarProps> = ({ currentPath, onSelectPath }) => {
  const [isOpen, setIsOpen] = useState(false);

  const activeItem = SCREEN_CATALOG.find(s => s.path === currentPath) || SCREEN_CATALOG[0];

  return (
    <aside aria-label="Stitch UI Gezgini" className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {isOpen && (
        <section aria-label="12 Sayfa Tasarım Seçici" className="mb-2 w-[340px] max-h-[480px] overflow-y-auto bg-surface-container-high/95 backdrop-blur-xl border border-outline-variant/50 rounded-2xl p-3 shadow-2xl flex flex-col gap-2 text-on-surface">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30 px-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-[20px]">layers</span>
              <span className="font-label-md font-bold text-on-surface">Stitch UI Gezgini (16/16)</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-outline hover:text-on-surface p-1 rounded-lg"
              title="Kapat"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <p className="font-body-sm text-[11px] text-outline px-1">
            Platformdaki 16 sayfa ve modal tasarımının tamamı eksiksiz eklenmiştir. Aşağıdan istediğiniz sayfayı anında canlı inceleyebilirsiniz:
          </p>

          <div className="flex flex-col gap-1">
            {SCREEN_CATALOG.map((item) => {
              const isActive = item.path === currentPath;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectPath(item.path);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container font-semibold shadow-md'
                      : 'hover:bg-surface-container-highest text-on-surface-variant'
                  }`}
                >
                  <span className="truncate">{item.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                    item.category === 'Portal' ? 'bg-secondary-container/50 text-secondary-fixed' :
                    item.category === 'Veto' ? 'bg-on-secondary/60 text-primary-fixed' :
                    item.category === 'Harfbaz' ? 'bg-tertiary-container/30 text-tertiary' :
                    item.category === 'Yasal & Auth' ? 'bg-primary-container/20 text-primary' :
                    'bg-error-container/30 text-error'
                  }`}>
                    {item.category}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-secondary-container hover:bg-primary-container text-on-surface hover:text-on-primary-container border border-outline-variant/50 shadow-[0_4px_24px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all font-label-md font-bold text-xs"
        title="Bütün sayfaları hızlıca incelemek için tıklayın"
      >
        <span className="material-symbols-outlined text-[18px] text-primary-fixed">auto_awesome_motion</span>
        <span>UI İncele ({activeItem.name.split('.')[0]}. Sayfa)</span>
        <span className="material-symbols-outlined text-[16px]">
          {isOpen ? 'expand_more' : 'expand_less'}
        </span>
      </button>
    </aside>
  );
};

export default UIExplorerBar;
