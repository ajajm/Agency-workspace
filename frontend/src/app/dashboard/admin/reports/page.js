"use client";
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Table, LayoutGrid, Clock, FileText, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

export default function AdminReportsPage() {
    const [reports, setReports] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(null);

    const getLocalDate = () => {
        const d = new Date();
        return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    };
    const [date, setDate] = useState(getLocalDate());
    const [viewMode, setViewMode] = useState('table');

    const fetchReports = useCallback(async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/reports/admin?date=${date}`);
            setReports(res.data);
            setLastUpdated(new Date());
        } catch (err) { console.error(err); }
    }, [date]);

    useEffect(() => {
        fetchReports();
        // Real-time: poll every 15s
        const interval = setInterval(fetchReports, 15000);
        return () => clearInterval(interval);
    }, [fetchReports]);

    const changeDate = (delta) => {
        const d = new Date(date);
        d.setDate(d.getDate() + delta);
        setDate(new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0]);
    };

    const fmt = (t) => t ? new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
    const fmtDate = (d) => new Date(d).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div className="flex flex-col h-full gap-5">
            {/* PAGE HEADER */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <h1 className="text-[20px] font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Team Reports</h1>
                    <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Daily activity & task records for all members.</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Date Nav */}
                    <div className="flex items-center bg-zinc-900/80 backdrop-blur rounded-lg border border-zinc-800/60 overflow-hidden">
                        <button onClick={() => changeDate(-1)} className="p-2 hover:bg-zinc-800/60 transition-colors text-zinc-400 hover:text-zinc-200"><ChevronLeft size={14} /></button>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-transparent text-[11px] font-semibold px-1 outline-none text-zinc-300 w-[105px] cursor-pointer" />
                        <button onClick={() => changeDate(1)} className="p-2 hover:bg-zinc-800/60 transition-colors text-zinc-400 hover:text-zinc-200"><ChevronRight size={14} /></button>
                    </div>
                    {/* View Toggle */}
                    <div className="flex bg-zinc-900/80 rounded-lg border border-zinc-800/60 p-0.5 gap-0.5">
                        <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-400'}`}><Table size={14} /></button>
                        <button onClick={() => setViewMode('kanban')} className={`p-1.5 rounded-md transition-all ${viewMode === 'kanban' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-400'}`}><LayoutGrid size={14} /></button>
                    </div>
                    {/* Refresh */}
                    <button onClick={fetchReports} className="p-2 rounded-lg border border-zinc-800/60 bg-zinc-900/80 text-zinc-500 hover:text-amber-400 hover:border-amber-500/30 transition-colors">
                        <RefreshCw size={14} />
                    </button>
                </div>
            </div>

            {/* Live badge */}
            <div className="flex items-center gap-2 flex-shrink-0 -mt-3">
                <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-400">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    Live — auto-refreshes every 15s
                </span>
                {lastUpdated && <span className="text-[10px] text-zinc-600">· last at {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>}
            </div>

            {/* CONTENT */}
            {reports.length === 0 ? (
                <div className="flex-1 flex items-start">
                    <div className="w-full bg-zinc-900/50 rounded-xl border border-zinc-800/60 p-16 text-center">
                        <FileText size={24} className="mx-auto mb-3 text-zinc-600" />
                        <p className="text-sm font-medium text-zinc-400">No reports found for {fmtDate(date + 'T00:00:00')}.</p>
                        <p className="text-[11px] text-zinc-600 mt-1">Team members haven't submitted their daily log yet.</p>
                    </div>
                </div>
            ) : viewMode === 'table' ? (
                <div className="flex-1 overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900/50 flex flex-col">
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 z-10 bg-[#0d0d10]">
                                <tr className="border-b border-zinc-800/60">
                                    <th className="text-left p-3.5 pl-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Member</th>
                                    <th className="text-left p-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Role</th>
                                    <th className="text-left p-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">In</th>
                                    <th className="text-left p-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Out</th>
                                    <th className="text-left p-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tasks Completed</th>
                                    <th className="text-left p-3.5 pr-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Next Todos</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/30">
                                {reports.map(r => (
                                    <tr key={r.id} className="hover:bg-zinc-800/20 transition-colors group">
                                        <td className="p-3.5 pl-5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 ring-2 ring-zinc-800">{r.user?.name?.charAt(0)?.toUpperCase()}</div>
                                                <span className="font-semibold text-zinc-200 text-[13px]">{r.user?.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-3.5"><span className="text-[10px] font-bold text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/40">{r.user?.role}</span></td>
                                        <td className="p-3.5"><span className="text-[12px] font-semibold text-emerald-400">{fmt(r.work_start_time)}</span></td>
                                        <td className="p-3.5"><span className="text-[12px] font-semibold text-orange-400">{fmt(r.punch_out_time)}</span></td>
                                        <td className="p-3.5 max-w-[240px]">
                                            <div className="space-y-1">
                                                {(r.compiledTasks || []).map((t, i) => (
                                                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-zinc-300">
                                                        <span className="mt-[5px] w-1 h-1 rounded-full bg-blue-400 flex-shrink-0" />
                                                        <span className="truncate">{t?.task}{t?.time_spent ? <span className="ml-1 text-[9px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">{t.time_spent}m</span> : null}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-3.5 pr-5 max-w-[180px]">
                                            <div className="space-y-1">
                                                {(r.todosForNextDay || []).map((t, i) => (
                                                    <span key={i} className="flex items-center gap-1 text-[10px] text-amber-400">
                                                        <span className="w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" />
                                                        <span className="truncate">{t?.title}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                        {reports.map(r => (
                            <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-zinc-900/60 rounded-xl border border-zinc-800/60 p-4 hover:border-zinc-700/60 transition-colors"
                            >
                                <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-zinc-800/40">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">{r.user?.name?.charAt(0)?.toUpperCase()}</div>
                                    <div>
                                        <p className="text-[13px] font-semibold text-zinc-200">{r.user?.name}</p>
                                        <p className="text-[10px] text-zinc-500">{r.user?.role}</p>
                                    </div>
                                    <div className="ml-auto flex gap-1.5 text-[10px]">
                                        <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">{fmt(r.work_start_time)}</span>
                                        <span className="text-orange-400 font-semibold bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">{fmt(r.punch_out_time)}</span>
                                    </div>
                                </div>
                                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">Tasks</p>
                                <div className="space-y-1 mb-3">
                                    {(r.compiledTasks || []).map((t, i) => (
                                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-zinc-300">
                                            <span className="mt-[5px] w-1 h-1 rounded-full bg-blue-400 flex-shrink-0" />
                                            <span>{t?.task}{t?.time_spent && <span className="ml-1 text-[9px] font-bold text-blue-400 bg-blue-500/10 px-1 py-0.5 rounded">{t.time_spent}m</span>}</span>
                                        </div>
                                    ))}
                                </div>
                                {(r.todosForNextDay || []).length > 0 && (
                                    <>
                                        <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">Next Todos</p>
                                        <div className="space-y-1">
                                            {r.todosForNextDay.map((t, i) => (
                                                <div key={i} className="flex items-center gap-1.5 text-[10px] text-amber-400">
                                                    <span className="w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" />
                                                    {t?.title}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
