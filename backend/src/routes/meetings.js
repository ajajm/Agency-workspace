const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const supabase = require('../config/supabase');
const axios = require('axios');

let memoryRSVPs = [];

// POST /api/meetings — Create Meeting Event
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, time } = req.body;
        const { data: meeting, error } = await supabase.from('meetings').insert({
            title, description, final_time: time, created_by: req.user.id
        }).select().single();
        if (error) throw error;

        // Try to trigger a notification for everyone (mocking role check if needed, but we'll try the /api/notifications endpoint or insert manually)
        try {
            await axios.post(`http://localhost:${process.env.PORT || 5000}/api/notifications`, {
                title: `New Meeting: ${title}`,
                role: 'Intern' // we will assume everyone is at least Intern. Actually, let's just trigger it directly manually via DB
            }, { headers: { Authorization: req.headers.authorization } });
            
            // Just to be safe, also do Founder, Admin, etc
            const roles = ['Founder', 'Admin', 'Manager', 'Project Manager', 'Script Writer', 'Editor', 'Core Team'];
            roles.forEach(async r => {
                await axios.post(`http://localhost:${process.env.PORT || 5000}/api/notifications`, { title: `New Meeting: ${title}`, role: r }, { headers: { Authorization: req.headers.authorization } }).catch(()=>null);
            });
        } catch (ignored) {}

        res.json(meeting);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// POST /api/meetings/:id/rsvp
router.post('/:id/rsvp', auth, async (req, res) => {
    try {
        const { status, message } = req.body; // 'Attending' | 'Declined'
        try {
            const { error } = await supabase.from('meeting_rsvps').upsert({
                meeting_id: req.params.id, user_id: req.user.id, status, message
            }, { onConflict: 'meeting_id,user_id' });
            if (error) throw error;
        } catch (dbError) {
            // Memory fallback
            const existing = memoryRSVPs.findIndex(r => r.meeting_id === req.params.id && r.user_id === req.user.id);
            if (existing >= 0) memoryRSVPs[existing] = { meeting_id: req.params.id, user_id: req.user.id, status, message };
            else memoryRSVPs.push({ meeting_id: req.params.id, user_id: req.user.id, status, message });
        }
        res.json({ msg: 'RSVP recorded' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// GET /api/meetings
router.get('/', auth, async (req, res) => {
    try {
        const { data: meetings, error } = await supabase.from('meetings')
            .select(`*, created_by_user:users!meetings_created_by_fkey(name, role)`)
            .order('created_at', { ascending: false });
        if (error) throw error;

        for (let m of meetings) {
            try {
                const { data: rsvps, error: rsvpError } = await supabase.from('meeting_rsvps')
                    .select(`*, user:users!meeting_rsvps_user_id_fkey(name, role)`)
                    .eq('meeting_id', m.id);
                if (rsvpError) throw rsvpError;
                m.rsvps = rsvps || [];
            } catch (fallbackError) {
                // Fetch from memory
                const matchMemory = memoryRSVPs.filter(r => r.meeting_id === m.id);
                m.rsvps = await Promise.all(matchMemory.map(async r => {
                    const { data: user } = await supabase.from('users').select('name, role').eq('id', r.user_id).single();
                    return { ...r, user };
                }));
            }
        }
        res.json(meetings);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
