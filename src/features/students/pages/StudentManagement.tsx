// StudentManagement page — premium redesign.

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FaUserPlus, FaEye, FaEllipsisV, FaSearch,
  FaChevronLeft, FaChevronRight, FaBan
} from "react-icons/fa";
import AdminLayout from "../../../layouts/AdminLayout";
import DataTable from "../../../components/admin/data-table/DataTable.tsx";
import Button from "../../../components/admin/ui/Button";
import Input from "../../../components/admin/ui/Input";
import Select from "../../../components/admin/ui/Select";
import Badge from "../../../components/admin/ui/Badge";
import Avatar from "../../../components/admin/ui/Avatar";
import Skeleton from "../../../components/admin/ui/Skeleton";
import EmptyState from "../../../components/admin/ui/EmptyState";
import PageHeader from "../../../components/admin/ui/PageHeader";
import Separator from "../../../components/admin/ui/Separator";
import { supabase, isSupabaseConfigured } from "../../../data/supabase.ts";
import { useRBAC } from "../../../context/RBACContext.tsx";
import "./student-management.scss";

const BATCHES = ["2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"];
const STATUSES = ["pending", "approved", "rejected", "suspended"];
const STATUS_LABEL: Record<string, string> = { pending: "Pending", approved: "Approved", rejected: "Rejected", suspended: "Suspended" };
const STATUS_BADGE: Record<string, string> = { pending: "warning", approved: "success", rejected: "error", suspended: "secondary" };

interface Student {
  id: string;
  student_id: string;
  full_name: string;
  email: string;
  phone: string;
  batch: string;
  academic_session: string;
  status: string;
  department: string;
}

const StudentManagement = () => {
  const { canManageStudents } = useRBAC();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [batchFilter, setBatchFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    document.title = "Student Management | Department of Physics";
    if (isSupabaseConfigured) {
      const load = async () => {
        try {
          setLoading(true);
          // Academic details live in students; personal details live in profiles.
          // Both tables use the authenticated user's UUID as their shared ID.
          const { data, error } = await supabase!
            .from("students")
            .select("id, student_id, registration_number, batch, academic_session, status, department_id, created_at")
            .order("created_at", { ascending: false });
          if (error) throw error;

          const studentRows = data || [];
          const studentIds = studentRows.map((student: any) => student.id).filter(Boolean);

          let profilesById = new Map<string, { full_name: string | null; email: string | null; phone: string | null }>();
          if (studentIds.length > 0) {
            const { data: profiles, error: profilesError } = await supabase!
              .from("profiles")
              .select("id, full_name, email, phone")
              .in("id", studentIds);
            if (profilesError) throw profilesError;

            profilesById = new Map<string, { full_name: string | null; email: string | null; phone: string | null }>(
              (profiles || []).map((profile: any) => [profile.id, profile] as const)
            );
          }

          setStudents(studentRows.map((student: any) => {
            const profile = profilesById.get(student.id);
            return {
              id: student.id,
              student_id: student.student_id || "",
              full_name: profile?.full_name?.trim() || "Name unavailable",
              email: profile?.email || "—",
              phone: profile?.phone || "",
              batch: student.batch || "",
              academic_session: student.academic_session || "",
              status: student.status || "pending",
              department: ""
            };
          }));
        } catch (err: any) {
          console.error("Failed to load students:", err.message);
        } finally {
          setLoading(false);
        }
      };
      load();
    } else {
      setLoading(false);
    }
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return students.filter((s) => {
      const matchesSearch = !term ||
        s.full_name.toLowerCase().includes(term) ||
        s.student_id.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term);
      const matchesBatch = batchFilter === "All" || s.batch === batchFilter;
      const matchesStatus = statusFilter === "All" || s.status === statusFilter;
      return matchesSearch && matchesBatch && matchesStatus;
    });
  }, [students, search, batchFilter, statusFilter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);

  if (!canManageStudents) {
    return (
      <AdminLayout>
        <motion.div className="student-management" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <PageHeader
            title="Not authorized"
            description="You do not have permission to manage students."
          />
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <EmptyState
              icon={<FaBan />}
              title="Not authorized"
              description="You do not have permission to manage students."
            />
          </div>
        </motion.div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <motion.div className="student-management" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader
          title="Student Management"
          description="Manage enrolled students and their records."
          actions={
            <Button variant="primary" icon={<FaUserPlus size={16} />} disabled={!canManageStudents}>
              Add Student
            </Button>
          }
        />

        <div className="student-management__toolbar">
          <Input
            leftIcon={<FaSearch />}
            placeholder="Search students by name or ID..."
            value={search}
            onChange={(value: string) => setSearch(value)}
            size="sm"
            aria-label="Search students"
          />
          <Separator orientation="vertical" className="student-management__toolbar-separator" aria-hidden="true" />
          <Select
            label="Batch"
            value={batchFilter}
            onChange={(value: string) => setBatchFilter(value)}
            options={[{ label: "All", value: "All" }, ...BATCHES.map(b => ({ label: b, value: b }))]}
            size="sm"
            aria-label="Filter by batch"
          />
          <Select
            label="Status"
            value={statusFilter}
            onChange={(value: string) => setStatusFilter(value)}
            options={[{ label: "All", value: "All" }, ...STATUSES.map(s => ({ label: STATUS_LABEL[s], value: s }))]}
            size="sm"
            aria-label="Filter by status"
          />
        </div>

        {loading ? (
          <div className="student-management__loading">
            <Skeleton width="100%" height="420px" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<FaBan />}
            title="No students found"
            description="Try adjusting your search or filters."
          />
        ) : (
          <>
            <DataTable
              columns={[
                {
                  key: "avatar",
                  label: "Student",
                  width: "110px",
                  render: (row: Student) => (
                    <div className="student-management__cell-student">
                      <Avatar name={row.full_name} size="sm" />
                      <div>
                        <strong>{row.full_name}</strong>
                        <br />
                        <span className="student-management__cell-id">{row.student_id}</span>
                      </div>
                    </div>
                  )
                },
                { key: "email", label: "Email", searchable: true },
                { key: "batch", label: "Batch" },
                { key: "academic_session", label: "Session" },
                {
                  key: "status",
                  label: "Status",
                  render: (row: Student) => (
                    <Badge variant={STATUS_BADGE[row.status] as React.ComponentProps<typeof Badge>["variant"] || "default"} size="sm">
                      {STATUS_LABEL[row.status] || row.status}
                    </Badge>
                  )
                },
                {
                  key: "actions",
                  label: "Actions",
                  align: "right",
                  render: (_row: Student) => (
                    <div className="student-management__actions">
                      <Button variant="ghost" size="sm" icon={<FaEye />} aria-label="View student" />
                      <Button variant="ghost" size="sm" icon={<FaEllipsisV />} aria-label="More actions" />
                    </div>
                  )
                }
              ]}
              data={paginated}
              loading={false}
              searchable={false}
              filterable={false}
              sortable={false}
              paginatable={false}
              itemId="id"
            />

            <div className="student-management__pagination">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                <FaChevronLeft size={14} /> Prev
              </Button>
              <span className="student-management__pagination-info">
                Page {page} of {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page * PAGE_SIZE >= filtered.length} onClick={() => setPage(page + 1)}>
                Next <FaChevronRight size={14} />
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </AdminLayout>
  );
};

export default StudentManagement;
