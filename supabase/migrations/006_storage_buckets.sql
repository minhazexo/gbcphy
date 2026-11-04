-- Migration: 006_storage_buckets.sql
-- Description: Supabase Storage buckets and policies for file assets.
-- Run order: 6 of 6.
-- Depends on: 001_initial_schema.sql (profiles)
--
-- Buckets: profile-images, faculty-images, department-assets, notice-attachments
-- All buckets are private (non-public) by default.

-- ============================================
-- Ensure storage.objects has RLS enabled
-- ============================================

-- ============================================
-- Create buckets (idempotent)
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('profile-images', 'profile-images', FALSE),
  ('faculty-images', 'faculty-images', FALSE),
  ('department-assets', 'department-assets', FALSE),
  ('notice-attachments', 'notice-attachments', FALSE)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- profile-images bucket
-- Authenticated users can read; owners can insert/update/delete their own files.
-- ============================================
CREATE POLICY "Authenticated users can read profile images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'profile-images');

CREATE POLICY "Users can upload profile images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-images');

CREATE POLICY "Users can update their own profile images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-images' AND owner = auth.uid());

CREATE POLICY "Users can delete their own profile images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'profile-images' AND owner = auth.uid());

-- ============================================
-- faculty-images bucket
-- ============================================
CREATE POLICY "Authenticated users can read faculty images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'faculty-images');

CREATE POLICY "Users can upload faculty images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'faculty-images');

CREATE POLICY "Users can update their own faculty images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'faculty-images' AND owner = auth.uid());

CREATE POLICY "Users can delete their own faculty images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'faculty-images' AND owner = auth.uid());

-- ============================================
-- department-assets bucket
-- Authenticated users can read; admins manage all writes.
-- ============================================
CREATE POLICY "Authenticated users can read department assets"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'department-assets');

CREATE POLICY "Admins can manage department assets"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'department-assets'
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'department-assets'
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- ============================================
-- notice-attachments bucket
-- Authenticated users can read; admins manage all writes.
-- ============================================
CREATE POLICY "Authenticated users can read notice attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'notice-attachments');

CREATE POLICY "Admins can manage notice attachments"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'notice-attachments'
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'notice-attachments'
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);
