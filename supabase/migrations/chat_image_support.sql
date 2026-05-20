-- Add image_url column to chat_messages
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create chat-images storage bucket (run in Supabase dashboard > Storage)
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES ('chat-images', 'chat-images', true, 5242880, ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif'])
-- ON CONFLICT (id) DO NOTHING;

-- Storage RLS: allow authenticated users to upload to chat-images
-- (run in Supabase dashboard > Storage > chat-images > Policies)
-- CREATE POLICY "Users can upload chat images" ON storage.objects
--   FOR INSERT TO authenticated
--   WITH CHECK (bucket_id = 'chat-images');

-- CREATE POLICY "Public read chat images" ON storage.objects
--   FOR SELECT TO public
--   USING (bucket_id = 'chat-images');
