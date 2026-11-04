-- Migration: 009_fix_rls_roles.sql
-- Description: Fix RLS policies to recognize super_admin and department_admin roles (not just admin).
-- Depends on: 004_rls_policies.sql, 007_fix_circular_rls.sql, 008_cleanup_rls.sql
--
-- Replaces admin checks that only matched role = 'admin' with checks that match
-- super_admin, department_admin, and admin, via both profiles.role and user_roles.

-- ============================================
-- profiles
-- ============================================

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (
  profiles.role IN ('super_admin', 'department_admin', 'admin')
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'department_admin', 'admin')
  )
)
WITH CHECK (
  profiles.role IN ('super_admin', 'department_admin', 'admin')
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'department_admin', 'admin')
  )
);

-- ============================================
-- students
-- ============================================

DROP POLICY IF EXISTS "Admins can view all students" ON public.students;
DROP POLICY IF EXISTS "Admins can manage all students" ON public.students;

CREATE POLICY "Admins can view all students"
ON public.students
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'department_admin', 'admin')
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'department_admin', 'admin')
  )
);

CREATE POLICY "Admins can manage all students"
ON public.students
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'department_admin', 'admin')
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'department_admin', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'department_admin', 'admin')
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'department_admin', 'admin')
  )
);

-- ============================================
-- faculty
-- ============================================

DROP POLICY IF EXISTS "Admins can view all faculty" ON public.faculty;
DROP POLICY IF EXISTS "Admins can manage all faculty" ON public.faculty;

CREATE POLICY "Admins can view all faculty"
ON public.faculty
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'department_admin', 'admin')
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'department_admin', 'admin')
  )
);

CREATE POLICY "Admins can manage all faculty"
ON public.faculty
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'department_admin', 'admin')
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'department_admin', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'department_admin', 'admin')
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'department_admin', 'admin')
  )
);

-- ============================================
-- announcements
-- ============================================

DROP POLICY IF EXISTS "Admins can manage all announcements" ON public.announcements;

CREATE POLICY "Admins can manage all announcements"
ON public.announcements
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'department_admin', 'admin')
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'department_admin', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'department_admin', 'admin')
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'department_admin', 'admin')
  )
);

-- ============================================
-- notices
-- ============================================

DROP POLICY IF EXISTS "Admins can manage all notices" ON public.notices;

CREATE POLICY "Admins can manage all notices"
ON public.notices
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'department_admin', 'admin')
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'department_admin', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'department_admin', 'admin')
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'department_admin', 'admin')
  )
);

-- ============================================
-- events
-- ============================================

DROP POLICY IF EXISTS "Admins can manage all events" ON public.events;

CREATE POLICY "Admins can manage all events"
ON public.events
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'department_admin', 'admin')
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'department_admin', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'department_admin', 'admin')
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'department_admin', 'admin')
  )
);

-- ============================================
-- activity_logs
-- ============================================

DROP POLICY IF EXISTS "Admins can read all activity logs" ON public.activity_logs;

CREATE POLICY "Admins can read all activity logs"
ON public.activity_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'department_admin', 'admin')
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'department_admin', 'admin')
  )
);

-- ============================================
-- user_roles
-- ============================================

DROP POLICY IF EXISTS "Admins can manage all user_roles" ON public.user_roles;

CREATE POLICY "Admins can manage all user_roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'department_admin', 'admin')
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'department_admin', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'department_admin', 'admin')
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'department_admin', 'admin')
  )
);
