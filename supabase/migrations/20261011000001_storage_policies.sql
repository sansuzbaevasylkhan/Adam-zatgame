-- 1. Create the bucket if it doesn't exist
-- Note: Buckets are usually created via Supabase Dashboard, but we can ensure policies are set.
-- If the bucket 'avatars' does not exist, it must be created in the Dashboard as a 'Public' bucket.

-- 2. Storage RLS Policies for 'avatars' bucket
-- Enable RLS on storage.objects (this is usually on by default)

-- Policy: Public access to all avatars (SELECT)
CREATE POLICY "Avatar public access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- Policy: Authenticated users can upload/update their own avatar (INSERT/UPDATE)
-- We assume the file path is 'avatars/userId.ext'
CREATE POLICY "User can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "User can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Note: If we use 'avatars/userId.ext', the foldername is actually empty or the file is at root.
-- If we change to 'avatars/userId/avatar.jpg', the above works.
-- For 'avatars/userId.jpg', we use:
DROP POLICY IF EXISTS "User can upload own avatar" ON storage.objects;
CREATE POLICY "User can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  (substring(name from 1 for length(auth.uid()::text))) = auth.uid()::text
);

DROP POLICY IF EXISTS "User can update own avatar" ON storage.objects;
CREATE POLICY "User can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  (substring(name from 1 for length(auth.uid()::text))) = auth.uid()::text
);
