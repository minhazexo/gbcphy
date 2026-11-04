-- Migration: 003_activity_logs.sql
-- Description: Activity logging table for audit trails.
-- Run order: 3 of 6.
-- Depends on: 001_initial_schema.sql (auth.users)

-- ============================================
-- activity_logs
-- ============================================
CREATE TABLE public.activity_logs (
  id SERIAL PRIMARY KEY,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
