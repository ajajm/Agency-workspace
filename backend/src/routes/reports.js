const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const supabase = require('../config/supabase');

// POST /api/reports/generate — Compile/append daily report
router.post('/generate', auth, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // Get uncompiled work logs
        const startOfDay = new Date(today + 'T00:00:00.000Z').toISOString();
        const endOfDay = new Date(today + 'T23:59:59.999Z').toISOString();

        const { data: logs } = await supabase.from('work_logs')
            .select('*')
            .eq('user_id', req.user.id)
            .is('report_id', null)
            .gte('timestamp', startOfDay)
            .lte('timestamp', endOfDay);

        // Check if report for today exists (append mode)
        let { data: existingReport } = await supabase.from('reports')
            .select('*').eq('user_id', req.user.id).eq('date', today).single();

        // If no existing report and no new logs, there's nothing to compile
        if (!existingReport && (!logs || logs.length === 0)) {
            return res.status(400).json({ msg: 'No new work logs to compile a report' });
        }

        // Get earliest punch_in and latest punch_out for today
        const { data: punches } = await supabase.from('punch_logs')
            .select('punch_in, punch_out')
            .eq('user_id', req.user.id)
            .gte('punch_in', startOfDay)
            .lte('punch_in', endOfDay)
            .order('punch_in', { ascending: true });

        const workStartTime = punches && punches.length > 0 ? punches[0].punch_in : null;
        const punchOutTime = punches && punches.length > 0 ? punches[punches.length - 1].punch_out : null;

        let report;
        if (existingReport) {
            // Update existing report with latest punch times
            const { data: updated, error } = await supabase.from('reports')
                .update({ 
                    work_start_time: workStartTime || existingReport.work_start_time,
                    punch_out_time: punchOutTime || existingReport.punch_out_time,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingReport.id).select().single();
            if (error) throw error;
            report = updated;
        } else {
            // Create new report
            const { data: newReport, error } = await supabase.from('reports')
                .insert({
                    user_id: req.user.id,
                    date: today,
                    work_start_time: workStartTime,
                    punch_out_time: punchOutTime
                }).select().single();
            if (error) throw error;
            report = newReport;
        }

        // Link work logs to report, if any
        if (logs && logs.length > 0) {
            const reportTaskInserts = logs.map(l => ({ report_id: report.id, work_log_id: l.id }));
            await supabase.from('report_tasks').insert(reportTaskInserts);

            // Mark work logs as compiled
            await supabase.from('work_logs')
                .update({ report_id: report.id })
                .in('id', logs.map(l => l.id));
        }

        // Link pending todos to report
        const { data: pendingTodos } = await supabase.from('todos')
            .select('id')
            .or(`assigned_to.eq.${req.user.id},assigned_role.eq.${req.user.role}`)
            .neq('status', 'Completed');

        // And find completed todos to remove from the report
        const { data: completedTodos } = await supabase.from('todos')
            .select('id')
            .or(`assigned_to.eq.${req.user.id},assigned_role.eq.${req.user.role}`)
            .eq('status', 'Completed');

        // Remove any completed todos from this report
        if (completedTodos && completedTodos.length > 0) {
            const completedTodoIds = completedTodos.map(t => t.id);
            await supabase.from('report_todos')
                .delete()
                .eq('report_id', report.id)
                .in('todo_id', completedTodoIds);
        }

        if (pendingTodos && pendingTodos.length > 0) {
            // Only insert new links (avoid duplicates)
            const { data: existingLinks } = await supabase.from('report_todos')
                .select('todo_id').eq('report_id', report.id);
            const existingTodoIds = (existingLinks || []).map(l => l.todo_id);
            const newLinks = pendingTodos
                .filter(t => !existingTodoIds.includes(t.id))
                .map(t => ({ report_id: report.id, todo_id: t.id }));
            if (newLinks.length > 0) {
                await supabase.from('report_todos').insert(newLinks);
            }
        }

        res.json(report);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// GET /api/reports — Get user's own reports
router.get('/', auth, async (req, res) => {
    try {
        const { data: reports, error } = await supabase.from('reports')
            .select('*')
            .eq('user_id', req.user.id)
            .order('date', { ascending: false });
        if (error) throw error;

        // Enrich with tasks and todos
        for (let r of reports) {
            const { data: tasks } = await supabase.from('report_tasks')
                .select('work_log_id, work_logs(*)').eq('report_id', r.id);
            r.compiledTasks = (tasks || []).map(t => t.work_logs);

            const { data: todos } = await supabase.from('report_todos')
                .select('todo_id, todos(*)').eq('report_id', r.id);
            r.todosForNextDay = (todos || []).map(t => t.todos);
        }

        res.json(reports);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// GET /api/reports/admin — Admin: all users' reports for a date
router.get('/admin', auth, async (req, res) => {
    try {
        const date = req.query.date || new Date().toISOString().split('T')[0];

        const { data: reports, error } = await supabase.from('reports')
            .select('*, user:users!reports_user_id_fkey(id, name, email, role)')
            .eq('date', date)
            .order('created_at');
        if (error) throw error;

        // Enrich each report
        for (let r of reports) {
            const { data: tasks } = await supabase.from('report_tasks')
                .select('work_log_id, work_logs(*)').eq('report_id', r.id);
            r.compiledTasks = (tasks || []).map(t => t.work_logs);

            const { data: todos } = await supabase.from('report_todos')
                .select('todo_id, todos(*)').eq('report_id', r.id);
            r.todosForNextDay = (todos || []).map(t => t.todos);
        }

        res.json(reports);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
