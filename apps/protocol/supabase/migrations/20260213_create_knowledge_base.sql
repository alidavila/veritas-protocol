-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store your documents
create table if not exists knowledge_base (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references agents(id), -- Link to specific agent (Support Agent)
  content text, -- The text chunk
  embedding vector(768), -- Gemini Pro embedding size
  metadata jsonb, -- Extra info (source url, title)
  created_at timestamptz default now()
);

-- Create a function to search for documents
create or replace function match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    knowledge_base.id,
    knowledge_base.content,
    1 - (knowledge_base.embedding <=> query_embedding) as similarity
  from knowledge_base
  where 1 - (knowledge_base.embedding <=> query_embedding) > match_threshold
  order by knowledge_base.embedding <=> query_embedding
  limit match_count;
end;
$$;
