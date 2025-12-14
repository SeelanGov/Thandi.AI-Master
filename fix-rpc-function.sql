-- Fix for search_knowledge_chunks RPC function to handle CAPS content with NULL module_id
-- This function needs to be executed in Supabase to fix the Phase 2 CAPS search issue

CREATE OR REPLACE FUNCTION search_knowledge_chunks(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10,
    filter_module_ids UUID[] DEFAULT NULL
)
RETURNS TABLE (
    chunk_id UUID,
    chunk_text TEXT,
    similarity float,
    metadata JSONB,
    source_entity_type TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        kc.id,
        kc.chunk_text,
        1 - (kc.embedding <=> query_embedding) as similarity,
        kc.chunk_metadata,
        kc.source_entity_type
    FROM knowledge_chunks kc
    WHERE 
        -- FIXED: Include chunks with NULL module_id when no filter is specified
        (filter_module_ids IS NULL OR kc.module_id = ANY(filter_module_ids) OR kc.module_id IS NULL)
        AND 1 - (kc.embedding <=> query_embedding) > match_threshold
    ORDER BY kc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Test the fixed function
-- SELECT * FROM search_knowledge_chunks(
--     (SELECT embedding FROM knowledge_chunks WHERE source_entity_type = 'caps_subject' LIMIT 1),
--     0.3,
--     10,
--     NULL
-- );