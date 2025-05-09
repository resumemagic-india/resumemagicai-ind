
-- Enable the required extensions if they're not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function to invoke the cleanup-storage edge function
CREATE OR REPLACE FUNCTION public.invoke_cleanup_storage()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_ref TEXT := 'fhgjwfczltqpzuhxuhuv';
  anon_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZ2p3ZmN6bHRxcHp1aHh1aHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2ODg4MDcsImV4cCI6MjA1NDI2NDgwN30.pEKVpLe5ZmdzT5BThvanN8S605QTfiWT0b5ewXvyUHw';
  result TEXT;
BEGIN
  SELECT
    net.http_post(
      url:='https://' || project_ref || '.supabase.co/functions/v1/cleanup-storage',
      headers:=format('{"Content-Type": "application/json", "Authorization": "Bearer %s"}', anon_key)::jsonb,
      body:='{}'::jsonb
    ) INTO result;
  RETURN result;
END;
$$;

-- Set up a weekly cron job to run every Sunday at midnight
SELECT cron.schedule(
  'weekly-storage-cleanup',
  '0 0 * * 0', -- At 00:00 on Sunday
  $$
  SELECT public.invoke_cleanup_storage();
  $$
);
