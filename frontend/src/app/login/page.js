"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Layers, LayoutGrid, Clock, Users, ShieldCheck } from 'lucide-react';

// Animated background elements using Isometric 3D transforms
function IsometricBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none perspective-[1000px]">
            {/* Soft global radial light */}
            <div className="absolute top-[20%] left-[25%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[10%] right-[20%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px]" />

            {/* Subtle tech grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.015)_1px,transparent_1px)] bg-[size:40px_40px]" />

            {/* Iso Element 1 - Top Left Layered Cards */}
            <div className="absolute top-[15%] left-[10%] iso-elem-1 transform-style-3d">
                <div className="relative w-48 h-64 bg-zinc-800/40 border border-white/10 rounded-xl shadow-[20px_20px_40px_rgba(0,0,0,0.4)] backdrop-blur-md flex flex-col p-4">
                    <div className="w-1/2 h-3 bg-white/20 rounded-full mb-4" />
                    <div className="w-full h-8 bg-blue-500/20 border border-blue-500/30 rounded-lg mb-2" />
                    <div className="w-3/4 h-8 bg-white/5 rounded-lg mb-2" />
                    <div className="w-full h-8 bg-white/5 rounded-lg" />
                </div>
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-blue-600/20 border border-blue-500/40 rounded-xl shadow-[10px_10px_20px_rgba(0,0,0,0.5)] backdrop-blur-lg flex items-center justify-center">
                    <LayoutGrid size={32} className="text-blue-400 opacity-80" />
                </div>
            </div>

            {/* Iso Element 2 - Bottom Right Dashboard Mockup */}
            <div className="absolute bottom-[20%] right-[10%] iso-elem-2 transform-style-3d">
                <div className="relative w-64 h-48 bg-zinc-900/60 border border-zinc-700/50 rounded-xl shadow-[30px_30px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl flex flex-col items-center justify-center p-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent rounded-xl" />
                    <div className="flex justify-between w-full mb-4">
                        <div className="w-10 h-10 rounded-full bg-white/10" />
                        <div className="flex gap-2">
                            <div className="w-6 h-6 rounded bg-white/10" />
                            <div className="w-6 h-6 rounded bg-white/10" />
                        </div>
                    </div>
                    <div className="flex gap-3 w-full">
                        <div className="w-1/3 h-16 rounded-lg bg-green-500/20 border border-green-500/30" />
                        <div className="w-1/3 h-16 rounded-lg bg-indigo-500/20 border border-indigo-500/30" />
                        <div className="w-1/3 h-16 rounded-lg bg-amber-500/20 border border-amber-500/30" />
                    </div>
                </div>
            </div>

            {/* Iso Element 3 - Floating Graph/Data Top Right */}
            <div className="absolute top-[20%] right-[20%] iso-elem-3 transform-style-3d">
                <div className="w-32 h-32 bg-indigo-600/10 border border-indigo-500/30 rounded-full shadow-[0_0_30px_rgba(99,102,241,0.2)] flex items-center justify-center backdrop-blur-sm">
                    <div className="w-24 h-24 border-[3px] border-indigo-400/50 rounded-full border-t-transparent animate-spin" style={{ animationDuration: '3s' }} />
                </div>
            </div>

            {/* Iso Element 4 - Bottom Left Metrics */}
            <div className="absolute bottom-[15%] left-[20%] iso-elem-3 transform-style-3d text-blue-400/40" style={{ animationDelay: '-4s' }}>
                <Clock size={64} />
            </div>

            {/* Fade out edges */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#09090b_80%)]" />
        </div>
    );
}

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { login } = useAuth();
    const toast = useToast();

    useEffect(() => { setMounted(true); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            toast.success('Welcome to the workspace');
        } catch (err) {
            setError(err.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>

            {/* Isometric Animated Background */}
            <IsometricBackground />

            {/* Center Content Hub */}
            <motion.div
                className="relative z-10 w-full max-w-md px-6"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="bg-[#121214]/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 lg:p-10 shadow-2xl relative overflow-hidden">
                    {/* Inner subtle glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-1 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

                    {/* Header */}
                    <div className="flex flex-col items-centertext-center mb-8">
                        <motion.div
                            className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-5 mx-auto shadow-inner"
                            initial={{ rotate: -15, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ type: 'spring', damping: 15, delay: 0.2 }}
                        >
                            <img src="/logo.svg" alt="LeappBee" className="w-7 h-7" />
                        </motion.div>
                        <h1 className="text-[26px] font-bold tracking-tight text-white text-center">
                            Welcome back
                        </h1>
                        <p className="text-[14px] text-zinc-400 mt-2 text-center">
                            Sign in to your corporate workspace
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-[12px] font-medium text-zinc-300 mb-2">Work Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-[14px] text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-zinc-600"
                                placeholder="name@company.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[12px] font-medium text-zinc-300 mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-[14px] text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-zinc-600"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2.5 text-[13px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                                <ShieldCheck size={16} />
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="relative w-full overflow-hidden bg-blue-600 hover:bg-blue-500 text-white font-medium py-3.5 rounded-xl text-[14px] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] group"
                        >
                            {/* Button shimmer */}
                            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />

                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                        Authenticating…
                                    </>
                                ) : (
                                    <>
                                        Continue to Dashboard <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </span>
                        </button>
                    </form>

                    {/* Footer features */}
                    <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-[11px] text-zinc-500 font-medium">
                        <div className="flex items-center gap-1.5 hover:text-zinc-300 transition-colors">
                            <Shield size={12} /> SSO Enabled
                        </div>
                        <div className="flex items-center gap-1.5 hover:text-zinc-300 transition-colors">
                            <Layers size={12} /> Enterprise SLA
                        </div>
                    </div>
                </div>

                <p className="text-center text-[12px] text-zinc-600 mt-6 font-medium">
                    Secure workspace platform · ISO 27001 Certified
                </p>
            </motion.div>
        </div>
    );
}
