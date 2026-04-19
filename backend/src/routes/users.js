const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const supabase = require('../config/supabase');



// GET /api/users — List all users
router.get('/', auth, async (req, res) => {
    try {
        const { data, error } = await supabase.from('users')
            .select('id, name, email, role, avatar_url, last_activity, created_at')
            .order('name');
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// POST /api/users/avatar — Upload profile photo (base64)
router.post('/avatar', auth, async (req, res) => {
    try {
        const { avatar_url } = req.body; // accepts base64 data URL
        if (!avatar_url) return res.status(400).json({ msg: 'No image provided' });

        const { data, error } = await supabase.from('users')
            .update({ avatar_url })
            .eq('id', req.user.id)
            .select('id, name, email, role, avatar_url').single();
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('Avatar upload error:', err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// POST /api/users — Admin create user
router.post('/', auth, async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const { data, error } = await supabase.from('users').insert({
            name, email, password_hash, role
        }).select('id, name, email, role, avatar_url, created_at').single();
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// PUT /api/users/:id — Admin update user
router.put('/:id', auth, async (req, res) => {
    try {
        const updates = {};
        const { name, email, role, password } = req.body;
        if (name) updates.name = name;
        if (email) updates.email = email;
        if (role) updates.role = role;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updates.password_hash = await bcrypt.hash(password, salt);
        }
        updates.updated_at = new Date().toISOString();

        const { data, error } = await supabase.from('users')
            .update(updates).eq('id', req.params.id)
            .select('id, name, email, role, avatar_url').single();
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// DELETE /api/users/:id — Admin delete user
router.delete('/:id', auth, async (req, res) => {
    try {
        const { error } = await supabase.from('users').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ msg: 'User deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
