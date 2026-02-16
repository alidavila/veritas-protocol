import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupControl() {
    console.log("🔧 Setting up agent_control table...\n");

    // Read migration SQL
    const sql = fs.readFileSync('supabase/migrations/20240524_agent_control.sql', 'utf8');

    // Execute via RPC (alternative: use Supabase SQL editor or direct pg client)
    // Since we can't execute raw DDL via JS SDK easily, let's create table manually

    console.log("Creating table via INSERT test (table might already exist)...");

    // Try to insert initial state
    const { data, error } = await supabase
        .from('agent_control')
        .select('*')
        .single();

    if (error && error.code === '42P01') {
        console.log("❌ Table doesn't exist. Please run this SQL in Supabase SQL Editor:");
        console.log("\n" + sql + "\n");
        console.log("Visit: https://rdoccjvqkmvobmqrvisy.supabase.co/project/rdoccjvqkmvobmqrvisy/sql/new");
        return;
    }

    if (data) {
        console.log("✅ Table exists! Current status:", data.status);

        // Set to 'running' so agents can start
        const { error: updateError } = await supabase
            .from('agent_control')
            .update({ status: 'running' })
            .eq('id', data.id);

        if (!updateError) {
            console.log("✅ Status set to 'running'. Agents will now start!");
        }
    } else {
        console.log("Creating initial record...");
        await supabase.from('agent_control').insert([{ status: 'running' }]);
        console.log("✅ Done!");
    }
}

setupControl();
