const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const supabase = require('../config/supabase');

// POST /api/todos — Create todo
router.post('/', auth, async (req, res) => {
    try {
        const { title, notes, assignedTo, assignedRole, deadline } = req.body;
        const { data, error } = await supabase.from('todos').insert({
            title, notes,
            assigned_to: assignedTo || null,
            assigned_role: assignedRole || null,
            created_by: req.user.id,
            deadline: deadline || null
        }).select().single();
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// GET /api/todos — Get todos for current user (by id or role)
router.get('/', auth, async (req, res) => {
    try {
        const { data, error } = await supabase.from('todos')
            .select('*')
            .or(`assigned_to.eq.${req.user.id},assigned_role.eq.${req.user.role}`)
            .order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// GET /api/todos/all — Admin: get all todos
router.get('/all', auth, async (req, res) => {
    try {
        const { data, error } = await supabase.from('todos')
            .select('*, assigned_user:users!todos_assigned_to_fkey(name, role)')
            .order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// PUT /api/todos/:id — Update todo (status, title, notes)
router.put('/:id', auth, async (req, res) => {
    try {
        const updates = {};
        const { status, title, notes, deadline } = req.body;
        if (status) updates.status = status;
        if (title) updates.title = title;
        if (notes !== undefined) updates.notes = notes;
        if (deadline !== undefined) updates.deadline = deadline;
        updates.updated_at = new Date().toISOString();

        const { data, error } = await supabase.from('todos')
            .update(updates).eq('id', req.params.id).select().single();
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// PUT /api/todos/:id/status — Quick status update
router.put('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const { data, error } = await supabase.from('todos')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', req.params.id).select().single();
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// DELETE /api/todos/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        const { error } = await supabase.from('todos').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ msg: 'Todo deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
