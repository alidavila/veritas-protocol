CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS agent_ledger;

CREATE TABLE agent_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id TEXT NOT NULL,
    action TEXT NOT NULL,
    amount NUMERIC,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_ledger_agent_id ON agent_ledger (agent_id);
CREATE INDEX idx_agent_ledger_created_at ON agent_ledger (created_at DESC);
