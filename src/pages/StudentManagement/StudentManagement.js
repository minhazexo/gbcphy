import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaUser, FaUserPlus, FaEye, FaEllipsisV, FaTrash, FaSearch,
 FaChevronLeft, FaChevronRight, FaPlus, FaBan
} from "react-icons/fa";
import AdminLayout, { useToast } from "../../components/admin/layout/AdminLayout.js";
import DataTable from "../../components/admin/data-table/DataTable.js";
import Button from "../../components/admin/ui/Button.js";
import Input from "../../components/admin/ui/Input.js";
import Select from "../../components/admin/ui/Select.js";
import Modal from "../../components/admin/ui/Modal.js";
import Badge from "../../components/admin/ui/Badge.js";
import Avatar from "../../components/admin/ui/Avatar.js";
import Card from "../../components/admin/ui/Card.js";
import Separator from "../../components/admin/ui/Separator.js";
import Skeleton from "../../components/admin/ui/Skeleton.js";
import EmptyState from "../../components/admin/ui/EmptyState.js";
import { supabase, isSupabaseConfigured } from "../../data/supabase.js";
import { getStudentById } from "../../data/db.js";
import { useAuth } from "../../context/AuthContext.js";
import { useRBAC } from "../../context/RBACContext.js";
import "./StudentManagement.scss";

const BATCHES = ["2018", "2019", "2020"];
const SESSIONS = ["2018-2019", "2019-2020", "2020-2021"];
const STATUSES = ["pending", "approved", "rejected", "suspended"];
const STATUS_LABEL = { pending: "Pending", approved: "Approved", rejected: "Rejected", suspended: "Suspended" };
const STATUS_BADGE = { pending: "warning", approved: "success", rejected: "error", suspended: "secondary" };
const PAGE_SIZE = 10;

export default function StudentManagement() {

  const { hasPermission, canManageStudents } = useRBAC();
  const { addToast } = useToast();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ batch: "All", session: "All", status: "All" });
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const [modals, setModals] = useState({ view: false, status: false, delete: false, add: false });
  const [currentStudent, setCurrentStudent] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: "", notes: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [addForm, setAddForm] = useState({ full_name: "", email: "", student_id: "", batch: "", academic_session: "", status: "pending" });
  const [addErrors, setAddErrors] = useState({});

  useEffect(() => {
    document.title = "Student Management | Department of Physics";
    loadStudents();
  }, []);

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (isSupabaseConfigured) {
        const { data, error: err } = await supabase
          .from("students")
          .select("id, student_id, registration_number, batch, academic_session, status, created_at")
          .order("created_at", { ascending: false });
        if (err) throw err;

        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email, phone")
          .eq("role", "student");

        const profileMap = new Map((profiles || []).map(p => [p.id, p]));
        const merged = (data || []).map(s => ({
          ...s,
          full_name: profileMap.get(s.id)?.full_name || "N/A",
          email: profileMap.get(s.id)?.email || "\u2014",
          phone: profileMap.get(s.id)?.phone || "\u2014"
        }));
        setStudents(merged);
      } else {
        setStudents([]);
        setError("Supabase is not configured. Student records require REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.");
      }
    } catch (err) {
      setError(err.message || "Failed to load students.");
      addToast({ title: "Error", description: err.message || "Failed to load students.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const { batch, session, status } = filters;
    return students.filter((s) => {
      const matchesSearch = !term ||
        String(s.full_name || "").toLowerCase().includes(term) ||
        String(s.student_id || "").toLowerCase().includes(term) ||
        String(s.registration_number || "").toLowerCase().includes(term) ||
        String(s.email || "").toLowerCase().includes(term);
      const matchesBatch = batch === "All" || s.batch === batch;
      const matchesSession = session === "All" || s.academic_session === session;
      const matchesStatus = status === "All" || s.status === status;
      return matchesSearch && matchesBatch && matchesSession && matchesStatus;
    });
  }, [students, search, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) setPage(totalPages);
  }, [totalPages, currentPage]);

  const selectedRows = paged.filter((s) => selectedIds.has(s.id));

  const updateStatus = useCallback(async (id, status, note) => {
    if (!isSupabaseConfigured) return;
    try {
      const updates = { status };
      if (note) updates.notes = note;
      const { error } = await supabase.from("students").update(updates).eq("id", id);
      if (error) throw error;
      setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, status, notes: note || s.notes } : s)));
      setModals((prev) => ({ ...prev, status: false }));
      setCurrentStudent(null);
      setStatusForm({ status: "", notes: "" });
      addToast({ title: "Status updated", description: "Student status has been changed.", variant: "success" });
    } catch (err) {
      setError(err.message || "Failed to update status.");
      addToast({ title: "Error", description: err.message || "Failed to update status.", variant: "error" });
    }
  }, [addToast]);

  const removeStudent = useCallback(async (id) => {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) throw error;
      setStudents((prev) => prev.filter((s) => s.id !== id));
      setDeleteTarget(null);
      setModals((prev) => ({ ...prev, delete: false }));
      setPage(1);
      addToast({ title: "Deleted", description: "Student record has been removed.", variant: "success" });
    } catch (err) {
      setError(err.message || "Failed to delete student.");
      addToast({ title: "Error", description: err.message || "Failed to delete student.", variant: "error" });
    }
  }, [addToast]);

  const bulkDelete = useCallback(async (ids) => {
    if (!isSupabaseConfigured || ids.length === 0) return;
    try {
      setError(null);
      const { error } = await supabase.from("students").delete().in("id", ids);
      if (error) throw error;
      setStudents((prev) => prev.filter((s) => !ids.includes(s.id)));
      setSelectedIds(new Set());
      setDeleteTarget(null);
      setModals((prev) => ({ ...prev, delete: false }));
      setPage(1);
      addToast({ title: "Deleted", description: ids.length + " student record(s) removed.", variant: "success" });
    } catch (err) {
      setError(err.message || "Failed to delete selected students.");
      addToast({ title: "Error", description: err.message || "Failed to delete selected students.", variant: "error" });
    }
  }, [addToast]);

  const bulkApprove = useCallback(async (ids) => {
    if (!isSupabaseConfigured || ids.length === 0) return;
    if (!window.confirm("Approve " + ids.length + " selected students?")) return;
    try {
      setError(null);
      const { error } = await supabase
        .from("students")
        .update({ status: "approved" })
        .in("id", ids);
      if (error) throw error;
      setStudents((prev) => prev.map((s) => (ids.includes(s.id) ? { ...s, status: "approved" } : s)));
      setSelectedIds(new Set());
      addToast({ title: "Approved", description: ids.length + " student(s) approved.", variant: "success" });
    } catch (err) {
      setError(err.message || "Bulk approve failed.");
      addToast({ title: "Error", description: err.message || "Bulk approve failed.", variant: "error" });
    }
  }, [addToast]);

  const toggleSelection = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === paged.length && paged.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paged.map((s) => s.id)));
    }
  }, [selectedIds, paged]);

  const addStudent = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    const { full_name, email, student_id, batch, academic_session, status } = addForm;
    const nextErrors = {};
    if (!full_name.trim()) nextErrors.full_name = "Full name is required.";
    if (!email.trim()) nextErrors.email = "Email is required.";
    if (!student_id.trim()) nextErrors.student_id = "Student ID is required.";
    if (Object.keys(nextErrors).length > 0) {
      setAddErrors(nextErrors);
      return;
    }
    try {
      setError(null);
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: "TempPass123!",
        options: { data: { full_name, role: "student" } }
      });
      if (authError) throw authError;
      const userId = authData.user?.id;
      if (!userId) throw new Error("No user created.");
      await supabase.from("profiles").insert({ id: userId, full_name, email, role: "student" });
      await supabase.from("students").insert({ id: userId, student_id, registration_number: student_id, batch, academic_session, status, created_at: new Date().toISOString() });
      setModals((prev) => ({ ...prev, add: false }));
      setAddForm({ full_name: "", email: "", student_id: "", batch: "", academic_session: "", status: "pending" });
      setAddErrors({});
      loadStudents();
      addToast({ title: "Student added", description: full_name + " has been registered.", variant: "success" });
    } catch (err) {
      setAddErrors({ submit: err.message || "Failed to add student." });
      addToast({ title: "Error", description: err.message || "Failed to add student.", variant: "error" });
    }
  }, [addForm, addToast, loadStudents]);

  const handleAddChange = useCallback((field, value) => {
    setAddForm((prev) => ({ ...prev, [field]: value }));
    if (addErrors[field]) setAddErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  }, [addErrors]);

  const viewStudent = useCallback(async (id) => {
    try {
      const student = await getStudentById(id);
      setCurrentStudent(student);
      setModals((prev) => ({ ...prev, view: true }));
    } catch (err) {
      addToast({ title: "Error", description: err.message || "Failed to load student details.", variant: "error" });
    }
  }, [addToast]);

  const statusBadge = (status) => (
    <Badge variant={STATUS_BADGE[status] || "default"} size="sm" className="student-management__status-badge">
      {STATUS_LABEL[status] || status}
    </Badge>
  );

  const columns = [
    {
      key: "avatar",
      label: "Student",
      width: "260px",
      render: (row) => (
        <div className="student-management__cell-student">
          <Avatar name={row.full_name || "Student"} size="sm" className="student-management__cell-avatar" />
          <div className="student-management__cell-info">
            <span className="student-management__cell-name">{row.full_name || "N/A"}</span>
            <span className="student-management__cell-email">{row.email || "\u2014"}</span>
          </div>
        </div>
      )
    },
    { key: "student_id", label: "Student ID", width: "140px" },
    { key: "email", label: "Email", width: "220px" },
    { key: "batch", label: "Batch", width: "100px" },
    { key: "academic_session", label: "Session", width: "150px" },
    { key: "status", label: "Status", width: "130px", render: statusBadge },
    { key: "actions", label: "Actions", width: "150px" }
  ];

  const rowActions = [
    { label: "View Details", icon: <FaEye />, onClick: (row) => { viewStudent(row.id); } },
    { label: "Change Status", icon: <FaEllipsisV />, variant: "warning", onClick: (row) => { setCurrentStudent(row); setStatusForm({ status: row.status, notes: row.notes || "" }); setModals((prev) => ({ ...prev, status: true })); } },
    { label: "Delete", icon: <FaTrash />, variant: "danger", onClick: (row) => { setDeleteTarget({ id: row.id, name: row.full_name }); setModals((prev) => ({ ...prev, delete: true })); } }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <motion.div
          className="student-management"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="student-management__skeleton-wrap">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="student-management__skeleton-row">
                <Skeleton width="20%" height="1.25rem" className="student-management__skeleton-avatar" />
                <div style={{ flex: 1, marginLeft: "1rem" }}>
                  <Skeleton width="35%" height="1rem" className="student-management__skeleton-text" />
                  <Skeleton width="55%" height="0.875rem" className="student-management__skeleton-text" />
                </div>
                <Skeleton width="25%" height="1rem" className="student-management__skeleton-text" />
                <Skeleton width="20%" height="1rem" className="student-management__skeleton-text" />
                <Skeleton width="25%" height="1rem" className="student-management__skeleton-text" />
                <Skeleton width="15%" height="1rem" className="student-management__skeleton-text" />
                <Skeleton width="30%" height="1rem" className="student-management__skeleton-text" />
              </div>
            ))}
          </div>
        </motion.div>
      </AdminLayout>
    );
  }

  const empty = filtered.length === 0;
  const canWrite = canManageStudents || hasPermission("canManageStudents");

  return (
    <AdminLayout>
      <motion.div
        className="student-management"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <header className="student-management__header">
          <div className="student-management__header-content">
            <h1 className="student-management__title">Student Management</h1>
            <p className="student-management__subtitle">Manage student records, approvals, and account status.</p>
          </div>
          <div className="student-management__header-actions">
            <Button variant="primary" size="sm" icon={<FaUserPlus />} disabled={!canWrite} onClick={() => setModals((prev) => ({ ...prev, add: true }))}>
              Add Student
            </Button>
          </div>
        </header>

        {error && (
          <div className="student-management__error">
            <FaBan className="student-management__error-icon" aria-hidden="true" />
            <span className="student-management__error-message">{error}</span>
          </div>
        )}

        <div className="student-management__toolbar">
          <Input
            leftIcon={<FaSearch />}
            placeholder="Search name, ID, registration, email"
            value={search}
            onChange={(value) => { setSearch(value); setPage(1); }}
            size="sm"
            aria-label="Search students"
            className="student-management__search-input"
          />
          <div className="student-management__filter-group">
            <Select
              label="Batch"
              value={filters.batch}
              onChange={(value) => { setFilters((prev) => ({ ...prev, batch: value })); setPage(1); }}
              options={[{ label: "All batches", value: "All" }, ...BATCHES.map((b) => ({ label: b, value: b }))]}
              placeholder="All batches"
              size="sm"
              aria-label="Filter by batch"
              className="student-management__filter-select"
            />
            <Select
              label="Session"
              value={filters.session}
              onChange={(value) => { setFilters((prev) => ({ ...prev, session: value })); setPage(1); }}
              options={[{ label: "All sessions", value: "All" }, ...SESSIONS.map((s) => ({ label: s, value: s }))]}
              placeholder="All sessions"
              size="sm"
              aria-label="Filter by session"
              className="student-management__filter-select"
            />
            <Select
              label="Status"
              value={filters.status}
              onChange={(value) => { setFilters((prev) => ({ ...prev, status: value })); setPage(1); }}
              options={[{ label: "All statuses", value: "All" }, ...STATUSES.map((s) => ({ label: STATUS_LABEL[s], value: s }))]}
              placeholder="All statuses"
              size="sm"
              aria-label="Filter by status"
              className="student-management__filter-select"
            />
          </div>
          <span className="student-management__count">
            {filtered.length} of {students.length} students
          </span>
        </div>

        {selectedIds.size > 0 && (
          <div className="student-management__bulk-toolbar">
            <span className="student-management__bulk-count">{selectedIds.size} {selectedIds.size === 1 ? "student" : "students"} selected</span>
            <Button variant="success" size="sm" onClick={() => bulkApprove(selectedRows.map((r) => r.id))} disabled={!canWrite}>
              <FaPlus /> Approve All Selected
            </Button>
            <Button variant="danger" size="sm" onClick={() => { setDeleteTarget({ ids: selectedRows.map((r) => r.id), count: selectedRows.length }); setModals((prev) => ({ ...prev, delete: true })); }} disabled={!canWrite}>
              <FaTrash /> Delete Selected
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>
              Clear selection
            </Button>
          </div>
        )}

        <div className="student-management__table">
          <DataTable
            columns={columns}
            data={paged}
            loading={false}
            pageSize={PAGE_SIZE}
            searchable={false}
            filterable={false}
            sortable={true}
            paginatable={false}
            rowActions={rowActions}
            selectable={true}
            onSelectionChange={(ids) => setSelectedIds(new Set(ids))}
            itemId="id"
            emptyState={{
              title: "No students found",
              description: empty ? "No students match the current search and filters." : "No student records have been added yet.",
              action: (
                <Button variant="outline" size="sm" onClick={() => { setSearch(""); setFilters({ batch: "All", session: "All", status: "All" }); setPage(1); }}>
                  Clear filters
                </Button>
              )
            }}
            className="student-management__data-table"
          />
        </div>

        <div className="student-management__pagination">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage(1)}
            disabled={currentPage === 1}
            aria-label="First page"
          >
            First
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <FaChevronLeft />
          </Button>
          <span className="student-management__page-info">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <FaChevronRight />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Last page"
          >
            Last
          </Button>
        </div>

        {empty && !loading && (
          <div className="student-management__empty">
            <EmptyState
              icon={<FaUser className="student-management__empty-icon" aria-hidden="true" />}
              title="No students found"
              description={students.length > 0 ? "No students match the current search and filters. Try clearing the filters." : "No student records have been added yet."}
              action={
                <Button variant="primary" size="sm" icon={<FaPlus />} onClick={() => setModals((prev) => ({ ...prev, add: true }))}>
                  Add Student
                </Button>
              }
            />
          </div>
        )}

        <Modal
          isOpen={modals.view}
          onClose={() => setModals((prev) => ({ ...prev, view: false }))}
          title="Student Details"
          size="lg"
          className="student-management__modal student-management__modal-view"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="student-management__modal-body"
          >
            {currentStudent && (
              <div className="student-management__detail-grid">
                <Card padding="md" className="student-management__detail-card">
                  <div className="student-management__detail-row">
                    <Avatar name={currentStudent.full_name || "Student"} size="lg" className="student-management__detail-avatar" />
                    <div>
                      <h3 className="student-management__detail-name">{currentStudent.full_name || "N/A"}</h3>
                      <p className="student-management__detail-email">{currentStudent.email || "\u2014"}</p>
                    </div>
                  </div>
                  <div className="student-management__detail-fields">
                    <div className="student-management__detail-field">
                      <span className="student-management__detail-label">Student ID</span>
                      <span className="student-management__detail-value">{currentStudent.student_id || "N/A"}</span>
                    </div>
                    <div className="student-management__detail-field">
                      <span className="student-management__detail-label">Registration Number</span>
                      <span className="student-management__detail-value">{currentStudent.registration_number || "N/A"}</span>
                    </div>
                    <div className="student-management__detail-field">
                      <span className="student-management__detail-label">Batch</span>
                      <span className="student-management__detail-value">{currentStudent.batch || "N/A"}</span>
                    </div>
                    <div className="student-management__detail-field">
                      <span className="student-management__detail-label">Academic Session</span>
                      <span className="student-management__detail-value">{currentStudent.academic_session || "N/A"}</span>
                    </div>
                    <div className="student-management__detail-field">
                      <span className="student-management__detail-label">Department</span>
                      <span className="student-management__detail-value">Department of Physics</span>
                    </div>
                    <div className="student-management__detail-field">
                      <span className="student-management__detail-label">Phone</span>
                      <span className="student-management__detail-value">{currentStudent.phone || "\u2014"}</span>
                    </div>
                    <div className="student-management__detail-field">
                      <span className="student-management__detail-label">Email</span>
                      <span className="student-management__detail-value">{currentStudent.email || "N/A"}</span>
                    </div>
                    <div className="student-management__detail-field">
                      <span className="student-management__detail-label">Status</span>
                      <span className="student-management__detail-value">{statusBadge(currentStudent.status)}</span>
                    </div>
                    {currentStudent.notes && (
                      <div className="student-management__detail-field">
                        <span className="student-management__detail-label">Admin Notes</span>
                        <span className="student-management__detail-value">{currentStudent.notes}</span>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </motion.div>
          <div className="student-management__modal-footer">
            <Button variant="ghost" size="sm" onClick={() => setModals((prev) => ({ ...prev, view: false }))}>Close</Button>
            <Link to={"/admin/students/" + currentStudent?.id} className="student-management__open-link">Open profile</Link>
          </div>
        </Modal>

        <Modal
          isOpen={modals.status}
          onClose={() => setModals((prev) => ({ ...prev, status: false }))}
          title="Change Status"
          description={currentStudent ? "Update status for " + currentStudent.full_name : undefined}
          size="md"
          className="student-management__modal student-management__modal-status"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="student-management__modal-body"
          >
            <div className="student-management__form-group">
              <label className="student-management__form-label">New status</label>
              <Select
                value={statusForm.status}
                onChange={(value) => setStatusForm((prev) => ({ ...prev, status: value }))}
                options={STATUSES.map((s) => ({ label: STATUS_LABEL[s], value: s }))}
                size="sm"
                aria-label="New status"
                className="student-management__status-select"
              />
            </div>
            <div className="student-management__form-group">
              <label className="student-management__form-label">Notes (optional)</label>
              <textarea
                className="student-management__form-textarea"
                rows="2"
                placeholder="Reason or note"
                value={statusForm.notes}
                onChange={(e) => setStatusForm((prev) => ({ ...prev, notes: e.target.value }))}
                aria-label="Admin notes"
              />
            </div>
          </motion.div>
          <div className="student-management__modal-footer">
            <Button variant="ghost" size="sm" onClick={() => setModals((prev) => ({ ...prev, status: false }))}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={() => currentStudent && updateStatus(currentStudent.id, statusForm.status, statusForm.notes || "")}>Save changes</Button>
          </div>
        </Modal>

        <Modal
          isOpen={modals.delete}
          onClose={() => setModals((prev) => ({ ...prev, delete: false }))}
          title="Delete Student"
          description={deleteTarget && deleteTarget.ids ? "Delete " + deleteTarget.count + " selected student record(s)? This cannot be undone." : deleteTarget ? 'Are you sure you want to delete "' + deleteTarget.name + '"? This cannot be undone.' : undefined}
          size="sm"
          className="student-management__modal student-management__modal-delete"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="student-management__modal-body"
          >
            <p className="student-management__delete-message">This action cannot be undone.</p>
          </motion.div>
          <div className="student-management__modal-footer">
            <Button variant="ghost" size="sm" onClick={() => setModals((prev) => ({ ...prev, delete: false }))}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={() => {
              if (deleteTarget?.ids) bulkDelete(deleteTarget.ids);
              else if (deleteTarget?.id) removeStudent(deleteTarget.id);
            }}>Delete</Button>
          </div>
        </Modal>

        <Modal
          isOpen={modals.add}
          onClose={() => setModals((prev) => ({ ...prev, add: false }))}
          title="Add Student"
          description="Register a new student record."
          size="md"
          className="student-management__modal student-management__modal-add"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="student-management__modal-body"
          >
            {addErrors.submit && <div className="student-management__form-error">{addErrors.submit}</div>}
            <div className="student-management__form-group">
              <label className="student-management__form-label">Full Name <span className="student-management__form-required">*</span></label>
              <Input
                value={addForm.full_name}
                onChange={(v) => handleAddChange("full_name", v)}
                placeholder="Enter full name"
                error={addErrors.full_name}
                size="sm"
                aria-label="Full name"
              />
              {addErrors.full_name && <p className="student-management__form-helper-error">{addErrors.full_name}</p>}
            </div>
            <div className="student-management__form-group">
              <label className="student-management__form-label">Email <span className="student-management__form-required">*</span></label>
              <Input
                type="email"
                value={addForm.email}
                onChange={(v) => handleAddChange("email", v)}
                placeholder="Enter email address"
                error={addErrors.email}
                size="sm"
                aria-label="Email"
              />
              {addErrors.email && <p className="student-management__form-helper-error">{addErrors.email}</p>}
            </div>
            <div className="student-management__form-group">
              <label className="student-management__form-label">Student ID <span className="student-management__form-required">*</span></label>
              <Input
                value={addForm.student_id}
                onChange={(v) => handleAddChange("student_id", v)}
                placeholder="Enter student ID"
                error={addErrors.student_id}
                size="sm"
                aria-label="Student ID"
              />
              {addErrors.student_id && <p className="student-management__form-helper-error">{addErrors.student_id}</p>}
            </div>
            <div className="student-management__form-row">
              <div className="student-management__form-group">
                <label className="student-management__form-label">Batch</label>
                <Select
                  value={addForm.batch}
                  onChange={(v) => handleAddChange("batch", v)}
                  options={BATCHES.map((b) => ({ label: b, value: b }))}
                  placeholder="Select batch"
                  size="sm"
                  aria-label="Batch"
                />
              </div>
              <div className="student-management__form-group">
                <label className="student-management__form-label">Session</label>
                <Select
                  value={addForm.academic_session}
                  onChange={(v) => handleAddChange("academic_session", v)}
                  options={SESSIONS.map((s) => ({ label: s, value: s }))}
                  placeholder="Select session"
                  size="sm"
                  aria-label="Session"
                />
              </div>
              <div className="student-management__form-group">
                <label className="student-management__form-label">Status</label>
                <Select
                  value={addForm.status}
                  onChange={(v) => handleAddChange("status", v)}
                  options={STATUSES.map((s) => ({ label: STATUS_LABEL[s], value: s }))}
                  placeholder="Select status"
                  size="sm"
                  aria-label="Status"
                />
              </div>
            </div>
          </motion.div>
          <div className="student-management__modal-footer">
            <Button variant="ghost" size="sm" onClick={() => setModals((prev) => ({ ...prev, add: false }))}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={addStudent} disabled={!canWrite}>Register Student</Button>
          </div>
        </Modal>
      </motion.div>
    </AdminLayout>
  );
}

