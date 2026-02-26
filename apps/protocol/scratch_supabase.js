import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data } = await supabase.from('agent_control').select('*');
    console.log("Current agent_control state:");
    console.dir(data, { depth: null });

    // Attempting to fix the config to ensure agents are turned ON
    let config = data[0].config || {};
    config.hunter_agent = { enabled: true };
    config.email_agent = { enabled: true };

    const { error } = await supabase.from('agent_control').update({
        status: 'running',
        config: config
    }).eq('id', 1);

    if (error) {
        console.error("Error updating:", error);
    } else {
        console.log("Successfully set 'status: running' and 'enabled: true' for Hunter & Email.");
    }
}
check();
