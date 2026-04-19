const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const supabase = require('../config/supabase');

// POST /api/punchlogs/in
router.post('/in', auth, async (req, res) => {
    try {
        // Check for active punch (don't use .single() — it throws on 0 rows)
        const { data: activeList } = await supabase.from('punch_logs')
            .select('id').eq('user_id', req.user.id).is('punch_out', null);
        
        if (activeList && activeList.length > 0) {
            return res.status(400).json({ msg: 'Already punched in' });
        }

        const { data, error } = await supabase.from('punch_logs').insert({
            user_id: req.user.id,
            punch_in: new Date().toISOString()
        }).select().single();
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('Punch In Error:', err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// POST /api/punchlogs/out
router.post('/out', auth, async (req, res) => {
    try {
        const { data: activeList } = await supabase.from('punch_logs')
            .select('*').eq('user_id', req.user.id).is('punch_out', null)
            .order('punch_in', { ascending: false }).limit(1);
        
        if (!activeList || activeList.length === 0) {
            return res.status(400).json({ msg: 'No active punch in found' });
        }

        const active = activeList[0];
        const { data, error } = await supabase.from('punch_logs')
            .update({ punch_out: new Date().toISOString() })
            .eq('id', active.id).select().single();
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('Punch Out Error:', err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// GET /api/punchlogs/active
router.get('/active', auth, async (req, res) => {
    try {
        const { data: activeList } = await supabase.from('punch_logs')
            .select('*').eq('user_id', req.user.id).is('punch_out', null)
            .order('punch_in', { ascending: false }).limit(1);
        
        if (activeList && activeList.length > 0) {
            res.json(activeList[0]);
        } else {
            res.json({ active: false });
        }
    } catch (err) {
        console.error('Active Punch Error:', err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;
