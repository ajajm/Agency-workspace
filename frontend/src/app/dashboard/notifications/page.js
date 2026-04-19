"use client";
import { useNotifications } from '../../../context/NotificationContext';
import { motion } from 'framer-motion';
import { Bell, Check, Megaphone } from 'lucide-react';

export default function NotificationsPage() {
    const { notifications, markAsRead } = useNotifications();

    const unread = notifications.filter(n => !n.read);
    const read = notifications.filter(n => n.read);

    const timeAgo = (d) => {
        const ms = Date.now() - new Date(d).getTime();
        const mins = Math.floor(ms / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <h1 className="text-[20px] font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Notifications</h1>
                    <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{unread.length} unread · {notifications.length} total</p>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-800/40 flex items-center justify-center mb-3">
                            <Bell size={20} className="text-zinc-600" />
                        </div>
                        <p className="text-[13px] font-medium text-zinc-400">All caught up!</p>
                        <p className="text-[11px] text-zinc-600 mt-1">No notifications yet.</p>
                    </div>
                ) : (
                    <>
                        {unread.length > 0 && (
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-1 pb-1">New</p>
                        )}
                        {unread.map((n, idx) => (
                            <motion.div key={n.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}
                                className="flex items-start gap-3 p-3.5 rounded-xl border border-amber-500/15 bg-amber-500/5 hover:bg-amber-500/8 transition-all group cursor-pointer"
                                onClick={() => markAsRead(n.id)}
                            >
                                <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Megaphone size={14} className="text-amber-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-semibold text-zinc-200 leading-snug">{n.title}</p>
                                    <p className="text-[10px] text-zinc-500 mt-1">{timeAgo(n.created_at)}</p>
                                </div>
                                <button className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-zinc-800 text-zinc-500 hover:text-emerald-400 transition-all flex-shrink-0" title="Mark read">
                                    <Check size={13} />
                                </button>
                            </motion.div>
                        ))}

                        {read.length > 0 && (
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-1 pt-3 pb-1">Earlier</p>
                        )}
                        {read.map((n, idx) => (
                            <motion.div key={n.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.02 * idx }}
                                className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800/40 bg-zinc-900/20 hover:bg-zinc-800/20 transition-all"
                            >
                                <div className="w-8 h-8 rounded-lg bg-zinc-800/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Bell size={14} className="text-zinc-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-medium text-zinc-400 leading-snug">{n.title}</p>
                                    <p className="text-[10px] text-zinc-600 mt-1">{timeAgo(n.created_at)}</p>
                                </div>
                            </motion.div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}
