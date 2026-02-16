
-- Add Heartbeat columns to agents table
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_task TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_agents_last_seen ON agents(last_seen);
