"use client";
import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

const TOAST_ICONS = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
};

// Minimalist Enterprise Toast Styling
const TOAST_STYLES = {
    success: { bg: 'bg-[#0a0a0c]', border: 'border-zinc-800/80', icon: 'text-emerald-400', bar: 'bg-gradient-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0' },
    error: { bg: 'bg-[#0a0a0c]', border: 'border-zinc-800/80', icon: 'text-red-400', bar: 'bg-gradient-to-r from-red-500/0 via-red-500 to-red-500/0' },
    info: { bg: 'bg-[#0a0a0c]', border: 'border-zinc-800/80', icon: 'text-blue-400', bar: 'bg-gradient-to-r from-blue-500/0 via-blue-500 to-blue-500/0' },
    warning: { bg: 'bg-[#0a0a0c]', border: 'border-zinc-800/80', icon: 'text-amber-400', bar: 'bg-gradient-to-r from-amber-500/0 via-amber-500 to-amber-500/0' },
};

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const counterRef = useRef(0);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = ++counterRef.current;
        setToasts(prev => [...prev, { id, message, type, duration }]);
        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = useCallback({
        success: (msg, dur) => addToast(msg, 'success', dur),
        error: (msg, dur) => addToast(msg, 'error', dur),
        info: (msg, dur) => addToast(msg, 'info', dur),
        warning: (msg, dur) => addToast(msg, 'warning', dur),
    }, [addToast]);

    // Workaround: expose functions directly
    const toastFn = (msg, type, dur) => addToast(msg, type, dur);
    toastFn.success = (msg, dur) => addToast(msg, 'success', dur);
    toastFn.error = (msg, dur) => addToast(msg, 'error', dur);
    toastFn.info = (msg, dur) => addToast(msg, 'info', dur);
    toastFn.warning = (msg, dur) => addToast(msg, 'warning', dur);

    return (
        <ToastContext.Provider value={toastFn}>
            {children}
            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none max-w-[380px]">
                <AnimatePresence>
                    {toasts.map(t => {
                        const style = TOAST_STYLES[t.type];
                        const Icon = TOAST_ICONS[t.type];
                        return (
                            <motion.div
                                key={t.id}
                                initial={{ opacity: 0, x: 60, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 60, scale: 0.95 }}
                                transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                                className={`pointer-events-auto relative flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl shadow-black/30 ${style.bg} ${style.border}`}
                            >
                                <Icon size={16} className={`${style.icon} flex-shrink-0 mt-0.5`} />
                                <p className="text-[13px] text-zinc-200 font-medium leading-snug flex-1">{t.message}</p>
                                <button
                                    onClick={() => removeToast(t.id)}
                                    className="text-zinc-600 hover:text-zinc-400 transition-colors flex-shrink-0 mt-0.5"
                                >
                                    <X size={14} />
                                </button>
                                {/* Progress bar */}
                                {t.duration > 0 && (
                                    <motion.div
                                        initial={{ scaleX: 1 }}
                                        animate={{ scaleX: 0 }}
                                        transition={{ duration: t.duration / 1000, ease: "linear" }}
                                        className={`absolute bottom-0 left-0 right-0 h-[2px] ${style.bar} rounded-b-xl origin-left opacity-40`}
                                    />
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}
