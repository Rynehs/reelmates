-- Fix RLS security issues by enabling RLS on storage tables
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Add missing RLS policies for storage (they should already exist, but ensuring they do)
CREATE POLICY IF NOT EXISTS "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY IF NOT EXISTS "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Room profile pics are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'room-profile-pics');

CREATE POLICY IF NOT EXISTS "Users can upload room profile pics" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'room-profile-pics');

-- Storage buckets policies
CREATE POLICY IF NOT EXISTS "Public bucket access" 
ON storage.buckets 
FOR SELECT 
USING (true);