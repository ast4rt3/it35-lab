-- Create storage bucket for user avatars and post images
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-avatars', 'user-avatars', true);

-- Set up storage policies
CREATE POLICY "Allow public access to user avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-avatars');

CREATE POLICY "Allow authenticated users to upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-avatars' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow users to update their own avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to delete their own avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
); 