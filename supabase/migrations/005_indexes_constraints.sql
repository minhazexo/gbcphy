-- Migration: 005_indexes_constraints.sql
-- Description: Additional indexes, constraints, and foreign key cascading rules.
-- Run order: 5 of 6.
-- Depends on: 001_initial_schema.sql, 002_content_tables.sql
--
-- Note: UNIQUE constraints on student_id, registration_number, and employee_id,
-- plus FOREIGN KEY cascading rules, were defined in 001_initial_schema.sql.
-- This migration adds supporting indexes and CHECK constraints.

-- ============================================
-- CHECK constraints
-- ============================================

ALTER TABLE public.students
ADD CONSTRAINT students_status_check
CHECK (status IN ('pending', 'approved', 'rejected', 'suspended'));

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN ('student', 'faculty', 'admin'));

ALTER TABLE public.notices
ADD CONSTRAINT notices_status_check
CHECK (status IN ('draft', 'published', 'archived'));

ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_role_check
CHECK (role IN ('admin', 'student', 'faculty'));

-- ============================================
-- Indexes: departments
-- ============================================
CREATE INDEX IF NOT EXISTS idx_departments_code
ON public.departments (code);

-- ============================================
-- Indexes: profiles
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_role
ON public.profiles (role);

CREATE INDEX IF NOT EXISTS idx_profiles_email
ON public.profiles (email);

-- ============================================
-- Indexes: students
-- ============================================
CREATE INDEX IF NOT EXISTS idx_students_department_id
ON public.students (department_id);

CREATE INDEX IF NOT EXISTS idx_students_status
ON public.students (status);

CREATE INDEX IF NOT EXISTS idx_students_batch
ON public.students (batch);

CREATE INDEX IF NOT EXISTS idx_students_academic_session
ON public.students (academic_session);

CREATE INDEX IF NOT EXISTS idx_students_approved_by
ON public.students (approved_by);

-- Unique indexes already exist via UNIQUE constraints in 001:
--   students.student_id, students.registration_number

-- ============================================
-- Indexes: faculty
-- ============================================
CREATE INDEX IF NOT EXISTS idx_faculty_department_id
ON public.faculty (department_id);

CREATE INDEX IF NOT EXISTS idx_faculty_is_active
ON public.faculty (is_active);

CREATE INDEX IF NOT EXISTS idx_faculty_batch
ON public.faculty (batch);

-- Unique index already exists via UNIQUE constraint in 001:
--   faculty.employee_id

-- ============================================
-- Indexes: announcements
-- ============================================
CREATE INDEX IF NOT EXISTS idx_announcements_author_id
ON public.announcements (author_id);

CREATE INDEX IF NOT EXISTS idx_announcements_is_published
ON public.announcements (is_published);

CREATE INDEX IF NOT EXISTS idx_announcements_publish_window
ON public.announcements (publish_start, publish_end);

-- ============================================
-- Indexes: notices
-- ============================================
CREATE INDEX IF NOT EXISTS idx_notices_author_id
ON public.notices (author_id);

CREATE INDEX IF NOT EXISTS idx_notices_status
ON public.notices (status);

CREATE INDEX IF NOT EXISTS idx_notices_date
ON public.notices (date);

CREATE INDEX IF NOT EXISTS idx_notices_tag
ON public.notices (tag);

-- ============================================
-- Indexes: events
-- ============================================
CREATE INDEX IF NOT EXISTS idx_events_event_date
ON public.events (event_date);

CREATE INDEX IF NOT EXISTS idx_events_is_published
ON public.events (is_published);

-- ============================================
-- Indexes: activity_logs
-- ============================================
CREATE INDEX IF NOT EXISTS idx_activity_logs_actor_id
ON public.activity_logs (actor_id);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at
ON public.activity_logs (created_at);

CREATE INDEX IF NOT EXISTS idx_activity_logs_target
ON public.activity_logs (target_type, target_id);

-- ============================================
-- Indexes: user_roles
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id
ON public.user_roles (user_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_role
ON public.user_roles (role);
