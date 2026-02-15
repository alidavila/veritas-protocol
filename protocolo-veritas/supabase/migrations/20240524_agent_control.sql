-- Agent Control Panel
-- This table stores global system state that agents read

CREATE TABLE IF NOT EXISTS agent_control (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status TEXT NOT NULL DEFAULT 'stopped', -- 'running' or 'stopped'
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert initial state (stopped by default)
INSERT INTO agent_control (status) VALUES ('stopped')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE agent_control ENABLE ROW LEVEL SECURITY;

-- Allow public read (agents need to check status)
CREATE POLICY "Allow public read" ON agent_control FOR SELECT USING (true);

-- Allow public update (UI needs to control)
CREATE POLICY "Allow public update" ON agent_control FOR UPDATE USING (true);
