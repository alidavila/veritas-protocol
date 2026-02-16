
-- Agent Commands Table
-- Stores instructions from the dashboard to the agents

CREATE TABLE IF NOT EXISTS agent_commands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id TEXT, -- Target agent (or 'all')
    command TEXT NOT NULL,
    params JSONB DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    result JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime
ALTER TABLE agent_commands ENABLE ROW LEVEL SECURITY;

create policy "Enable all access for now"
on agent_commands
for all
using (true)
with check (true);

-- Add to publication if it exists, or user must do it in Supabase Dashboard
-- We assume realtime is enabled for public tables or specific tables.
