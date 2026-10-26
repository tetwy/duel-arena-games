import React from 'react';

export type LegalTab = 'kvkk' | 'kullanici-sozlesmesi' | 'cerez-politikasi';

interface LegalNavPillsProps {
  activeTab: LegalTab;
  onNavigate?: (path: string) => void;
  className?: string;
}

export const LegalNavPills: React.FC<LegalNavPillsProps> = ({ activeTab, onNavigate, className = '' }) => {
  const tabs: { id: LegalTab; label: string; path: string }[] = [
    { id: 'kvkk', label: 'KVKK Aydınlatma Metni', path: 'kvkk' },
    { id: 'kullanici-sozlesmesi', label: 'Kullanıcı Sözleşmesi', path: 'kullanici-sozlesmesi' },
    { id: 'cerez-politikasi', label: 'Çerez Politikası', path: 'cerez-politikasi' },
  ];

  return (
    <div className={`flex items-center gap-space-xs p-space-2xs bg-surface-container-lowest rounded-full overflow-x-auto w-full md:w-fit shadow-md border border-outline-variant/20 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onNavigate?.(tab.path)}
            className={`font-label-md text-label-md whitespace-nowrap transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-primary-container text-on-primary-container font-bold px-space-lg py-space-xs rounded-full shadow-[0_4px_16px_rgba(241,112,14,0.35)] flex items-center gap-space-2xs'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60 px-space-lg py-space-xs rounded-full'
            }`}
          >
            {isActive && <span className="material-symbols-outlined text-[16px]">verified</span>}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default LegalNavPills;
