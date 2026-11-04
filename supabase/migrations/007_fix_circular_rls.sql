-- Migration: 007_fix_circular_rls.sql
-- Description: Fix circular RLS dependency between public.profiles and public.user_roles.
-- Run order: 7 of 7.
-- Depends on: 001_initial_schema.sql, 004_rls_policies.sql
--
-- Breaks the circular reference where profiles policies referenced user_roles and
-- user_roles policies referenced profiles. Admins are now identified via a direct
-- role column check on profiles, and user_roles references profiles only.

-- ============================================
-- profiles: remove circular admin policy
-- ============================================

DROP POLICY IF EXISTS "Admins can manage all profiles"
ON public.profiles;

CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (role = 'admin')
WITH CHECK (role = 'admin');

-- ============================================
-- user_roles: remove circular admin policy
-- ============================================

DROP POLICY IF EXISTS "Admins can manage all user_roles"
ON public.user_roles;

CREATE POLICY "Admins can manage all user_roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
