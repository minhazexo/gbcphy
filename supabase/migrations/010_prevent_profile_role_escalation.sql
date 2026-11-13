-- Migration: 010_prevent_profile_role_escalation.sql
-- Purpose: Keep client-editable profile fields separate from trusted role assignment.
--
-- Migration 004 permits users to update their own profiles row. RLS row checks
-- do not restrict individual columns, so a user could otherwise attempt to
-- change profiles.role while updating their own name/avatar.
--
-- Role changes must go through a trusted server-side process (Supabase
-- service_role / secret key) or a privileged SQL session. This lets the Worker
-- safely load the current role from profiles before authorizing full R2 access.

CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
  request_role TEXT := auth.role();
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND COALESCE(request_role, '') <> 'service_role'
     AND session_user NOT IN ('postgres', 'supabase_admin') THEN
    RAISE EXCEPTION
      'Profile roles can only be changed by a trusted server-side process.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.prevent_profile_role_escalation() FROM PUBLIC;

DROP TRIGGER IF EXISTS profiles_prevent_role_escalation ON public.profiles;

CREATE TRIGGER profiles_prevent_role_escalation
BEFORE UPDATE OF role ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_role_escalation();

COMMENT ON FUNCTION public.prevent_profile_role_escalation() IS
  'Prevents authenticated clients from changing profiles.role through the own-profile update policy.';
