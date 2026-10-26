import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, X, Check } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'default';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Tamam',
  cancelText = 'İptal',
  onConfirm,
  onCancel,
  variant = 'danger'
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <AlertTriangle size={24} className="text-rose-400" />;
      case 'warning':
        return <AlertCircle size={24} className="text-amber-400" />;
      default:
        return <Info size={24} className="text-cyan-400" />;
    }
  };

  const getConfirmButtonClasses = () => {
    switch (variant) {
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500';
      case 'warning':
        return 'bg-amber-500 hover:bg-amber-400 text-black border-amber-400';
      default:
        return 'bg-cyan-400 hover:bg-cyan-300 text-black border-cyan-300';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[1000] bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />

          {/* Dialog Container */}
          <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 pointer-events-none select-none font-sans">
            <motion.div
              className="w-full max-w-sm bg-[#0e0a14] rounded-2xl border border-white/10 p-6 flex flex-col gap-5 pointer-events-auto shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with Icon and Text */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0">
                  {getIcon()}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-black text-white m-0 tracking-tight leading-snug">
                    {title}
                  </h3>
                  <p className="text-xs text-slate-400 m-0 mt-1.5 leading-relaxed font-medium">
                    {message}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 h-11 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 active:translate-y-0.5"
                >
                  <X size={15} />
                  <span>{cancelText}</span>
                </button>
                
                <button
                  type="button"
                  onClick={onConfirm}
                  className={`flex-1 h-11 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 active:translate-y-0.5 ${getConfirmButtonClasses()}`}
                >
                  <Check size={15} />
                  <span>{confirmText}</span>
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
