// FacultyManagement page — premium redesign.

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FaUserPlus,
  FaTrash,
  FaEdit,
  FaEye,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { supabase, isSupabaseConfigured } from "../../../data/supabase.ts";
import { useRBAC } from "../../../context/RBACContext.tsx";
import AdminLayout from "../../../layouts/AdminLayout";
import DataTable from "../../../components/admin/data-table/DataTable.tsx";
import { Button, Input, Select, Badge, Avatar, Skeleton } from "../../../components/admin/ui/index.tsx";
import PageHeader from "../../../components/admin/ui/PageHeader";
import Separator from "../../../components/admin/ui/Separator";
import "./faculty-management.scss";

const DEPARTMENTS = ["Physics", "Chemistry", "Mathematics", "Botany", "Zoology"];
const PAGE_SIZE = 10;
const STATUS_LABEL: Record<string, string> = { active: "Active", inactive: "Inactive", pending: "Pending" };

interface FacultyMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  status: string;
  photo: string | null;
}

const FacultyManagement = () => {
  const { canManageFaculty } = useRBAC();

  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);

  useEffect(() => {
    document.title = "Faculty Management | Department of Physics";
    if (isSupabaseConfigured) {
      const load = async () => {
        try {
          setLoading(true);
          const { data, error } = await supabase!
            .from("profiles")
            .select("*")
            .or("role.eq.faculty,role.eq.teacher");
          if (error) throw error;
          setFaculty((data || []).map((p: any) => ({
            id: p.id,
            name: p.full_name || p.name || "Unknown",
            email: p.email || "",
            phone: p.phone || "",
            department: p.department || "Physics",
            designation: p.role || "faculty",
            status: p.status || "active",
            photo: p.avatar_url || null
          })));
        } catch (err: any) {
          console.error("Failed to load faculty:", err.message);
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
    return faculty.filter((f) => {
      const matchesSearch = !term ||
        f.name.toLowerCase().includes(term) ||
        f.email.toLowerCase().includes(term);
      const matchesDept = departmentFilter === "All" || f.department === departmentFilter;
      const matchesStatus = statusFilter === "All" || f.status === statusFilter;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [faculty, search, departmentFilter, statusFilter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);

  if (!canManageFaculty) {
    return (
      <AdminLayout>
        <motion.div className="faculty-management" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <PageHeader
            title="Not authorized"
            description="You do not have permission to manage faculty."
          />
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <h2>Not authorized</h2>
            <p>You do not have permission to manage faculty.</p>
          </div>
        </motion.div>
      </AdminLayout>
    );
  }

  const renderPhoto = (row: FacultyMember) => (
    <Avatar src={row.photo ?? undefined} name={row.name} size="sm" />
  );

  const renderName = (row: FacultyMember) => (
    <div className="faculty-management__cell-name">
      <strong>{row.name}</strong>
      <span className="faculty-management__cell-dept">{row.department}</span>
    </div>
  );

  const renderStatus = (row: FacultyMember) => (
    <Badge variant={row.status === "active" ? "success" : "warning"} size="sm">
      {STATUS_LABEL[row.status as keyof typeof STATUS_LABEL] || row.status}
    </Badge>
  );

  const renderActions = (_row: FacultyMember) => (
    <div className="faculty-management__actions">
      <Button variant="ghost" size="sm" icon={<FaEye />} aria-label="View faculty" />
      <Button variant="ghost" size="sm" icon={<FaEdit />} aria-label="Edit faculty" />
      <Button variant="danger" size="sm" icon={<FaTrash />} aria-label="Delete faculty" />
    </div>
  );

  const columns = [
    { key: "photo", label: "Photo", width: "90px", render: renderPhoto },
    { key: "name", label: "Name", searchable: true, render: renderName },
    { key: "email", label: "Email", searchable: true },
    { key: "phone", label: "Phone" },
    { key: "department", label: "Department" },
    { key: "designation", label: "Designation" },
    { key: "status", label: "Status", render: renderStatus },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: renderActions
    }
  ];

  return (
    <AdminLayout>
      <motion.div className="faculty-management" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader
          title="Faculty Management"
          description="Manage department faculty records."
          actions={
            <Button variant="primary" icon={<FaUserPlus size={16} />} disabled={!canManageFaculty}>
              Add Faculty
            </Button>
          }
        />

        <div className="faculty-management__toolbar">
          <Input
            leftIcon={<FaSearch />}
            placeholder="Search faculty by name or email..."
            value={search}
            onChange={(value: string) => setSearch(value)}
            size="sm"
            aria-label="Search faculty"
          />
          <Separator orientation="vertical" className="faculty-management__toolbar-separator" aria-hidden="true" />
          <Select
            label="Department"
            value={departmentFilter}
            onChange={(value: string) => setDepartmentFilter(value)}
            options={[{ label: "All", value: "All" }, ...DEPARTMENTS.map((d) => ({ label: d, value: d }))]}
            size="sm"
            aria-label="Filter by department"
          />
          <Select
            label="Status"
            value={statusFilter}
            onChange={(value: string) => setStatusFilter(value)}
            options={[
              { label: "All", value: "All" },
              ...Object.keys(STATUS_LABEL).map((s) => ({ label: STATUS_LABEL[s], value: s }))
            ]}
            size="sm"
            aria-label="Filter by status"
          />
        </div>

        { loading ? (
          <div className="faculty-management__loading">
            <Skeleton width="100%" height="420px" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={paginated}
            loading={false}
            searchable={false}
            filterable={false}
            sortable={false}
            paginatable={false}
            itemId="id"
            emptyState={{
              icon: <Avatar name="No faculty" size="lg" />,
              title: "No faculty members",
              description: "Add faculty members to the roster.",
              action: <Button variant="outline" size="sm" onClick={() => {}}>Add faculty</Button>
            }}
          />
        )}

        <div className="faculty-management__pagination">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
            <FaChevronLeft size={14} /> Prev
          </Button>
          <span className="faculty-management__pagination-info">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page * PAGE_SIZE >= filtered.length} onClick={() => setPage(page + 1)}>
            Next <FaChevronRight size={14} />
          </Button>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default FacultyManagement;
