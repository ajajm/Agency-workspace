"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CalendarDays, Users, Check, Square } from 'lucide-react';
import { useToast } from '../../../components/Toast';

export default function MeetingsPage() {
    const [meetings, setMeetings] = useState([]);
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [time, setTime] = useState('');
    const [rsvpMsg, setRsvpMsg] = useState('');
    const [rsvpModal, setRsvpModal] = useState(null);
    const toast = useToast();

    useEffect(() => { fetchMeetings(); }, []);

    const fetchMeetings = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/meetings');
            setMeetings(res.data);
        } catch (err) { console.error(err); }
    };

    const handleCreateMeeting = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/meetings', { title, description, time: new Date(time) });
            setTitle(''); setDescription(''); setTime('');
            toast.success('Meeting invite sent!');
            fetchMeetings();
        } catch (err) { toast.error('Failed to create meeting'); }
    };

    const handleRsvp = async (meetingId, status, message = '') => {
        try {
            await axios.post(`http://localhost:5000/api/meetings/${meetingId}/rsvp`, { status, message });
            toast.success(`RSVP recorded: ${status}`);
            setRsvpModal(null); setRsvpMsg('');
            fetchMeetings();
        } catch (err) { toast.error('RSVP failed'); }
    };

    const isAdmin = user?.role === 'Admin' || user?.role === 'Founder';
    const inputClass = "w-full bg-zinc-900/40 border border-zinc-800/60 rounded-lg px-3.5 py-2.5 text-[13px] text-zinc-200 placeholder:text-zinc-600 transition-all hover:border-zinc-700/60 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20";
    const glassCard = "glass-card rounded-xl overflow-hidden relative border border-zinc-800/60";

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/40 flex-shrink-0">
                <div>
                    <h1 className="text-[20px] font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Meetings</h1>
                    <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{meetings.length} active invite{meetings.length !== 1 ? 's' : ''} · RSVP to confirm attendance</p>
                </div>
            </div>

            {isAdmin && (
                <div className={glassCard}>
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
                    <div className="px-5 py-3.5 border-b border-white/5 bg-white/5 flex items-center gap-2">
                        <CalendarDays size={14} className="text-blue-500" />
                        <h3 className="text-[13px] font-semibold text-zinc-200">Create New Poll</h3>
                    </div>
                    <form onSubmit={handleCreateMeeting} className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4 bg-zinc-900/10 items-start">
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Meeting Subject</label>
                            <input className={inputClass} placeholder="e.g. Q3 Design Review" value={title} onChange={e => setTitle(e.target.value)} required />
                            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 mt-3">Objective / Description</label>
                            <textarea className={`${inputClass} min-h-[60px] resize-none`} placeholder="Agenda details..." value={description} onChange={e => setDescription(e.target.value)} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Date & Time</label>
                            <input type="datetime-local" className={inputClass} value={time} onChange={e => setTime(e.target.value)} required />
                            <div className="flex justify-end mt-7">
                                <button type="submit" className="btn-brand px-6 py-2">
                                    Send Invites
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {meetings.length === 0 ? (
                    <div className="n8n-card p-16 text-center shadow-none border-[var(--border-subtle)] bg-[var(--bg-tertiary)] opacity-60 lg:col-span-2">
                        <div className="w-14 h-14 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] flex items-center justify-center mx-auto mb-3 shadow-inner"><Clock size={22} className="text-[var(--text-muted)]" /></div>
                        <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>No active meeting polls</p>
                    </div>
                ) : (
                    meetings.map(meet => {
                        const rsvps = meet.rsvps || [];
                        const myRsvp = rsvps.find(r => r.user_id === user?.id);
                        const attendees = rsvps.filter(r => r.status === 'Attending');
                        const declined = rsvps.filter(r => r.status === 'Declined');

                        return (
                            <motion.div key={meet.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                className="n8n-card p-4 hover:border-[var(--border)] transition-all flex flex-col justify-between gap-4 relative overflow-hidden"
                            >
                                {/* Left side glow effect */}
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--brand)] opacity-20" />

                                {/* 1. Meeting Subject & Date */}
                                <div className="pl-2">
                                    <h3 className="font-semibold text-[15px] truncate" style={{ color: 'var(--text-primary)' }}>{meet.title}</h3>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <div className="text-[11px] flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                                            <CalendarDays size={12} className="text-[var(--brand)]" />
                                            <span className="font-medium text-[var(--text-primary)]">{new Date(meet.final_time || meet.created_at).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                    {meet.description && <p className="text-[11px] mt-2 leading-relaxed line-clamp-2" style={{ color: 'var(--text-muted)' }}>{meet.description}</p>}
                                </div>

                                {/* 2. Attendees */}
                                <div className="pl-2">
                                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Attendees ({attendees.length})</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {attendees.length === 0 && <span className="text-[11px] italic" style={{ color: 'var(--text-muted)' }}>No RSVPs yet</span>}
                                        {attendees.map(a => (
                                            <span key={a.user?.id} className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: 'var(--brand)' }}>
                                                {a.user?.name}
                                            </span>
                                        ))}
                                        {declined.map(d => (
                                            <span key={d.user?.id} className="text-[10px] px-2 py-0.5 rounded-full font-medium line-through opacity-70" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--accent-red)' }} title={d.message}>
                                                {d.user?.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* 3. Coming or not? Actions */}
                                <div className="mt-2 pl-2">
                                    <div className="flex gap-2">
                                        <button onClick={() => handleRsvp(meet.id, 'Attending')}
                                            className={`flex-1 flex justify-center items-center gap-1.5 transition-all text-[12px] font-semibold border rounded-lg py-1.5 ${myRsvp?.status === 'Attending' ? 'bg-[var(--brand-muted)] text-[var(--brand)] border-blue-500/30' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] hover:border-blue-500/30'}`}>
                                            {myRsvp?.status === 'Attending' ? <Check size={12} className="text-[var(--brand)]" /> : null} Attending
                                        </button>
                                        <button onClick={() => setRsvpModal(meet.id)}
                                            className={`flex-1 flex justify-center items-center gap-1.5 transition-all text-[12px] font-semibold border rounded-lg py-1.5 ${myRsvp?.status === 'Declined' ? 'bg-red-500/10 text-[var(--accent-red)] border-red-500/30' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] hover:text-[var(--accent-red)] hover:border-red-500/30'}`}>
                                            {myRsvp?.status === 'Declined' ? <Check size={12} className="text-[var(--accent-red)]" /> : null} Decline
                                        </button>
                                    </div>

                                    {/* Decline Modal - Inline */}
                                    <AnimatePresence>
                                        {rsvpModal === meet.id && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 overflow-hidden">
                                                <div className="bg-[var(--bg-tertiary)] p-3 rounded-lg border border-[var(--border-subtle)] shadow-inner">
                                                    <input className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded px-2.5 py-1.5 text-[11px] text-[var(--text-primary)] focus:border-[var(--brand)] outline-none" placeholder="Reason for declining..." value={rsvpMsg} onChange={e => setRsvpMsg(e.target.value)} autoFocus />
                                                    <div className="flex justify-end gap-2 mt-2">
                                                        <button onClick={() => setRsvpModal(null)} className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] px-2">Cancel</button>
                                                        <button onClick={() => handleRsvp(meet.id, 'Declined', rsvpMsg)} className="text-[10px] bg-[var(--accent-red)] text-white font-medium px-3 py-1.5 rounded-md hover:bg-red-600 transition-colors">Submit</button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
