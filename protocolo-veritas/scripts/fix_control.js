import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fix() {
    console.log('🔧 Fixing agent_control table...');

    // 1. Delete all rows
    const { error: delError } = await supabase
        .from('agent_control')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything (UUIDs are not 0)

    if (delError) console.error('Delete error:', delError);

    // 2. Insert fresh row
    const { data, error: insError } = await supabase
        .from('agent_control')
        .insert([{ status: 'running' }])
        .select();

    if (insError) console.error('Insert error:', insError);
    else console.log('✅ Reset complete. New Control ID:', data[0].id);
}

fix();
