
-- Agents Table & Marketplace Migration
-- CONSOLIDATED MIGRATION: Creates table if missing + Adds Marketplace columns

-- 1. Create Table (if not exists)
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

-- 2. Trigger for updated_at (Idempotent: CREATE OR REPLACE)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_agents_updated_at ON agents;
CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- 3. Enable RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- 4. Marketplace Extension
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS price_usd NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS description TEXT;

-- 5. Policies (Drop old ones to be safe and recreate)
DROP POLICY IF EXISTS "Users can view their own agents" ON agents;
DROP POLICY IF EXISTS "Users can create their own agents" ON agents;
DROP POLICY IF EXISTS "Users can update their own agents" ON agents;
DROP POLICY IF EXISTS "Users can delete their own agents" ON agents;
DROP POLICY IF EXISTS "Users can view public or own agents" ON agents;

-- Create unified policies
CREATE POLICY "Users can view public or own agents" 
    ON agents FOR SELECT 
    USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own agents" 
    ON agents FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agents" 
    ON agents FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agents" 
    ON agents FOR DELETE 
    USING (auth.uid() = user_id);
