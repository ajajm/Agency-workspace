const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const supabase = require('../config/supabase');

// Temporary in-memory fallback if the DB table isn't created yet
let memoryNotifications = [];

// GET /api/notifications
router.get('/', auth, async (req, res) => {
    try {
        const { data, error } = await supabase.from('notifications')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false })
            .limit(20);
        
        if (error) {
            // Fallback to memory
            return res.json(memoryNotifications.filter(n => n.user_id === req.user.id).sort((a,b) => b.created_at - a.created_at));
        }
        res.json(data);
    } catch (err) {
        // Fallback to memory
        res.json(memoryNotifications.filter(n => n.user_id === req.user.id).sort((a,b) => b.created_at - a.created_at));
    }
});

// POST /api/notifications (Admin only)
router.post('/', auth, async (req, res) => {
    try {
        const { data: currentUser } = await supabase.from('users').select('role').eq('id', req.user.id).single();
        if (currentUser.role !== 'Admin' && currentUser.role !== 'Founder') return res.status(403).json({msg: 'Not admin'});

        const { title, user_id, role } = req.body;
        
        try {
            // Attempt Supabase insert
            if (user_id) {
                const { error } = await supabase.from('notifications').insert({ user_id, title });
                if (error) throw error;
            } else if (role) {
                // Match users whose role column contains this role (supports multi-role comma-separated)
                const { data: users } = await supabase.from('users').select('id').ilike('role', `%${role}%`);
                if (users && users.length) {
                    const inserts = users.map(u => ({ user_id: u.id, title }));
                    const { error } = await supabase.from('notifications').insert(inserts);
                    if (error) throw error;
                }
            }
            res.json({ msg: 'Success' });
        } catch (dbError) {
            // Fallback to memory array
            if (user_id) {
                memoryNotifications.push({ id: Date.now().toString(), user_id, title, read: false, created_at: new Date() });
            } else if (role) {
                const { data: users } = await supabase.from('users').select('id').ilike('role', `%${role}%`);
                if (users && users.length) {
                    users.forEach(u => memoryNotifications.push({ id: Date.now().toString() + u.id, user_id: u.id, title, read: false, created_at: new Date() }));
                }
            }
            res.json({ msg: 'Success (Saved to memory fallback as DB table missing)' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// PUT read
router.put('/:id/read', auth, async (req, res) => {
    try {
        const { error } = await supabase.from('notifications').update({ read: true }).eq('id', req.params.id);
        if (error) {
            // Memory fallback
            const notif = memoryNotifications.find(n => n.id === req.params.id);
            if (notif) notif.read = true;
        }
        res.json({ msg: 'Read' });
    } catch (err) {}
});

module.exports = router;
