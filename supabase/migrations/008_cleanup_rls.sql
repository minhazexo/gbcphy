-- Migration: 008_cleanup_rls.sql
-- Description: Remove redundant and circular RLS policies between profiles and user_roles.
-- Run order: 8 of 8.
-- Depends on: 004_rls_policies.sql, 007_fix_circular_rls.sql
--
-- Drops "Admins can view all profiles" from profiles (references user_roles;
-- redundant since "Admins can manage all profiles" now covers admin access via
-- direct role column check).
-- Drops "Admins can manage all user_roles" from user_roles (references profiles;
-- the last remaining cross-table reference between these two tables).

-- ============================================
-- profiles: drop redundant admin view policy
-- ============================================

DROP POLICY IF EXISTS "Admins can view all profiles"
ON public.profiles;

-- ============================================
-- user_roles: drop cross-table admin policy
-- ============================================

DROP POLICY IF EXISTS "Admins can manage all user_roles"
ON public.user_roles;
