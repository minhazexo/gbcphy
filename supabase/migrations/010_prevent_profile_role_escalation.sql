-- Migration: 010_prevent_profile_role_escalation.sql
-- Purpose:
--   1. Stop clients from granting themselves roles through profiles or user_roles.
--   2. Derive database authorization from trusted database role rows, never
--      user-editable auth.users.raw_user_meta_data.
--   3. Preserve administrator role management for other users.
--   4. Allow the department_admin role already used by the application.
--
-- This migration is intentionally additive to the existing schema and does
-- not modify or delete application records.

-- ---------------------------------------------------------------------------
-- Trusted, non-exposed authorization helper
-- ---------------------------------------------------------------------------

CREATE SCHEMA IF NOT EXISTS private;

REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_admin_access()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT
    (SELECT auth.uid()) IS NOT NULL
    AND (
      EXISTS (
        SELECT 1
        FROM public.profiles AS p
        WHERE p.id = (SELECT auth.uid())
          AND p.role IN ('admin', 'department_admin', 'super_admin')
      )
      OR EXISTS (
        SELECT 1
        FROM public.user_roles AS ur
        WHERE ur.user_id = (SELECT auth.uid())
          AND ur.role IN ('admin', 'department_admin', 'super_admin')
      )
    );
$function$;

REVOKE ALL ON FUNCTION private.has_admin_access() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_admin_access() TO authenticated, service_role;

COMMENT ON FUNCTION private.has_admin_access() IS
  'Returns whether the current authenticated user has an administrator role stored in public.profiles or public.user_roles. Does not trust user-editable JWT user_metadata.';

-- ---------------------------------------------------------------------------
-- Keep role constraints aligned with roles supported by the application
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('student', 'faculty', 'admin', 'department_admin', 'super_admin'));

ALTER TABLE public.user_roles
  DROP CONSTRAINT IF EXISTS user_roles_role_check;

ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_role_check
  CHECK (role IN ('student', 'faculty', 'admin', 'department_admin', 'super_admin'));

-- ---------------------------------------------------------------------------
-- Protect profiles.role on both INSERT and UPDATE.
--
-- A user may create their own profile, but the initial role is always student.
-- A database-backed administrator may assign roles to other users.
-- A user cannot change their own role. Trusted service/database roles can.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION private.guard_profile_role_mutations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  caller_id uuid := (SELECT auth.uid());
BEGIN
  IF current_user IN ('service_role', 'postgres', 'supabase_admin') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF caller_id IS NOT NULL AND NEW.id = caller_id THEN
      NEW.role := 'student';
      RETURN NEW;
    END IF;

    IF (SELECT private.has_admin_access()) THEN
      RETURN NEW;
    END IF;

    RAISE EXCEPTION 'Only administrators can create profiles for other users.'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF caller_id IS NOT NULL AND NEW.id = caller_id THEN
      RAISE EXCEPTION 'You cannot change your own profile role.'
        USING ERRCODE = '42501';
    END IF;

    IF NOT (SELECT private.has_admin_access()) THEN
      RAISE EXCEPTION 'Only administrators can change another user profile role.'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION private.guard_profile_role_mutations() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.guard_profile_role_mutations() TO authenticated, service_role;

DROP TRIGGER IF EXISTS profiles_prevent_role_escalation ON public.profiles;

CREATE TRIGGER profiles_prevent_role_escalation
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION private.guard_profile_role_mutations();

COMMENT ON FUNCTION private.guard_profile_role_mutations() IS
  'Forces self-created profiles to student, blocks self role changes, and allows database-backed administrators to manage other users.';

-- user_roles is a second source of authorization. Prevent an administrator
-- from inserting or promoting their own user_roles row through the client.
CREATE OR REPLACE FUNCTION private.guard_user_role_mutations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  caller_id uuid := (SELECT auth.uid());
BEGIN
  IF current_user IN ('service_role', 'postgres', 'supabase_admin') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF caller_id IS NOT NULL AND NEW.user_id = caller_id THEN
      RAISE EXCEPTION 'You cannot assign a role to yourself.'
        USING ERRCODE = '42501';
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF caller_id IS NOT NULL
       AND NEW.user_id = caller_id
       AND (
         NEW.user_id IS DISTINCT FROM OLD.user_id
         OR NEW.role IS DISTINCT FROM OLD.role
       ) THEN
      RAISE EXCEPTION 'You cannot change your own user role.'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  IF NOT (SELECT private.has_admin_access()) THEN
    RAISE EXCEPTION 'Only administrators can manage user roles.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION private.guard_user_role_mutations() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.guard_user_role_mutations() TO authenticated, service_role;

DROP TRIGGER IF EXISTS user_roles_prevent_self_escalation ON public.user_roles;

CREATE TRIGGER user_roles_prevent_self_escalation
BEFORE INSERT OR UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION private.guard_user_role_mutations();

-- ---------------------------------------------------------------------------
-- Replace every live administrator policy that currently reads user_metadata.
-- auth.users.raw_user_meta_data is user-editable and must never authorize access.
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING ((SELECT private.has_admin_access()));

DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL
TO authenticated
USING ((SELECT private.has_admin_access()))
WITH CHECK ((SELECT private.has_admin_access()));

DROP POLICY IF EXISTS "Admins can manage all students" ON public.students;
CREATE POLICY "Admins can manage all students"
ON public.students
FOR ALL
TO authenticated
USING ((SELECT private.has_admin_access()))
WITH CHECK ((SELECT private.has_admin_access()));

DROP POLICY IF EXISTS "Admins can view all faculty" ON public.faculty;
CREATE POLICY "Admins can view all faculty"
ON public.faculty
FOR SELECT
TO authenticated
USING ((SELECT private.has_admin_access()));

DROP POLICY IF EXISTS "Admins can manage all faculty" ON public.faculty;
CREATE POLICY "Admins can manage all faculty"
ON public.faculty
FOR ALL
TO authenticated
USING ((SELECT private.has_admin_access()))
WITH CHECK ((SELECT private.has_admin_access()));

DROP POLICY IF EXISTS "Admins can manage all announcements" ON public.announcements;
CREATE POLICY "Admins can manage all announcements"
ON public.announcements
FOR ALL
TO authenticated
USING ((SELECT private.has_admin_access()))
WITH CHECK ((SELECT private.has_admin_access()));

DROP POLICY IF EXISTS "Admins can manage all notices" ON public.notices;
CREATE POLICY "Admins can manage all notices"
ON public.notices
FOR ALL
TO authenticated
USING ((SELECT private.has_admin_access()))
WITH CHECK ((SELECT private.has_admin_access()));

DROP POLICY IF EXISTS "Admins can manage all events" ON public.events;
CREATE POLICY "Admins can manage all events"
ON public.events
FOR ALL
TO authenticated
USING ((SELECT private.has_admin_access()))
WITH CHECK ((SELECT private.has_admin_access()));

DROP POLICY IF EXISTS "Admins can read all activity logs" ON public.activity_logs;
CREATE POLICY "Admins can read all activity logs"
ON public.activity_logs
FOR SELECT
TO authenticated
USING ((SELECT private.has_admin_access()));

DROP POLICY IF EXISTS "Admins can manage all user_roles" ON public.user_roles;
CREATE POLICY "Admins can manage all user_roles"
ON public.user_roles
FOR ALL
TO authenticated
USING ((SELECT private.has_admin_access()))
WITH CHECK ((SELECT private.has_admin_access()));

-- Department names/codes are public reference data used by registration forms.
-- This removes the current RLS-enabled-with-no-policy warning for this table.
DROP POLICY IF EXISTS "Public can view departments" ON public.departments;
CREATE POLICY "Public can view departments"
ON public.departments
FOR SELECT
TO anon, authenticated
USING (true);

-- ---------------------------------------------------------------------------
-- Harden the shared timestamp trigger function.
-- It only modifies NEW.updated_at and does not need SECURITY DEFINER.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $function$
BEGIN
  NEW.updated_at = pg_catalog.now();
  RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION public.set_updated_at() IS
  'Sets updated_at for the row being changed; executes with invoker privileges.';
