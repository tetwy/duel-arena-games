import React, { useState } from 'react';
import { Database, CheckCircle, XCircle, AlertCircle, RefreshCw, Terminal, Server, ShieldCheck } from 'lucide-react';

interface EndpointItem {
  name: string;
  type: 'TABLE' | 'RPC' | 'AUTH' | 'REALTIME';
  description: string;
  status: 'PENDING' | 'SUCCESS' | 'ERROR';
  details?: string;
}

interface BackendHealthProps {
  gameId: 'veto' | 'harfbaz';
  gameTitle: string;
  supabaseUrl: string;
  hasKey: boolean;
  endpoints: EndpointItem[];
  onTestEndpoints: () => Promise<void>;
  isTesting: boolean;
  sqlSchemaPath: string;
}

export const BackendHealthCard: React.FC<BackendHealthProps> = ({
  gameTitle,
  supabaseUrl,
  hasKey,
  endpoints,
  onTestEndpoints,
  isTesting,
  sqlSchemaPath,
}) => {
  const [showSqlInfo, setShowSqlInfo] = useState(false);

  const isConfigured = Boolean(supabaseUrl && !supabaseUrl.includes('placeholder') && hasKey);

  return (
    <div className="w-full flex flex-col gap-3 p-3 sm:p-4 rounded-xl bg-slate-900/90 border border-white/10 text-slate-200 backdrop-blur-md">
      {/* Üst Durum Çubuğu */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Database size={16} className={isConfigured ? 'text-emerald-400' : 'text-amber-400'} />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            {gameTitle} Backend & DB Durumu
          </span>
        </div>

        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
            isConfigured
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
          }`}
        >
          {isConfigured ? 'URL Bağlı' : '.env Bekleniyor'}
        </span>
      </div>

      {/* URL ve Bilgi Özeti */}
      <div className="text-[11px] font-mono bg-black/50 p-2 rounded-lg border border-white/5 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Supabase URL:</span>
          <span className="text-slate-200 truncate max-w-[200px]">
            {supabaseUrl ? supabaseUrl.replace('https://', '') : 'Tanımlanmadı'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Anon Key:</span>
          <span className={hasKey ? 'text-emerald-400' : 'text-amber-400'}>
            {hasKey ? 'Mevcut (Gizli)' : 'Eksik'}
          </span>
        </div>
      </div>

      {/* Endpoint & Tablo Listesi */}
      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
          Gereken Tablolar & RPC Endpointleri:
        </div>
        {endpoints.map((ep, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between px-2 py-1 rounded bg-black/30 border border-white/5 text-[11px]"
          >
            <div className="flex items-center gap-1.5 truncate">
              <span
                className={`text-[9px] font-bold px-1 py-0.2 rounded ${
                  ep.type === 'TABLE'
                    ? 'bg-blue-500/20 text-blue-300'
                    : ep.type === 'RPC'
                    ? 'bg-purple-500/20 text-purple-300'
                    : ep.type === 'REALTIME'
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {ep.type}
              </span>
              <span className="font-mono text-slate-200">{ep.name}</span>
            </div>

            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              {ep.status === 'SUCCESS' && <CheckCircle size={13} className="text-emerald-400" />}
              {ep.status === 'ERROR' && <XCircle size={13} className="text-red-400" />}
              {ep.status === 'PENDING' && <span className="text-slate-500 text-[10px]">• Hazır</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Aksiyon Butonları */}
      <div className="flex items-center gap-2 pt-2 border-t border-white/10">
        <button
          onClick={onTestEndpoints}
          disabled={isTesting}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md active:scale-95"
        >
          <RefreshCw size={12} className={isTesting ? 'animate-spin' : ''} />
          <span>{isTesting ? 'Kontrol Ediliyor...' : 'Endpointleri Test Et'}</span>
        </button>

        <button
          onClick={() => setShowSqlInfo(!showSqlInfo)}
          className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all border border-slate-700 flex items-center gap-1.5"
          title="SQL Şemasını Göster"
        >
          <Terminal size={12} />
          <span>SQL Şeması</span>
        </button>
      </div>

      {showSqlInfo && (
        <div className="p-2.5 rounded-lg bg-black/80 border border-indigo-500/30 text-[11px] text-slate-300 animate-fadeIn">
          <div className="font-bold text-indigo-300 mb-1 flex items-center gap-1.5">
            <ShieldCheck size={13} />
            <span>Hazır SQL Dosyası:</span>
          </div>
          <p className="text-slate-400 text-[10px] mb-1">
            Supabase SQL Editörüne yapıştırıp tek tıkla çalıştırabileceğiniz dosya:
          </p>
          <code className="text-emerald-400 font-mono text-[10px] bg-slate-900 px-1 py-0.5 rounded block">
            {sqlSchemaPath}
          </code>
        </div>
      )}
    </div>
  );
};
