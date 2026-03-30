-- Add full-text search columns and GIN indexes for fast text search

-- Story title search vector
ALTER TABLE "stories" ADD COLUMN IF NOT EXISTS "search_vector" tsvector
  GENERATED ALWAYS AS (to_tsvector('english', coalesce("generatedTitle", ''))) STORED;

CREATE INDEX IF NOT EXISTS "stories_search_vector_idx" ON "stories" USING GIN ("search_vector");

-- Article title search vector
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "search_vector" tsvector
  GENERATED ALWAYS AS (to_tsvector('english', coalesce("title", ''))) STORED;

CREATE INDEX IF NOT EXISTS "articles_search_vector_idx" ON "articles" USING GIN ("search_vector");
