
-- API Keys Table
-- Stores hashes of API keys for agent authentication

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    key_prefix TEXT NOT NULL, -- e.g. "vt_live_"
    scopes TEXT[] DEFAULT '{read,write}'::text[],
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own API keys" 
    ON api_keys FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own API keys" 
    ON api_keys FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys" 
    ON api_keys FOR DELETE 
    USING (auth.uid() = user_id);

-- Note: No update policy. Keys should be immutable (delete/recreate) for security.
