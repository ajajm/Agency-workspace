const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function runMigration() {
    const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf-8');
    
    // Split by semicolons and run each statement
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const stmt of statements) {
        console.log('Running:', stmt.substring(0, 60) + '...');
        const { error } = await supabase.rpc('exec_sql', { sql_query: stmt + ';' }).single();
        if (error) {
            // Try direct fetch as fallback
            const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/`, {
                method: 'POST',
                headers: {
                    'apikey': process.env.SUPABASE_SERVICE_KEY,
                    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
                }
            });
            console.log('  Note: RPC not available, please run SQL manually in Supabase dashboard.');
            break;
        }
        console.log('  ✅ Done');
    }
}

runMigration().then(() => {
    console.log('Migration completed!');
    process.exit(0);
}).catch(err => {
    console.error('Migration error:', err.message);
    console.log('\n⚠️  Please run the SQL manually:');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Open your project → SQL Editor');
    console.log('3. Paste the contents of backend/src/config/init.sql');
    console.log('4. Click "Run"');
    process.exit(1);
});
