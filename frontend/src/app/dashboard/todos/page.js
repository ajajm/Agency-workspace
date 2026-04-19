"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Circle, Clock, Pencil, Trash2, X, Save, Plus, ListTodo } from 'lucide-react';

export default function TodosPage() {
    const [todos, setTodos] = useState([]);
    const { user } = useAuth();
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', notes: '', deadline: '' });
    const [showNew, setShowNew] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newNotes, setNewNotes] = useState('');

    useEffect(() => { fetchTodos(); }, []);

    const fetchTodos = async () => {
        try { const res = await axios.get('http://localhost:5000/api/todos'); setTodos(res.data); }
        catch (err) { console.error(err); }
    };

    const toggleStatus = async (id, s) => {
        try { await axios.put(`http://localhost:5000/api/todos/${id}/status`, { status: s === 'Completed' ? 'Pending' : 'Completed' }); fetchTodos(); }
        catch (err) { console.error(err); }
    };

    const startEdit = (t) => { setEditingId(t.id); setEditForm({ title: t.title, notes: t.notes || '', deadline: t.deadline ? t.deadline.split('T')[0] : '' }); };
    const saveEdit = async () => { try { await axios.put(`http://localhost:5000/api/todos/${editingId}`, editForm); setEditingId(null); fetchTodos(); } catch { } };
    const deleteTodo = async (id) => { if (!confirm('Delete this todo?')) return; try { await axios.delete(`http://localhost:5000/api/todos/${id}`); fetchTodos(); } catch { } };
    const createTodo = async (e) => { e.preventDefault(); try { await axios.post('http://localhost:5000/api/todos', { title: newTitle, notes: newNotes, assignedTo: user.id }); setNewTitle(''); setNewNotes(''); setShowNew(false); fetchTodos(); } catch { } };

    const inputCls = "w-full rounded-lg px-3 py-2.5 text-[13px] transition-all";
    const inputStyle = { background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' };
    const pending = todos.filter(t => t.status !== 'Completed');
    const completed = todos.filter(t => t.status === 'Completed');

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex justify-between items-center flex-shrink-0">
                <div>
                    <h1 className="text-[20px] font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Tasks</h1>
                    <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{pending.length} pending · {completed.length} completed</p>
                </div>
                <button onClick={() => setShowNew(!showNew)} className="btn-brand">
                    <Plus size={13} /> Add Task
                </button>
            </div>

            <AnimatePresence>
                {showNew && (
                    <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        onSubmit={createTodo} className="n8n-card p-5 space-y-3 overflow-hidden">
                        <input className={inputCls} style={inputStyle} placeholder="What needs to be done?" value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
                        <textarea className={`${inputCls} min-h-[50px] resize-none`} style={inputStyle} placeholder="Notes..." value={newNotes} onChange={e => setNewNotes(e.target.value)} />
                        <div className="flex gap-2 justify-end">
                            <button type="button" onClick={() => setShowNew(false)} className="btn-ghost">Cancel</button>
                            <button type="submit" className="btn-brand">Create</button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 flex-1 min-h-0">
                {/* Active */}
                <div className="n8n-card overflow-hidden flex flex-col h-full">
                    <div className="n8n-card-header flex-shrink-0 bg-[var(--bg-secondary)] shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(96,165,250,0.1)' }}><ListTodo size={13} style={{ color: 'var(--accent-blue)' }} /></div>
                            <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>Active Tasks</span>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>{pending.length}</span>
                    </div>

                    <div className="overflow-y-auto custom-scrollbar flex-1">
                        {pending.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-10 opacity-70 h-full">
                                <div className="w-14 h-14 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] flex items-center justify-center mx-auto mb-4"><CheckCircle size={24} className="text-[var(--text-muted)]" /></div>
                                <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>All caught up!</p>
                                <p className="text-[12px] font-medium mt-1" style={{ color: 'var(--text-muted)' }}>No active tasks remaining.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-[var(--border-subtle)]">
                                {pending.map((todo, idx) => {
                                    if (editingId === todo.id) {
                                        return (
                                            <div key={todo.id} className="p-4 bg-[var(--brand-muted)]">
                                                <input className={`${inputCls} mb-2 font-medium`} style={inputStyle} value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                                                <textarea className={`${inputCls} min-h-[40px] resize-none mb-2`} style={inputStyle} value={editForm.notes} onChange={e => setEditForm({...editForm, notes: e.target.value})} />
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => setEditingId(null)} className="p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] rounded transition-colors"><X size={13} /></button>
                                                    <button onClick={saveEdit} className="flex items-center gap-1 bg-[var(--brand)] text-white px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors hover:brightness-110"><Save size={11} /> Save</button>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return (
                                        <motion.div key={todo.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}
                                            className="flex items-start gap-3 px-5 py-3 hover:bg-[var(--bg-tertiary)] transition-colors group">
                                            <button onClick={() => toggleStatus(todo.id, todo.status)} className="mt-0.5 flex-shrink-0 active:scale-90 transition-transform">
                                                <Circle size={17} className="text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors" strokeWidth={1.6} />
                                            </button>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{todo.title}</p>
                                                {todo.notes && <p className="text-[11px] mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{todo.notes}</p>}
                                                {todo.deadline && (
                                                    <span className="inline-flex items-center gap-1 mt-1.5 text-[9px] font-bold text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">
                                                        <Clock size={9} /> {new Date(todo.deadline).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => startEdit(todo)} className="p-1.5 hover:bg-[var(--bg-secondary)] rounded-md transition-colors border border-transparent hover:border-[var(--border-subtle)]"><Pencil size={12} className="text-[var(--text-muted)]" /></button>
                                                <button onClick={() => deleteTodo(todo.id)} className="p-1.5 hover:bg-red-500/10 rounded-md transition-colors border border-transparent"><Trash2 size={12} className="text-[var(--accent-red)]" /></button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Completed */}
                <div className="n8n-card overflow-hidden flex flex-col h-full">
                    <div className="n8n-card-header flex-shrink-0 bg-[var(--bg-secondary)] shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.1)' }}><CheckCircle size={13} style={{ color: 'var(--accent-green)' }} /></div>
                            <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>Completed</span>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>{completed.length}</span>
                    </div>
                    <div className="overflow-y-auto custom-scrollbar flex-1 divide-y divide-[var(--border-subtle)]">
                        {completed.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-10 opacity-70 h-full">
                                <p className="text-[13px] font-medium" style={{ color: 'var(--text-muted)' }}>No completed tasks yet.</p>
                            </div>
                        ) : (
                            completed.map(todo => (
                                <div key={todo.id} className="flex items-center gap-3 px-5 py-2.5 opacity-60 group hover:opacity-100 transition-opacity bg-[var(--bg-tertiary)]">
                                    <button onClick={() => toggleStatus(todo.id, todo.status)} className="flex-shrink-0"><CheckCircle size={17} style={{ color: 'var(--accent-green)' }} strokeWidth={2} /></button>
                                    <p className="text-[13px] line-through flex-1 truncate" style={{ color: 'var(--text-secondary)' }}>{todo.title}</p>
                                    <button onClick={() => deleteTodo(todo.id)} className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded-md transition-all"><Trash2 size={11} className="text-[var(--accent-red)]" /></button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
