-- Fix RLS security issues by enabling RLS on storage tables
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Drop and recreate storage policies to avoid conflicts
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Room profile pics are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload room profile pics" ON storage.objects;
DROP POLICY IF EXISTS "Public bucket access" ON storage.buckets;

-- Add storage policies for objects
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Room profile pics are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'room-profile-pics');

CREATE POLICY "Users can upload room profile pics" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'room-profile-pics');

-- Storage buckets policies
CREATE POLICY "Public bucket access" 
ON storage.buckets 
FOR SELECT 
USING (true);