"use client";
import { useState, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, Bell, Key, Globe, Monitor, Moon, Sun, MonitorSmartphone, Mail, Smartphone, Camera, Upload } from 'lucide-react';
import { useToast } from '../../../components/Toast';
import axios from 'axios';

export default function SettingsPage() {
    const { user, setUser } = useAuth();
    const toast = useToast();
    const [theme, setTheme] = useState('dark');
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [pushAlerts, setPushAlerts] = useState(true);
    const [twoFactor, setTwoFactor] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || null);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef(null);

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 3 * 1024 * 1024) { toast.error('Image must be under 3MB'); return; }
        
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const base64 = ev.target.result;
            setAvatarPreview(base64);
            setUploading(true);
            try {
                const res = await axios.post('http://localhost:5000/api/users/avatar', { avatar_url: base64 });
                if (setUser) setUser(prev => ({ ...prev, avatar_url: base64 }));
                toast.success('Profile photo updated!');
            } catch (err) {
                toast.error('Failed to upload photo');
            } finally {
                setUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSave = () => toast.success("Settings saved.");

    const toggle = (state) => `relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${state ? 'bg-amber-500' : 'bg-zinc-700'}`;
    const knob = (state) => `inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${state ? 'translate-x-4' : 'translate-x-1'}`;

    const sections = [
        {
            title: "Appearance", icon: Monitor, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20",
            description: "Personalize the interface theme.",
            content: (
                <div className="grid grid-cols-3 gap-2">
                    {[['light', Sun, 'Light'], ['dark', Moon, 'Dark'], ['system', MonitorSmartphone, 'System']].map(([k, Icon, label]) => (
                        <button key={k} onClick={() => setTheme(k)} className={`flex flex-col items-center gap-2 py-3 rounded-xl border transition-all ${theme === k ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'}`}>
                            <Icon size={18} /><span className="text-[11px] font-semibold">{label}</span>
                        </button>
                    ))}
                </div>
            )
        },
        {
            title: "Notifications", icon: Bell, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20",
            description: "Control how you receive alerts.",
            content: (
                <div className="space-y-2">
                    {[
                        [emailAlerts, setEmailAlerts, Mail, 'blue', 'Email Alerts', 'Daily summaries via email'],
                        [pushAlerts, setPushAlerts, Smartphone, 'emerald', 'Push Notifications', 'Real-time in-app alerts'],
                    ].map(([state, set, Icon, color, title, sub]) => (
                        <div key={title} className="flex items-center justify-between p-3 rounded-xl border border-zinc-800/60 bg-zinc-900/30 hover:bg-zinc-900/60 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 bg-${color}-500/10 text-${color}-400 rounded-lg`}><Icon size={14} /></div>
                                <div><p className="text-[13px] font-semibold text-zinc-200">{title}</p><p className="text-[10px] text-zinc-600">{sub}</p></div>
                            </div>
                            <button onClick={() => set(!state)} className={toggle(state)}><span className={knob(state)} /></button>
                        </div>
                    ))}
                </div>
            )
        },
        {
            title: "Security", icon: Shield, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20",
            description: "Manage authentication and access.",
            content: (
                <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-800/60 bg-zinc-900/30">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg"><Key size={14} /></div>
                            <div><p className="text-[13px] font-semibold text-zinc-200">Change Password</p><p className="text-[10px] text-zinc-600">Update your account credentials</p></div>
                        </div>
                        <button className="text-[11px] font-semibold text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 rounded-lg transition-colors border border-purple-500/20">Update</button>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-800/60 bg-zinc-900/30">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/10 text-red-400 rounded-lg"><Shield size={14} /></div>
                            <div><p className="text-[13px] font-semibold text-zinc-200">Two-Factor Auth</p><p className="text-[10px] text-zinc-600">Protect with Google Authenticator</p></div>
                        </div>
                        <button onClick={() => setTwoFactor(!twoFactor)} className={toggle(twoFactor)}><span className={knob(twoFactor)} /></button>
                    </div>
                </div>
            )
        },
        {
            title: "Localization", icon: Globe, color: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/20",
            description: "Set your region and language.",
            content: (
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">Timezone</label>
                        <select className="w-full bg-zinc-900/40 border border-zinc-800/60 rounded-xl px-3 py-2.5 text-[12px] text-zinc-200 outline-none">
                            <option>System Default</option><option>Asia/Kolkata (IST)</option><option>America/New_York (EST)</option><option>Europe/London (GMT)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">Language</label>
                        <select className="w-full bg-zinc-900/40 border border-zinc-800/60 rounded-xl px-3 py-2.5 text-[12px] text-zinc-200 outline-none">
                            <option>English (US)</option><option>Spanish (ES)</option><option>French (FR)</option>
                        </select>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="flex flex-col gap-5 h-full">
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <h1 className="text-[20px] font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Settings</h1>
                    <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Manage your profile, preferences and security.</p>
                </div>
                <button onClick={handleSave} className="btn-brand">
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
                {/* LEFT — PROFILE CARD */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    <div className="glass-card rounded-xl border border-zinc-800/60 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[50px] pointer-events-none" />
                        <div className="absolute top-2 right-2 w-16 h-16 border border-amber-500/8 rounded-lg" style={{ transform: 'rotate(20deg) skewX(-10deg)' }} />
                        
                        <div className="flex flex-col items-center text-center">
                            {/* AVATAR with upload */}
                            <div className="relative mb-4 group">
                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-zinc-700 to-zinc-900 border-2 border-zinc-800 text-zinc-300 flex items-center justify-center font-bold text-3xl shadow-xl overflow-hidden">
                                    {avatarPreview
                                        ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                                        : <span>{user?.name?.charAt(0)?.toUpperCase() || '?'}</span>
                                    }
                                </div>
                                <button onClick={() => fileRef.current?.click()}
                                    className={`absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-400 border-2 border-[#050505] flex items-center justify-center shadow-lg transition-colors ${uploading ? 'opacity-50 cursor-wait' : ''}`}>
                                    {uploading ? <div className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" /> : <Camera size={13} className="text-white" />}
                                </button>
                                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                            </div>

                            <h3 className="text-[15px] font-bold text-zinc-100 mb-0.5">{user?.name}</h3>
                            <p className="text-[11px] text-zinc-500 mb-3">{user?.email}</p>
                            <div className="flex flex-wrap gap-1 justify-center mb-4">
                                {(user?.role || 'Intern').split(', ').map(r => (
                                    <span key={r} className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">{r}</span>
                                ))}
                            </div>
                            <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 hover:text-amber-400 border border-zinc-800/60 hover:border-amber-500/30 px-3 py-1.5 rounded-lg transition-all">
                                <Upload size={11} /> Change Photo
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT — SETTINGS SECTIONS */}
                <div className="lg:col-span-8 overflow-y-auto custom-scrollbar space-y-3 pr-1">
                    {sections.map((section, idx) => (
                        <motion.div key={section.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}>
                            <div className="glass-card rounded-xl border border-zinc-800/60 overflow-hidden">
                                <div className="px-5 py-3.5 border-b border-zinc-800/40 bg-zinc-900/30 flex items-center gap-2.5">
                                    <div className={`p-1.5 rounded-lg border ${section.bg}`}><section.icon size={13} className={section.color} /></div>
                                    <div>
                                        <h3 className="text-[13px] font-bold text-zinc-200 leading-none">{section.title}</h3>
                                        <p className="text-[10px] text-zinc-600 mt-0.5">{section.description}</p>
                                    </div>
                                </div>
                                <div className="p-4">{section.content}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
