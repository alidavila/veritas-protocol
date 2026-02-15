
-- Agents Table
-- Stores configuration and identity for individual AI Agents

CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('support', 'sales', 'scraper', 'custom')),
    wallet_address TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own agents" 
    ON agents FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agents" 
    ON agents FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agents" 
    ON agents FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agents" 
    ON agents FOR DELETE 
    USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
