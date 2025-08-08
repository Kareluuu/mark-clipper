-- Add html_raw column to store Quill HTML content
-- Safe to run multiple times

ALTER TABLE IF EXISTS public.clips
  ADD COLUMN IF NOT EXISTS html_raw text;

COMMENT ON COLUMN public.clips.html_raw IS 'Original rich text HTML from Quill editor (sanitized at render time)';

