// Database access layer for student/profile lookups.
// Backed by Supabase; the app still runs when Supabase is unconfigured
// because session.js guards every call with requireClient.

import { supabase } from "./supabase.ts";

const requireClient = () => {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY."
    );
  }
  return supabase;
};

export interface StudentProfile {
  id: string;
  email: string;
  student_id: string;
  name: string;
  role: string;
  registration_number?: string;
}

// Look up a student by student ID. The academic record lives in public.students
// (publicly readable) while the account fields (email, full name, role) live in
// public.profiles, joined through students.id -> profiles.id.
export const getStudentById = async (studentId: string): Promise<StudentProfile> => {
  const client = requireClient();

  const { data: student, error: studentError } = await client
    .from("students")
    .select("id, student_id, registration_number")
    .eq("student_id", studentId)
    .maybeSingle();

  if (studentError) throw new Error(studentError.message);

  if (!student) {
    const err = new Error(`No student found with ID ${studentId}`);
    (err as any).notFound = true;
    throw err;
  }

  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("email, full_name, role")
    .eq("id", student.id)
    .maybeSingle();

  if (profileError) throw new Error(profileError.message);

  return {
    id: student.id,
    email: profile?.email || "",
    student_id: student.student_id,
    name: profile?.full_name || "",
    role: profile?.role || "student",
    registration_number: student.registration_number,
  };
};

// Resolve a student's email address from their student ID, used by
// signInWithStudentId to translate an ID into an email before signing in.
export const lookupStudentEmail = async (studentId: string): Promise<string> => {
  const profile = await getStudentById(studentId);
  if (!profile.email) {
    const err = new Error(`Student ${studentId} has no email on file.`);
    (err as any).notFound = true;
    throw err;
  }
  return profile.email;
};

// Fetch the role stored on the authenticated user's profile row.
export const getUserRole = async (userId: string): Promise<string | null> => {
  const client = requireClient();
  const { data, error } = await client
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  if (error) return null;
  return data && data.role ? data.role : null;
};

const DASHBOARD_DEFAULTS = {
  totalStudents: 0,
  approved: 0,
  pending: 0,
  rejected: 0,
  suspended: 0,
  totalFaculty: 0,
  activeFaculty: 0,
  totalAdmins: 0,
};

export interface DashboardStats {
  totalStudents: number;
  approved: number;
  pending: number;
  rejected: number;
  suspended: number;
  totalFaculty: number;
  activeFaculty: number;
  totalAdmins: number;
}

// Aggregate counts for the admin dashboard overview. Falls back to zeros when
// Supabase is unconfigured or a query fails so the admin shell still renders.
export const getDashboardStats = async (): Promise<DashboardStats> => {
  if (!supabase) return { ...DASHBOARD_DEFAULTS };
  const client = requireClient();
  try {
    const { data: students, error: studentsError } = await client
      .from("students")
      .select("id, status");
    if (studentsError) throw studentsError;

    const { data: profiles, error: profilesError } = await client
      .from("profiles")
      .select("role");
    if (profilesError) throw profilesError;

    const statuses = students?.map((s) => s.status) || [];
    const roles = profiles?.map((p) => p.role) || [];
    const faculty = roles.filter((r) => r === "faculty");

    return {
      totalStudents: students?.length || 0,
      approved: statuses.filter((s) => s === "approved").length,
      pending: statuses.filter((s) => s === "pending").length,
      rejected: statuses.filter((s) => s === "rejected").length,
      suspended: statuses.filter((s) => s === "suspended").length,
      totalFaculty: faculty.length,
      activeFaculty: faculty.length,
      totalAdmins: roles.filter((r) => r === "admin").length,
    };
  } catch (error: any) {
    console.error("Failed to load dashboard stats:", error.message);
    return { ...DASHBOARD_DEFAULTS };
  }
};
