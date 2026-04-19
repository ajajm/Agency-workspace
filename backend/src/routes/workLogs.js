const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const supabase = require('../config/supabase');

// POST /api/worklogs
router.post('/', auth, async (req, res) => {
    try {
        const { task, timeSpent, notes, dateOverride } = req.body;
        const { data, error } = await supabase.from('work_logs').insert({
            user_id: req.user.id,
            task,
            time_spent: timeSpent || null,
            notes,
            timestamp: dateOverride || new Date().toISOString()
        }).select().single();
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// GET /api/worklogs/today
router.get('/today', auth, async (req, res) => {
    try {
        const start = new Date();
        start.setHours(start.getHours() - 24);

        const { data, error } = await supabase.from('work_logs')
            .select('*')
            .eq('user_id', req.user.id)
            .gte('timestamp', start.toISOString())
            .order('timestamp', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// PUT /api/worklogs/:id
router.put('/:id', auth, async (req, res) => {
    try {
        const { task, timeSpent, notes } = req.body;
        const { data, error } = await supabase.from('work_logs')
            .update({ task, time_spent: timeSpent || null, notes })
            .eq('id', req.params.id)
            .eq('user_id', req.user.id);
        if (error) throw error;
        res.json({ msg: 'Updated' });
    } catch (err) { res.status(500).send('Server Error'); }
});

// DELETE /api/worklogs/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        const { error } = await supabase.from('work_logs')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.user.id);
        if (error) throw error;
        res.json({ msg: 'Deleted' });
    } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;
