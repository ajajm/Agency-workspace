"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Play, Plus, Search, Trash2, Clock, Calendar, Check, Square, ListTodo, Circle, CheckCircle } from 'lucide-react';
import { useToast } from '../../components/Toast';

export default function DashboardOverview() {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [pendingTodos, setPendingTodos] = useState([]);
    const [taskDesc, setTaskDesc] = useState('');
    const [timeSpent, setTimeSpent] = useState('');
    const [notes, setNotes] = useState('');
    const [editingLogId, setEditingLogId] = useState(null);
    const toast = useToast();

    useEffect(() => {
        fetchOverviewData();
        const interval = setInterval(fetchOverviewData, 30000);
        
        const handlePunchUpdate = () => fetchOverviewData();
        window.addEventListener('punch-updated', handlePunchUpdate);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('punch-updated', handlePunchUpdate);
        };
    }, []);

    const fetchOverviewData = async () => {
        try {
            const [logsRes, todosRes] = await Promise.all([
                axios.get('http://localhost:5000/api/worklogs/today'),
                axios.get('http://localhost:5000/api/todos')
            ]);
            
            const rawLogs = logsRes.data || [];
            const rawTodos = todosRes.data || [];
            
            // Filter active todos
            const activeTodos = rawTodos.filter(t => t.status !== 'Completed');
            setPendingTodos(activeTodos);

            // Filter completed todos for today
            const todayStr = new Date().toISOString().split('T')[0];
            const completedToday = rawTodos.filter(t => t.status === 'Completed' && t.updated_at && t.updated_at.startsWith(todayStr));

            // Format completed todos into "activity logs" format
            const todoLogs = completedToday.map(t => ({
                id: `todo-${t.id}`,
                task: t.title,
                notes: t.notes,
                created_at: t.updated_at,
                is_todo: true,
                todo_id: t.id
            }));

            // Merge and sort
            const mergedActivity = [...rawLogs, ...todoLogs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setLogs(mergedActivity);

        } catch (err) { console.error(err); }
    };

    const toggleTodoStatus = async (id, currentStatus) => {
        try {
            await axios.put(`http://localhost:5000/api/todos/${id}/status`, { status: currentStatus === 'Completed' ? 'Pending' : 'Completed' });
            fetchOverviewData();
        } catch (err) { console.error('Failed to toggle todo'); }
    };

    const handleQuickLog = async (e) => {
        e.preventDefault();
        try {
            const body = { task: taskDesc, timeSpent: timeSpent ? parseInt(timeSpent) : null, notes };
            if (editingLogId) {
                await axios.put(`http://localhost:5000/api/worklogs/${editingLogId}`, body);
                toast.success('Updated');
            } else {
                await axios.post('http://localhost:5000/api/worklogs', body);
                toast.success('Entry logged');
            }
            cancelEdit();
            fetchOverviewData();
        } catch (err) { toast.error('Error saving entry'); }
    };

    const handleDeleteLog = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/worklogs/${id}`);
            toast.success('Deleted');
            if (editingLogId === id) cancelEdit();
            fetchOverviewData();
        } catch (err) { toast.error('Error deleting entry'); }
    };

    const startEditLog = (log) => {
        setEditingLogId(log.id);
        setTaskDesc(log.task);
        setTimeSpent(log.time_spent || '');
        setNotes(log.notes || '');
    };

    const cancelEdit = () => { setEditingLogId(null); setTaskDesc(''); setTimeSpent(''); setNotes(''); };

    const compileReport = async () => {
        try {
            await axios.post('http://localhost:5000/api/reports/generate');
            toast.success('Report compiled');
            fetchOverviewData();
        } catch (err) { toast.error(err.response?.data?.msg || 'Compile error'); }
    };

    const inputCls = "w-full rounded-lg px-3 py-2.5 text-[13px] transition-all placeholder:text-[var(--text-muted)]";
    const inputStyle = { background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' };

    return (
        <div className="flex flex-col gap-5 h-full">

            {/* ─── Header ─── */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <h1 className="text-[20px] font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                        Overview
                    </h1>
                    <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* ─── Two-column grid ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 flex-1 min-h-0">

                {/* LEFT COLUMN */}
                <div className="flex flex-col gap-5 self-start w-full">
                    
                    {/* Active Tasks Widget */}
                    <div className="n8n-card flex flex-col">
                        <div className="n8n-card-header bg-[var(--bg-secondary)] shadow-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(96,165,250,0.1)' }}><ListTodo size={13} style={{ color: 'var(--accent-blue)' }} /></div>
                                <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>Your Tasks</span>
                            </div>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>{pendingTodos.length}</span>
                        </div>
                        <div className="n8n-card-body p-0 max-h-[190px] overflow-y-auto custom-scrollbar divide-y divide-[var(--border-subtle)]">
                            {pendingTodos.length === 0 ? (
                                <p className="p-5 text-center text-[12px] italic" style={{ color: 'var(--text-muted)' }}>No active tasks.</p>
                            ) : pendingTodos.map(todo => (
                                <div key={todo.id} className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--bg-tertiary)] transition-colors group">
                                    <button onClick={() => toggleTodoStatus(todo.id, todo.status)} className="mt-0.5 flex-shrink-0 active:scale-90 transition-transform">
                                        <Circle size={15} className="text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors" strokeWidth={1.8} />
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[12px] font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>{todo.title}</p>
                                        {todo.deadline && <p className="text-[9px] mt-1 text-orange-500 font-bold tracking-wider uppercase">{new Date(todo.deadline).toLocaleDateString()}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* New Entry */}
                    <div className="n8n-card flex flex-col">
                        <div className="n8n-card-header bg-[var(--bg-secondary)] shadow-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-[var(--brand-muted)]">
                                    {editingLogId ? <Pencil size={12} className="text-[var(--brand)]" /> : <Plus size={12} className="text-[var(--brand)]" />}
                                </div>
                                <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    {editingLogId ? 'Edit Entry' : 'Manual Entry'}
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleQuickLog} className="n8n-card-body space-y-4">
                            <div>
                                <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Task</label>
                                <input className={inputCls} style={inputStyle} placeholder="What did you work on?" value={taskDesc} onChange={e => setTaskDesc(e.target.value)} required />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Time (Min)</label>
                                    <input type="number" className={inputCls} style={inputStyle} placeholder="Optional" value={timeSpent} onChange={e => setTimeSpent(e.target.value)} min="1" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Notes</label>
                                <textarea className={`${inputCls} min-h-[60px] resize-none`} style={inputStyle} placeholder="Blockers, insights..." value={notes} onChange={e => setNotes(e.target.value)} />
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" className="btn-brand flex-1">
                                    {editingLogId ? 'Update Entry' : 'Save Entry'}
                                </button>
                                {editingLogId && (
                                    <button type="button" onClick={cancelEdit} className="btn-secondary px-3">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* RIGHT — Activity Log */}
                <div className="n8n-card flex flex-col h-full overflow-hidden">
                    <div className="n8n-card-header bg-[var(--bg-secondary)] relative z-10 shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-[var(--brand-muted)]">
                                <Search size={12} className="text-[var(--brand)]" />
                            </div>
                            <div>
                                <span className="text-[13px] font-semibold block" style={{ color: 'var(--text-primary)' }}>Today's Activity</span>
                                <span className="text-[10px] block" style={{ color: 'var(--text-muted)' }}>{logs.length} entries</span>
                            </div>
                        </div>
                        <button onClick={compileReport} className="btn-secondary">
                            <Check size={11} strokeWidth={2.5} /> Compile
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
                        {logs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full opacity-60">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                                    <Clock size={18} className="text-[var(--text-muted)]" />
                                </div>
                                <p className="text-[13px] font-medium" style={{ color: 'var(--text-muted)' }}>No activities logged yet</p>
                            </div>
                        ) : (
                            logs.map((log) => (
                                <div key={log.id} className="relative pl-6">
                                    {/* Timeline line */}
                                    <div className="absolute left-[9px] top-5 bottom-[-20px] w-px bg-[var(--border-subtle)] last:hidden" />
                                    {/* Timeline node */}
                                    <div className={`absolute left-0 top-1 w-5 h-5 rounded-full flex items-center justify-center bg-[var(--bg-secondary)] border-2 z-10 shadow-sm ${log.is_todo ? 'border-emerald-500 shadow-emerald-500/20' : 'border-[var(--brand)] shadow-blue-500/20'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${log.is_todo ? 'bg-emerald-500' : 'bg-[var(--brand)]'}`} />
                                    </div>

                                    <div className="bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg p-3 hover:border-[var(--border)] transition-colors group relative overflow-hidden">
                                        <div className="flex justify-between items-start">
                                            <div className="pr-12">
                                                <p className="text-[13px] font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>
                                                    {log.is_todo ? <span className="line-through opacity-70 mr-1.5">{log.task}</span> : log.task}
                                                </p>
                                                <div className="flex items-center gap-2 flex-wrap mt-1">
                                                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    {log.is_todo && (
                                                        <span className="text-[9px] font-bold px-1.5 py-[1px] rounded" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-green)', border: '1px solid rgba(16,185,129,0.2)' }}>
                                                            Task Completed
                                                        </span>
                                                    )}
                                                    {log.punch_log_id && (
                                                        <span className="text-[9px] font-bold px-1.5 py-[1px] rounded" style={{ background: 'rgba(234, 179, 8, 0.1)', color: 'var(--accent-yellow)', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
                                                            Punch Entry
                                                        </span>
                                                    )}
                                                </div>
                                                {log.notes && <p className="text-[11px] mt-1.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{log.notes}</p>}
                                                {log.time_spent && (
                                                    <span className="inline-flex mt-2 items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--brand)' }}>
                                                        <Clock size={9} /> {log.time_spent}m
                                                    </span>
                                                )}
                                            </div>

                                            {/* Hover Actions */}
                                            {!log.is_todo && (
                                                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--bg-elevated)] p-1 rounded-md border border-[var(--border)] shadow-sm">
                                                    <button onClick={() => startEditLog(log)} className="p-1 hover:bg-[var(--bg-tertiary)] rounded text-[var(--text-muted)] hover:text-blue-400" title="Edit">
                                                        <Pencil size={12} />
                                                    </button>
                                                    <button onClick={() => handleDeleteLog(log.id)} className="p-1 hover:bg-[var(--bg-tertiary)] rounded text-[var(--text-muted)] hover:text-red-400" title="Delete">
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
