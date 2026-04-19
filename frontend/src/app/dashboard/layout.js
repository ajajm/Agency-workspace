"use client";
import { useAuth } from '../../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { LayoutDashboard, CheckSquare, FileText, Calendar, LogOut, Bell, BarChart3, ChevronLeft, ChevronRight, Shield, ChevronDown, Play, Square, Megaphone, Check, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';
import { useToast } from '../../components/Toast';
import axios from 'axios';
import Link from 'next/link';

export default function DashboardLayout({ children }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const toast = useToast();

    const [collapsed, setCollapsed] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Notifications & Punch Log States
    const { notifications, unreadCount, markAsRead } = useNotifications();
    const [showNotifications, setShowNotifications] = useState(false);
    const notifRef = useRef(null);

    const [activePunch, setActivePunch] = useState(null);
    const [elapsedTime, setElapsedTime] = useState('');

    useEffect(() => {
        if (!loading && !user) router.push('/login');
    }, [user, loading, router]);

    // Fetch active punch status
    useEffect(() => {
        if (user) {
            fetchPunchStatus();
            const interval = setInterval(fetchPunchStatus, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    // Timer logic
    useEffect(() => {
        if (!activePunch?.punch_in) { setElapsedTime(''); return; }
        const tick = () => {
            const diff = Date.now() - new Date(activePunch.punch_in).getTime();
            const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
            const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
            const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
            setElapsedTime(`${h}:${m}:${s}`);
        };
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [activePunch]);

    // Click outside to close notifications
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchPunchStatus = async () => {
        try {
            const res = await axios.get('/api/punchlogs/active');
            setActivePunch(res.data?.id ? res.data : null);
            if (!res.data?.id) setElapsedTime('');
        } catch (err) { console.error(err); }
    };

    const handlePunchIn = async () => {
        try {
            const res = await axios.post('/api/punchlogs/in');
            setActivePunch(res.data);
            toast.success('Punched in');
            // Allow overview page to listen by emitting a custom event
            window.dispatchEvent(new Event('punch-updated'));
        } catch (err) { toast.error(err.response?.data?.msg || 'Punch in error'); }
    };

    const handlePunchOut = async () => {
        try {
            await axios.post('/api/punchlogs/out');
            toast.success('Punched out');
            setActivePunch(null);
            setElapsedTime('');
            window.dispatchEvent(new Event('punch-updated'));
        } catch (err) { toast.error(err.response?.data?.msg || 'Punch out error'); }
    };

    if (loading || !user) return null;

    const isAdmin = user.role?.includes('Admin') || user.role?.includes('Founder');

    const nav = [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Tasks', href: '/dashboard/todos', icon: CheckSquare },
        { name: 'Reports', href: '/dashboard/reports', icon: FileText },
        { name: 'Meetings', href: '/dashboard/meetings', icon: Calendar },
    ];

    const admin = isAdmin ? [
        { name: 'Admin Panel', href: '/dashboard/admin', icon: Shield },
        { name: 'Team Reports', href: '/dashboard/admin/reports', icon: BarChart3 },
    ] : [];

    const timeAgo = (d) => {
        const ms = Date.now() - new Date(d).getTime();
        const mins = Math.floor(ms / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    const NavItem = ({ item }) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
            <Link href={item.href} title={collapsed ? item.name : undefined}
                className={`group flex items-center gap-2.5 rounded-lg transition-all relative ${collapsed ? 'justify-center p-2' : 'px-3 py-[7px]'
                    } ${active
                        ? 'bg-[var(--brand-muted)] text-[var(--brand)]'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                    }`}
            >
                {active && !collapsed && (
                    <motion.div layoutId="nav-indicator"
                        className="absolute left-0 w-[2px] h-4 rounded-r-full"
                        style={{ background: 'var(--brand)' }}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                )}
                <div className="relative flex-shrink-0">
                    <Icon size={16} strokeWidth={active ? 2 : 1.5} />
                </div>
                {!collapsed && <span className="text-[13px] font-medium truncate">{item.name}</span>}
            </Link>
        );
    };

    return (
        <div className="h-screen flex overflow-hidden w-full" style={{ background: 'var(--bg-primary)' }}>

            {/* ─── MOBILE TOP NAV ─── */}
            <div className="md:hidden fixed top-0 inset-x-0 h-14 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] z-30 px-5 flex items-center justify-between backdrop-blur-2xl">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-inner">
                        <img src="/logo.svg" alt="LeappBee" className="w-5 h-5" />
                    </div>
                    <span className="font-bold tracking-tight text-[15px]" style={{ color: 'var(--text-primary)' }}>LeappBee</span>
                </div>
                <button onClick={() => setMobileOpen(true)} className="p-2 -mr-2 flex items-center justify-center rounded-lg text-[var(--text-primary)] focus:bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)]">
                    <Menu size={22} />
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* ─── SIDEBAR ─── */}
            <motion.aside
                initial={false}
                animate={{ 
                    // Mobile ignores width animation because width is handled by CSS, Desktop uses it
                    width: typeof window !== 'undefined' && window.innerWidth < 768 ? 260 : (collapsed ? 56 : 220) 
                }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className={`fixed md:relative inset-y-0 left-0 z-50 h-full flex flex-col flex-shrink-0 overflow-hidden transform transition-transform duration-300 ease-in-out md:translate-x-0 ${mobileOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full'} md:w-auto`}
                style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-subtle)' }}
            >
                {/* Brand */}
                <div className={`flex items-center h-[60px] flex-shrink-0 ${collapsed ? 'justify-center' : 'px-5 gap-3'}`}
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-inner">
                        <img src="/logo.svg" alt="LeappBee" className="w-5 h-5" />
                    </div>
                    {!collapsed && (
                        <span className="text-[15px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>LeappBee</span>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                    {nav.map(item => <NavItem key={item.name} item={item} />)}

                    {admin.length > 0 && (
                        <>
                            <div className="my-4 mx-2" style={{ borderTop: '1px solid var(--border-subtle)' }} />
                            {!collapsed && (
                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-1.5" style={{ color: 'var(--text-muted)' }}>
                                    Management
                                </p>
                            )}
                            {admin.map(item => <NavItem key={item.name} item={item} />)}
                        </>
                    )}
                </nav>

                {/* Bottom Actions Area */}
                <div className="flex-shrink-0 px-3 pb-3 space-y-2">
                    {/* Punch Clock */}
                    {activePunch ? (
                        <div className={`flex items-center bg-[var(--brand-muted)] border border-blue-500/20 rounded-lg overflow-hidden h-[36px] transition-all ${collapsed ? 'justify-center cursor-pointer' : ''}`} onClick={collapsed ? handlePunchOut : undefined} title={collapsed ? "Punch Out" : ""}>
                            <div className={`flex items-center gap-2 h-full ${collapsed ? '' : 'px-3 border-r border-blue-500/20'}`}>
                                <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: 'var(--brand)' }} />
                                {!collapsed && (
                                    <span className="text-[12px] font-mono font-bold tabular-nums text-[var(--brand)]">
                                        {elapsedTime || '00:00'}
                                    </span>
                                )}
                            </div>
                            {!collapsed && (
                                <button onClick={handlePunchOut} className="px-3 h-full text-[11px] font-semibold text-[var(--text-secondary)] hover:bg-blue-500/10 hover:text-[var(--text-primary)] transition-colors flex items-center justify-center flex-1 gap-1.5" title="Punch Out">
                                    <Square size={10} fill="currentColor" /> Out
                                </button>
                            )}
                        </div>
                    ) : (
                        <button onClick={handlePunchIn} className={`flex items-center gap-2 w-full h-[36px] text-[12px] font-semibold rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-all ${collapsed ? 'justify-center' : 'px-3.5'}`}>
                            <Play size={10} fill="currentColor" />
                            {!collapsed && <span>Punch In</span>}
                        </button>
                    )}

                    {/* Notifications Toggle & Sidebar Collapse Row */}
                    <div className={`flex items-center gap-2 ${collapsed ? 'flex-col' : ''}`}>
                        {/* Notification Button */}
                        <div className="relative flex-1" ref={notifRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`w-full flex items-center justify-center p-2 rounded-lg transition-all border ${showNotifications ? 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-primary)]' : 'border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'}`}
                                title="Notifications"
                            >
                                <div className="relative">
                                    <Bell size={16} />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 border-2 border-[var(--bg-secondary)] rounded-full animate-pulse-dot" style={{ background: 'var(--brand)' }} />
                                    )}
                                </div>
                                {!collapsed && <span className="ml-2.5 text-[12px] font-semibold">Activity</span>}
                            </button>

                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10, scale: 0.98 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: -10, scale: 0.98 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="fixed bottom-12 left-[270px] w-[380px] rounded-xl shadow-2xl overflow-hidden z-50"
                                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                                    >
                                        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                                            <h3 className="font-semibold text-[14px]" style={{ color: 'var(--text-primary)' }}>Activity</h3>
                                            <div className="chip chip-neutral">{unreadCount} New</div>
                                        </div>
                                        <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                                            {notifications.length === 0 ? (
                                                <div className="p-8 text-center text-[13px] font-medium" style={{ color: 'var(--text-muted)' }}>
                                                    All caught up!
                                                </div>
                                            ) : (
                                                notifications.map((n, idx) => (
                                                    <div key={n.id}
                                                        className={`p-4 border-b border-[var(--border-subtle)] hover:bg-[var(--bg-tertiary)] transition-colors flex gap-3 ${!n.read ? 'bg-[var(--brand-muted)]' : ''}`}
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center flex-shrink-0 mt-0.5">
                                                            {n.read ? <Bell size={14} className="text-[var(--text-muted)]" /> : <Megaphone size={14} style={{ color: 'var(--brand)' }} />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-[13px] leading-snug ${!n.read ? 'text-[var(--text-primary)] font-semibold' : 'text-[var(--text-secondary)] font-medium'}`}>{n.title}</p>
                                                            <p className="text-[11px] mt-1.5 font-medium flex items-center justify-between" style={{ color: 'var(--text-muted)' }}>
                                                                {timeAgo(n.created_at)}
                                                                {!n.read && (
                                                                    <button onClick={() => markAsRead(n.id)} className="text-[var(--brand)] hover:text-blue-400 font-semibold p-1 hover:bg-[var(--brand-muted)] rounded flex items-center gap-1">
                                                                        <Check size={12} /> Mark read
                                                                    </button>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button onClick={() => setCollapsed(!collapsed)}
                            className="hidden md:flex items-center justify-center p-2 rounded-lg transition-colors border border-transparent hover:border-[var(--border-subtle)]"
                            style={{ color: 'var(--text-muted)', background: 'var(--bg-tertiary)' }}
                            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                        >
                            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                        </button>
                    </div>
                </div>

                {/* User section */}
                <div className="flex-shrink-0 p-3" style={{ background: 'var(--bg-primary)', borderTop: '1px solid var(--border-subtle)' }}>
                    <div className="relative">
                        <button onClick={() => setShowUserMenu(!showUserMenu)}
                            className={`w-full flex items-center gap-2.5 rounded-lg p-2 transition-all hover:bg-[var(--bg-elevated)] ${collapsed ? 'justify-center' : ''}`}>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] flex-shrink-0 border border-white/10 shadow-sm"
                                style={{ background: 'var(--brand)', color: '#fff' }}>
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            {!collapsed && (
                                <>
                                    <div className="flex-1 text-left min-w-0">
                                        <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                                        <p className="text-[11px] truncate mt-0.5 font-medium" style={{ color: 'var(--text-muted)' }}>{user.role}</p>
                                    </div>
                                    <ChevronDown size={14} style={{ color: 'var(--text-muted)' }}
                                        className={`transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                                </>
                            )}
                        </button>

                        <AnimatePresence>
                            {showUserMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                                    <motion.div initial={{ opacity: 0, y: 4, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4, scale: 0.98 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute bottom-[calc(100%+8px)] left-0 right-0 rounded-xl shadow-2xl z-50 overflow-hidden"
                                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                                        <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                            <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                                            <p className="text-[11px] mt-0.5 font-medium" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                                        </div>
                                        <div className="p-1.5">
                                            <Link href="/dashboard/settings" onClick={() => setShowUserMenu(false)} className="flex w-full items-center gap-2 px-3 py-2 rounded-md text-[13px] font-medium transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]">
                                                Account Settings
                                            </Link>
                                            <button onClick={() => { setShowUserMenu(false); logout(); }}
                                                className="flex w-full items-center gap-2 px-3 py-2 rounded-md text-[13px] font-medium transition-all hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-400 mt-1">
                                                <LogOut size={14} /> Sign out
                                            </button>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.aside>

            {/* ─── MAIN CONTENT ─── */}
            <main className="flex-1 h-full overflow-hidden flex flex-col pt-14 md:pt-0">


                <div className="flex-1 overflow-auto custom-scrollbar relative z-[1]">
                    <div className="h-full max-w-[1280px] mx-auto px-4 md:px-7 py-6">
                        <motion.div key={pathname}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
                            className="h-full flex flex-col">
                            {children}
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}
