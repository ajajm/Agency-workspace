"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FileText, Clock } from 'lucide-react';

export default function ReportsPage() {
    const [reports, setReports] = useState([]);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/reports');
                setReports(res.data);
            } catch (err) { console.error(err); }
        };
        fetchReports();
    }, []);

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex-shrink-0">
                <h2 className="text-[18px] font-bold text-zinc-100 tracking-tight">My Reports</h2>
                <p className="text-[12px] text-zinc-500 mt-0.5">Review your compiled daily reports.</p>
            </div>

            {reports.length === 0 ? (
                <div className="rounded-xl border p-12 text-center" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--bg-tertiary)' }}>
                        <FileText size={20} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>No reports yet</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Compile your day on the Overview page.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reports.map(report => (
                        <motion.div key={report.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                            className="rounded-xl border overflow-hidden shadow-sm transition-colors hover:border-blue-500/30"
                            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
                        >
                            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
                                <h3 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    {new Date(report.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                </h3>
                                <div className="flex items-center gap-2">
                                    {report.work_start_time && (
                                        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                            <Clock size={12} /> {new Date(report.work_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                    {report.punch_out_time && (
                                        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                                            <Clock size={12} /> {new Date(report.punch_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left: Tasks */}
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Tasks Completed</p>
                                    {report.compiledTasks && report.compiledTasks.length > 0 ? (
                                        <ul className="space-y-1.5">
                                            {report.compiledTasks.map((task, idx) => (
                                                <li key={task?.id || idx} className="flex items-start gap-2 text-[13px] leading-tight group">
                                                    <span className="text-[var(--brand)] mt-[3px] select-none text-[10px]">●</span>
                                                    <div className="flex-1 min-w-0">
                                                        <span style={{ color: 'var(--text-secondary)' }} className="group-hover:text-[var(--text-primary)] transition-colors">
                                                            {task?.task}
                                                        </span>
                                                        {task?.time_spent && <span className="ml-1.5 text-[10px] font-medium text-[var(--brand)] opacity-80">({task.time_spent}m)</span>}
                                                        {task?.notes && <p className="text-[11px] mt-0.5 italic" style={{ color: 'var(--text-muted)' }}>{task.notes}</p>}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-[12px] italic" style={{ color: 'var(--text-muted)' }}>No logs recorded.</p>
                                    )}
                                </div>

                                {/* Right: Todos */}
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Linked Todos</p>
                                    {report.todosForNextDay && report.todosForNextDay.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5">
                                            {report.todosForNextDay.map((t, i) => (
                                                <span key={i} className="text-[11px] font-medium px-2 py-0.5 rounded-md border text-[var(--text-secondary)] border-[var(--border-subtle)] bg-[var(--bg-tertiary)] hover:bg-[var(--bg-elevated)] transition-colors truncate max-w-[220px]">
                                                    {t?.title}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-[12px] italic" style={{ color: 'var(--text-muted)' }}>None linked.</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
