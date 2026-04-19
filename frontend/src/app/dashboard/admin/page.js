"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Pencil, Trash2, Save, Send, CheckSquare, Users, Shield, Activity, ChevronDown } from 'lucide-react';
import { useToast } from '../../../components/Toast';

const ROLES = ['Founder', 'Admin', 'Manager', 'Project Manager', 'Script Writer', 'Editor', 'Core Team', 'Intern'];
const ROLE_COLORS = {
    'Founder': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    'Admin': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Manager': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Project Manager': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    'Script Writer': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Editor': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'Core Team': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    'Intern': 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};

const inp = "w-full bg-[#0d0d10] border border-zinc-800/80 rounded-lg px-3.5 py-2.5 text-[13px] text-zinc-200 placeholder:text-zinc-600 transition-all hover:border-zinc-700/60 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/15 outline-none";
const lbl = "block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5";

export default function AdminPage() {
    const [users, setUsers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', password: '', roles: ['Intern'] });
    const [activeTab, setActiveTab] = useState('task'); // 'task' | 'notify'
    const toast = useToast();

    // Task state
    const [todoTitle, setTodoTitle] = useState('');
    const [todoNotes, setTodoNotes] = useState('');
    const [todoAssignMode, setTodoAssignMode] = useState('user');
    const [todoAssignedUser, setTodoAssignedUser] = useState('');
    const [todoAssignedRole, setTodoAssignedRole] = useState('Editor');
    const [todoDeadline, setTodoDeadline] = useState('');

    // Notify state
    const [notifTitle, setNotifTitle] = useState('');
    const [notifAssignMode, setNotifAssignMode] = useState('user');
    const [notifAssignedUser, setNotifAssignedUser] = useState('');
    const [notifAssignedRole, setNotifAssignedRole] = useState('Founder');

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/api/users');
            setUsers(res.data.sort((a, b) => ROLES.indexOf(a.role?.split(', ')[0]) - ROLES.indexOf(b.role?.split(', ')[0])));
        } catch (err) { console.error(err); }
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        try {
            const roleStr = form.roles.join(', ');
            if (editingUser) {
                const body = { name: form.name, email: form.email, role: roleStr };
                if (form.password) body.password = form.password;
                await axios.put(`/api/users/${editingUser.id}`, body);
                toast.success('User updated');
            } else {
                await axios.post('/api/users', { ...form, role: roleStr });
                toast.success('User created');
            }
            setForm({ name: '', email: '', password: '', roles: ['Intern'] });
            setEditingUser(null); setShowForm(false);
            fetchUsers();
        } catch (err) { toast.error('Failed to save user'); }
    };

    const handleDeleteUser = async (id) => {
        try { await axios.delete(`/api/users/${id}`); toast.success('User deleted'); fetchUsers(); }
        catch (err) { toast.error('Failed to delete user'); }
    };

    const startEdit = (user) => {
        setEditingUser(user);
        setForm({ name: user.name, email: user.email, password: '', roles: user.role ? user.role.split(', ') : ['Intern'] });
        setShowForm(true);
    };

    const handleCreateTodo = async (e) => {
        e.preventDefault();
        try {
            const body = { title: todoTitle, notes: todoNotes };
            if (todoDeadline) body.deadline = todoDeadline;
            if (todoAssignMode === 'user') body.assignedTo = todoAssignedUser;
            else body.assignedRole = todoAssignedRole;
            await axios.post('/api/todos', body);
            try {
                await axios.post('/api/notifications', {
                    title: `New Task: ${todoTitle}`,
                    user_id: todoAssignMode === 'user' ? todoAssignedUser : null,
                    role: todoAssignMode === 'role' ? todoAssignedRole : null
                });
            } catch (_) {}
            setTodoTitle(''); setTodoNotes(''); setTodoDeadline('');
            toast.success('Task assigned!');
        } catch (err) { toast.error('Failed to create task'); }
    };

    const handleCreateNotification = async (e) => {
        e.preventDefault();
        try {
            const body = { title: notifTitle };
            if (notifAssignMode === 'user') body.user_id = notifAssignedUser;
            else body.role = notifAssignedRole;
            await axios.post('/api/notifications', body);
            setNotifTitle('');
            toast.success('Notification sent!');
        } catch (err) { toast.error('Failed to send notification'); }
    };

    // Custom dropdown
    const Dropdown = ({ value, onChange, options, placeholder }) => {
        const [open, setOpen] = useState(false);
        const selected = options.find(o => o.value === value);
        return (
            <div className="relative z-20">
                <div onClick={() => setOpen(!open)}
                    className={`${inp} cursor-pointer flex items-center justify-between`}>
                    <span className={selected?.value ? 'text-zinc-200' : 'text-zinc-500'}>
                        {selected?.value ? selected.label : (placeholder || 'Select...')}
                    </span>
                    <ChevronDown size={13} className={`text-zinc-600 transition-transform ${open ? 'rotate-180' : ''}`} />
                </div>
                <AnimatePresence>
                    {open && (
                        <>
                            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
                            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                                className="absolute top-[calc(100%+4px)] left-0 right-0 bg-[#101013] border border-zinc-800 rounded-xl shadow-2xl shadow-black/60 z-40 overflow-hidden"
                                style={{ maxHeight: 220, overflowY: 'auto' }}
                            >
                                {options.map(o => (
                                    <div key={o.value} onClick={() => { onChange(o.value); setOpen(false); }}
                                        className={`px-4 py-2.5 text-[12px] cursor-pointer border-b border-zinc-800/40 last:border-0 transition-colors ${value === o.value ? 'bg-amber-500/10 text-amber-400' : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100'}`}>
                                        {o.label}
                                    </div>
                                ))}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const adminCount = users.filter(u => u.role?.includes('Admin') || u.role?.includes('Founder')).length;
    const internCount = users.filter(u => u.role?.includes('Intern')).length;

    return (
        <div className="flex flex-col gap-5 h-full">
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <h1 className="text-[20px] font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Admin Panel</h1>
                    <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Manage team members, assign tasks, and broadcast alerts.</p>
                </div>
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 flex-1 min-h-0">

                {/* LEFT — TEAM MEMBERS (3 cols) */}
                <div className="lg:col-span-3 flex flex-col min-h-0">
                    <div className="n8n-card flex flex-col overflow-hidden h-full">
                        <div className="px-5 py-3.5 border-b border-zinc-800/40 bg-zinc-900/30 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                    <Users size={12} className="text-blue-400" />
                                </div>
                                <h3 className="text-[13px] font-semibold text-zinc-200">Team Members</h3>
                                <span className="text-[10px] font-bold text-zinc-600 bg-zinc-800/60 px-2 py-0.5 rounded-full">{users.length}</span>
                            </div>
                            <motion.button whileTap={{ scale: 0.97 }}
                                onClick={() => { setShowForm(!showForm); setEditingUser(null); setForm({ name: '', email: '', password: '', roles: ['Intern'] }); }}
                                className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-400 text-white px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors shadow-lg shadow-blue-500/20">
                                <UserPlus size={12} /> Add Member
                            </motion.button>
                        </div>

                        {/* ADD / EDIT FORM */}
                        <AnimatePresence>
                            {showForm && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                    style={{ overflow: 'hidden' }} className="flex-shrink-0">
                                    <form onSubmit={handleSaveUser} className="px-5 py-4 bg-zinc-900/50 border-b border-zinc-800/50 space-y-3">
                                        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">{editingUser ? 'Edit Member' : 'New Member'}</p>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div><label className={lbl}>Name</label><input className={inp} placeholder="Full name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                                            <div><label className={lbl}>Email</label><input type="email" className={inp} placeholder="name@leappbee.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
                                            <div><label className={lbl}>Password</label><input type="password" className={inp} placeholder={editingUser ? "Leave blank to keep" : "Set password"} value={form.password} onChange={e => setForm({...form, password: e.target.value})} {...(!editingUser && { required: true })} /></div>
                                        </div>
                                        <div>
                                            <label className={lbl}>Roles <span className="normal-case text-zinc-700">(select one or more)</span></label>
                                            <div className="flex flex-wrap gap-1.5 mt-1">
                                                {ROLES.map(r => (
                                                    <button type="button" key={r} onClick={() => setForm(prev => {
                                                        let roles = [...prev.roles];
                                                        if (roles.includes(r)) roles = roles.filter(x => x !== r);
                                                        else roles.push(r);
                                                        return { ...prev, roles: roles.length ? roles : ['Intern'] };
                                                    })} className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-all ${form.roles.includes(r) ? ROLE_COLORS[r] : 'bg-transparent border-zinc-800 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400'}`}>
                                                        {r}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2 pt-1 border-t border-zinc-800/40">
                                            <button type="button" onClick={() => { setShowForm(false); setEditingUser(null); }} className="px-3 py-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors">Cancel</button>
                                            <button type="submit" className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-[11px] font-semibold transition-colors">
                                                <Save size={11} /> {editingUser ? 'Update Member' : 'Create Member'}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* TABLE HEADER */}
                        <div className="grid grid-cols-12 px-5 py-2 bg-zinc-900/40 border-b border-zinc-800/40 flex-shrink-0">
                            <span className="col-span-5 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Member</span>
                            <span className="col-span-4 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Roles</span>
                            <span className="col-span-3 text-[9px] font-bold text-zinc-600 uppercase tracking-widest text-right">Actions</span>
                        </div>

                        {/* USER LIST */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-zinc-800/30">
                            {users.length === 0 ? (
                                <div className="flex items-center justify-center h-32 text-[12px] text-zinc-600">No team members yet.</div>
                            ) : users.map((u, idx) => (
                                <motion.div key={u.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}
                                    className="grid grid-cols-12 items-center px-5 py-3 hover:bg-zinc-800/20 transition-colors group">
                                    <div className="col-span-5 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-800 border border-zinc-700/60 text-zinc-300 flex items-center justify-center font-bold text-[11px] flex-shrink-0 overflow-hidden">
                                            {u.avatar_url
                                                ? <img src={u.avatar_url} alt={u.name} className="w-full h-full object-cover" />
                                                : u.name.charAt(0).toUpperCase()
                                            }
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[13px] font-semibold text-zinc-200 truncate">{u.name}</p>
                                            <p className="text-[10px] text-zinc-600 truncate">{u.email}</p>
                                        </div>
                                    </div>
                                    <div className="col-span-4 flex flex-wrap gap-1">
                                        {(u.role || 'Intern').split(', ').slice(0, 2).map(r => (
                                            <span key={r} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${ROLE_COLORS[r] || ROLE_COLORS['Intern']}`}>{r}</span>
                                        ))}
                                        {(u.role || '').split(', ').length > 2 && (
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md border border-zinc-700/40 text-zinc-500">+{(u.role || '').split(', ').length - 2}</span>
                                        )}
                                    </div>
                                    <div className="col-span-3 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startEdit(u)} className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-md transition-colors">
                                            <Pencil size={10} /> Edit
                                        </button>
                                        <button onClick={() => handleDeleteUser(u.id)} className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md transition-colors">
                                            <Trash2 size={10} /> Del
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT — ACTIONS (2 cols) */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    {/* TAB SWITCHER */}
                    <div className="flex bg-zinc-900/60 rounded-xl border border-zinc-800/60 p-1 gap-1 flex-shrink-0">
                        <button onClick={() => setActiveTab('task')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold transition-all ${activeTab === 'task' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}>
                            <CheckSquare size={12} /> Assign Task
                        </button>
                        <button onClick={() => setActiveTab('notify')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold transition-all ${activeTab === 'notify' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}>
                            <Send size={12} /> Push Alert
                        </button>
                    </div>

                    {/* ASSIGN TASK FORM */}
                    <AnimatePresence mode="wait">
                        {activeTab === 'task' && (
                            <motion.div key="task" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                                className="glass-card rounded-xl border border-zinc-800/60 overflow-visible flex-1">
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent rounded-t-xl" />
                                <form onSubmit={handleCreateTodo} className="p-5 space-y-4">
                                    <div>
                                        <label className={lbl}>Task Title</label>
                                        <input className={inp} placeholder="e.g. Edit the Q3 reel" value={todoTitle} onChange={e => setTodoTitle(e.target.value)} required />
                                    </div>
                                    <div>
                                        <label className={lbl}>Notes (optional)</label>
                                        <textarea className={`${inp} resize-none min-h-[60px]`} placeholder="Extra context..." value={todoNotes} onChange={e => setTodoNotes(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={lbl}>Assign To</label>
                                        <div className="flex bg-zinc-900/80 rounded-lg border border-zinc-800/60 p-0.5 gap-0.5 mb-2">
                                            <button type="button" onClick={() => setTodoAssignMode('user')}
                                                className={`flex-1 py-1.5 rounded-md text-[11px] font-semibold transition-all ${todoAssignMode === 'user' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' : 'text-zinc-600 hover:text-zinc-400'}`}>
                                                Specific User
                                            </button>
                                            <button type="button" onClick={() => setTodoAssignMode('role')}
                                                className={`flex-1 py-1.5 rounded-md text-[11px] font-semibold transition-all ${todoAssignMode === 'role' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' : 'text-zinc-600 hover:text-zinc-400'}`}>
                                                Entire Role
                                            </button>
                                        </div>
                                        {todoAssignMode === 'user' ? (
                                            <Dropdown placeholder="Select a team member..." value={todoAssignedUser} onChange={setTodoAssignedUser}
                                                options={[{ value: '', label: 'Select a team member...' }, ...users.map(u => ({ value: u.id, label: `${u.name} (${u.role?.split(', ')[0]})` }))]} />
                                        ) : (
                                            <Dropdown value={todoAssignedRole} onChange={setTodoAssignedRole}
                                                options={ROLES.map(r => ({ value: r, label: r }))} />
                                        )}
                                    </div>
                                    <div>
                                        <label className={lbl}>Deadline (optional)</label>
                                        <input type="date" className={inp} value={todoDeadline} onChange={e => setTodoDeadline(e.target.value)} />
                                    </div>
                                    <motion.button type="submit" whileTap={{ scale: 0.98 }}
                                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold py-2.5 rounded-lg text-[12px] transition-all shadow-lg shadow-orange-500/15 flex items-center justify-center gap-2">
                                        <CheckSquare size={13} /> Assign Task
                                    </motion.button>
                                </form>
                            </motion.div>
                        )}

                        {activeTab === 'notify' && (
                            <motion.div key="notify" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                                className="glass-card rounded-xl border border-zinc-800/60 overflow-visible flex-1">
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent rounded-t-xl" />
                                <form onSubmit={handleCreateNotification} className="p-5 space-y-4">
                                    <div>
                                        <label className={lbl}>Alert Message</label>
                                        <textarea className={`${inp} resize-none min-h-[80px]`} placeholder="e.g. Server maintenance tonight at 11 PM. Save your work." value={notifTitle} onChange={e => setNotifTitle(e.target.value)} required />
                                    </div>
                                    <div>
                                        <label className={lbl}>Send To</label>
                                        <div className="flex bg-zinc-900/80 rounded-lg border border-zinc-800/60 p-0.5 gap-0.5 mb-2">
                                            <button type="button" onClick={() => setNotifAssignMode('user')}
                                                className={`flex-1 py-1.5 rounded-md text-[11px] font-semibold transition-all ${notifAssignMode === 'user' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'text-zinc-600 hover:text-zinc-400'}`}>
                                                Specific User
                                            </button>
                                            <button type="button" onClick={() => setNotifAssignMode('role')}
                                                className={`flex-1 py-1.5 rounded-md text-[11px] font-semibold transition-all ${notifAssignMode === 'role' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'text-zinc-600 hover:text-zinc-400'}`}>
                                                Entire Role
                                            </button>
                                        </div>
                                        {notifAssignMode === 'user' ? (
                                            <Dropdown placeholder="Select a team member..." value={notifAssignedUser} onChange={setNotifAssignedUser}
                                                options={[{ value: '', label: 'Select a team member...' }, ...users.map(u => ({ value: u.id, label: `${u.name} (${u.role?.split(', ')[0]})` }))]} />
                                        ) : (
                                            <Dropdown value={notifAssignedRole} onChange={setNotifAssignedRole}
                                                options={ROLES.map(r => ({ value: r, label: r }))} />
                                        )}
                                    </div>
                                    <motion.button type="submit" whileTap={{ scale: 0.98 }}
                                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-2.5 rounded-lg text-[12px] transition-all shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-2">
                                        <Send size={13} /> Broadcast Alert
                                    </motion.button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
