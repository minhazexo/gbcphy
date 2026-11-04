import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FaClipboardList,
  FaUserCheck,
  FaUserTimes,
  FaCheck,
  FaTimes,
  FaSearch,
  FaFilter,
  FaFileAlt,
  FaClock,
  FaExclamationTriangle
} from "react-icons/fa";
import { supabase, isSupabaseConfigured } from "../../../data/supabase.js";
import { useAuth } from "../../../context/AuthContext.js";
import { useRBAC } from "../../../context/RBACContext.js";
import AdminLayout from "../../../layouts/AdminLayout/AdminLayout.js";
import { useToast } from "../../../layouts/AdminLayout/AdminLayout.js";
import DataTable from "../../../components/admin/data-table/DataTable.js";
import Button from "../../../components/admin/ui/Button.js";
import Input from "../../../components/admin/ui/Input.js";
import Select from "../../../components/admin/ui/Select.js";
import Modal from "../../../components/admin/ui/Modal.js";
import Badge from "../../../components/admin/ui/Badge.js";
import Avatar from "../../../components/admin/ui/Avatar.js";
import Card from "../../../components/admin/ui/Card.js";
import Separator from "../../../components/admin/ui/Separator.js";
import EmptyState from "../../../components/admin/ui/EmptyState.js";
import "../../../styles/registration-approval.scss";

const SESSIONS = ["2018-2019", "2019-2020", "2020-2021", "2021-2022", "2022-2023"];
const STATUSES = ["pending", "approved", "rejected", "suspended"];
const STATUS_LABEL = { pending: "Pending", approved: "Approved", rejected: "Rejected", suspended: "Suspended" };
const STATUS_VARIANT = { pending: "warning", approved: "success", rejected: "error", suspended: "default" };
const STATUS_ICON = { pending: FaClock, approved: FaCheck, rejected: FaTimes, suspended: FaExclamationTriangle };

export default function RegistrationApproval() {
  useEffect(() => {
    document.title = "Registration Approvals | Department of Physics";
  }, []);

  const { userProfile } = useAuth();
  const { canApproveRegistrations } = useRBAC();
  const { addToast } = useToast();

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [sessionFilter, setSessionFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [approveModal, setApproveModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [viewModal, setViewModal] = useState(null);
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");
  const [rejectError, setRejectError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        if (isSupabaseConfigured) {
          const { data, error: dbError } = await supabase
            .from("students")
            .select("id, student_id, registration_number, batch, academic_session, status, notes, created_at")
            .order("created_at", { ascending: false });
          if (dbError) throw dbError;

          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name, email, phone")
            .eq("role", "student");

          const profileMap = new Map((profiles || []).map((p) => [p.id, p]));
          const merged = (data || []).map((s) => ({
            ...s,
            full_name: profileMap.get(s.id)?.full_name || "N/A",
            email: profileMap.get(s.id)?.email || "�",
            phone: profileMap.get(s.id)?.phone || "�"
          }));
          setRegistrations(merged);
        } else {
          setRegistrations([]);
          setError("Supabase is not configured. Registrations require REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.");
        }
      } catch (err) {
        setError(err.message || "Failed to load registrations.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const pendingCount = registrations.filter((r) => r.status === "pending").length;
  const today = new Date().toDateString();
  const approvedToday = registrations.filter(
    (r) => r.status === "approved" && new Date(r.created_at).toDateString() === today
  ).length;
  const rejectedCount = registrations.filter((r) => r.status === "rejected").length;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return registrations.filter((r) => {
      const matchesSearch = !term ||
        String(r.full_name || "").toLowerCase().includes(term) ||
        String(r.student_id || "").toLowerCase().includes(term) ||
        String(r.email || "").toLowerCase().includes(term);
      const matchesSession = sessionFilter === "All" || r.academic_session === sessionFilter;
      const matchesStatus = statusFilter === "All" || r.status === statusFilter;
      return matchesSearch && matchesSession && matchesStatus;
    });
  }, [registrations, search, sessionFilter, statusFilter]);

  const updateStatus = useCallback(async (id, status, note) => {
    if (!isSupabaseConfigured) return;
    if (!canApproveRegistrations) return;
    setUpdatingId(id);
    try {
      const updates = { status, updated_at: new Date().toISOString() };
      if (note) updates.notes = note;
      const { error } = await supabase.from("students").update(updates).eq("id", id);
      if (error) throw error;
      setRegistrations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status, notes: note || r.notes, updated_at: updates.updated_at } : r))
      );
      addToast({
        title: `Registration ${status === "approved" ? "Approved" : "Rejected"}`,
        variant: status === "approved" ? "success" : "error",
        description: `Student registration has been ${status}.`
      });
      setApproveModal(null);
      setRejectModal(null);
      setNotes("");
      setReason("");
      setRejectError(null);
    } catch (err) {
      setRejectError(err.message || "Failed to update registration.");
      addToast({ title: "Update failed", variant: "error", description: err.message || "Could not update registration status." });
    } finally {
      setUpdatingId(null);
    }
  }, [canApproveRegistrations, addToast]);

  const columns = useMemo(
    () => [
      {
        key: "student",
        label: "Student",
        searchable: true,
        width: "250px",
        sortable: false,
        render: (row) => (
          <div className="registration-approval__cell-student">
            <Avatar name={row.full_name} size="sm" className="registration-approval__cell-avatar" />
            <div className="registration-approval__cell-student-info">
              <div className="registration-approval__cell-student-name">{row.full_name || "N/A"}</div>
              <div className="registration-approval__cell-student-email">{row.email || "�"}</div>
            </div>
          </div>
        )
      },
      { key: "student_id", label: "Student ID", searchable: true },
      { key: "email", label: "Email", searchable: true },
      { key: "batch", label: "Batch" },
      { key: "academic_session", label: "Session" },
      {
        key: "status",
        label: "Status",
        sortable: false,
        render: (row) => {
          const variant = STATUS_VARIANT[row.status] || "default";
          const Icon = STATUS_ICON[row.status];
          return (
            <Badge variant={variant} className="registration-approval__status-badge">
              <span className="registration-approval__status-icon" aria-hidden="true">
                <Icon size={10} />
              </span>
              {STATUS_LABEL[row.status] || row.status}
            </Badge>
          );
        }
      },
      {
        key: "created_at",
        label: "Applied At",
        sortable: true,
        render: (row) => (
          <div className="registration-approval__cell-applied">
            <FaClock className="registration-approval__cell-icon" aria-hidden="true" />
            <span>
              {row.created_at ? new Date(row.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "�"}
            </span>
          </div>
        )
      },
      {
        key: "actions",
        label: "Actions",
        sortable: false,
        filterable: false,
        width: "210px",
        render: (row) => (
          <div className="registration-approval__cell-actions">
            {row.status === "pending" ? (
              <>
                <Button
                  variant="success"
                  size="sm"
                  fullWidth
                  onClick={() => setApproveModal({ id: row.id, name: row.full_name })}
                  disabled={!canApproveRegistrations || updatingId === row.id}
                  loading={updatingId === row.id}
                  title="Approve registration"
                >
                  <FaUserCheck size={14} /> Approve
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  fullWidth
                  onClick={() => setRejectModal({ id: row.id, name: row.full_name })}
                  disabled={!canApproveRegistrations || updatingId === row.id}
                  loading={updatingId === row.id}
                  title="Reject registration"
                >
                  <FaUserTimes size={14} /> Reject
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => setViewModal(row)}
                disabled={updatingId === row.id}
                title="View details"
              >
                <FaFileAlt size={14} /> View
              </Button>
            )}
          </div>
        )
      }
    ],
    [canApproveRegistrations, updatingId]
  );

  if (!canApproveRegistrations) {
    return (
      <AdminLayout>
        <motion.div className="registration-approval" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <EmptyState
            icon={<FaExclamationTriangle />}
            title="Not authorized"
            description="You do not have permission to approve student registrations."
            action={<Button variant="primary" onClick={() => {}}>Go to Dashboard</Button>}
          />
        </motion.div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <motion.div className="registration-approval" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        {error && (
          <div className="registration-approval__error" role="alert">
            <FaExclamationTriangle aria-hidden="true" />
            {error}
          </div>
        )}

        <header className="registration-approval__header">
          <div className="registration-approval__header-brand">
            <div className="registration-approval__header-icon" aria-hidden="true">
              <FaClipboardList />
            </div>
            <div>
              <h1>Registration Approvals</h1>
              <p>Review and approve new student registrations</p>
            </div>
          </div>
          <div className="registration-approval__header-user">
            {userProfile && (
              <div className="registration-approval__user-chip">
                <Avatar name={userProfile.full_name} src={userProfile.avatar_url} size="sm" />
                <span>{userProfile.full_name}</span>
              </div>
            )}
          </div>
        </header>

        <div className="approval-stats">
          <Card padding="sm" className="approval-stats__card approval-stats__card--pending">
            <div className="approval-stats__head">
              <span className="approval-stats__label">Pending</span>
              <FaClock className="approval-stats__icon" aria-hidden="true" />
            </div>
            <span className="approval-stats__value">{pendingCount}</span>
            <span className="approval-stats__sub">registrations awaiting review</span>
          </Card>
          <Card padding="sm" className="approval-stats__card approval-stats__card--approved">
            <div className="approval-stats__head">
              <span className="approval-stats__label">Approved today</span>
              <FaCheck className="approval-stats__icon" aria-hidden="true" />
            </div>
            <span className="approval-stats__value">{approvedToday}</span>
            <span className="approval-stats__sub">registrations approved today</span>
          </Card>
          <Card padding="sm" className="approval-stats__card approval-stats__card--rejected">
            <div className="approval-stats__head">
              <span className="approval-stats__label">Rejected</span>
              <FaTimes className="approval-stats__icon" aria-hidden="true" />
            </div>
            <span className="approval-stats__value">{rejectedCount}</span>
            <span className="approval-stats__sub">registrations rejected</span>
          </Card>
        </div>

        <section className="registration-approval__toolbar">
          <Input
            leftIcon={<FaSearch />}
            placeholder="Search name, student ID, email"
            value={search}
            onChange={setSearch}
            size="sm"
            aria-label="Search registrations"
          />
          <Separator orientation="vertical" className="registration-approval__toolbar-separator" aria-hidden="true" />
          <div className="registration-approval__filter-group">
            <span className="registration-approval__filter-label">
              <FaFilter /> Status
            </span>
            <div className="registration-approval__status-chips">
              {STATUSES.map((s) => {
                const active = statusFilter === s;
                return (
                  <button
                    key={s}
                    className={[
                      "registration-approval__status-chip",
                      active && "registration-approval__status-chip--active"
                    ].filter(Boolean).join(" ")}
                    onClick={() => setStatusFilter(s)}
                    aria-pressed={active}
                  >
                    {STATUS_LABEL[s]}
                    {s === "pending" && <Badge variant="warning" size="sm" className="registration-approval__pending-badge">{pendingCount}</Badge>}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="registration-approval__filter-group">
            <Select
              label="Session"
              value={sessionFilter}
              onChange={setSessionFilter}
              options={[{ label: "All sessions", value: "All" }, ...SESSIONS.map((s) => ({ label: s, value: s }))]}
              size="sm"
              aria-label="Filter by session"
            />
          </div>
        </section>

        <div className="registration-approval__table">
          <DataTable
            columns={columns}
            data={filtered}
            loading={loading}
            searchable={false}
            filterable={false}
            paginatable={true}
            pageSize={10}
            emptyState={{
              icon: <FaExclamationTriangle />,
              title: statusFilter === "pending" ? "No pending registrations" : "No registrations found",
              description: "Try adjusting your search or filters.",
              action: statusFilter !== "All" ? (
                <Button variant="outline" size="sm" onClick={() => setStatusFilter("All")}>
                  Clear filters
                </Button>
              ) : null
            }}
            aria-label="Registration approvals"
          />
        </div>

        <Modal
          isOpen={!!approveModal}
          onClose={() => setApproveModal(null)}
          title="Approve Registration"
          description={approveModal?.name}
          size="md"
          className="registration-approval__modal registration-approval__modal--approve"
        >
          <Input
            label="Approval notes (optional)"
            placeholder="Add a note for this approval..."
            value={notes}
            onChange={setNotes}
            size="sm"
          />
          <div className="registration-approval__modal-footer">
            <Button variant="ghost" onClick={() => setApproveModal(null)}>
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={() => updateStatus(approveModal.id, "approved", notes.trim())}
              disabled={updatingId === approveModal.id}
              loading={updatingId === approveModal.id}
            >
              {updatingId === approveModal.id ? "Approving..." : "Approve registration"}
            </Button>
          </div>
        </Modal>

        <Modal
          isOpen={!!rejectModal}
          onClose={() => {
            setRejectModal(null);
            setRejectError(null);
          }}
          title="Reject Registration"
          description={rejectModal?.name}
          size="md"
          className="registration-approval__modal registration-approval__modal--reject"
        >
          <div className="registration-approval__modal-field">
            <label className="registration-approval__modal-label">
              Rejection reason <span className="registration-approval__required" aria-hidden="true">*</span>
            </label>
            <textarea
              className="registration-approval__textarea"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for rejection"
              rows="3"
              aria-required="true"
            />
            {rejectError && <p className="registration-approval__field-error" role="alert">{rejectError}</p>}
          </div>
          <div className="registration-approval__modal-footer">
            <Button variant="ghost" onClick={() => {
              setRejectModal(null);
              setRejectError(null);
            }}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (!reason.trim()) {
                  setRejectError("A rejection reason is required.");
                  return;
                }
                updateStatus(rejectModal.id, "rejected", reason.trim());
              }}
              disabled={updatingId === rejectModal.id || !reason.trim()}
              loading={updatingId === rejectModal.id}
            >
              {updatingId === rejectModal.id ? "Rejecting..." : "Reject registration"}
            </Button>
          </div>
        </Modal>

        <Modal
          isOpen={!!viewModal}
          onClose={() => setViewModal(null)}
          title="Registration Details"
          description={viewModal.email}
          size="md"
          className="registration-approval__modal registration-approval__modal--view"
        >
          <div className="registration-approval__view-grid">
            <div>
              <label className="registration-approval__view-label">Full Name</label>
              <p className="registration-approval__view-value">{viewModal.full_name || "N/A"}</p>
            </div>
            <div>
              <label className="registration-approval__view-label">Student ID</label>
              <p className="registration-approval__view-value">{viewModal.student_id || "N/A"}</p>
            </div>
            <div>
              <label className="registration-approval__view-label">Email</label>
              <p className="registration-approval__view-value">{viewModal.email || "�"}</p>
            </div>
            <div>
              <label className="registration-approval__view-label">Batch</label>
              <p className="registration-approval__view-value">{viewModal.batch || "N/A"}</p>
            </div>
            <div>
              <label className="registration-approval__view-label">Session</label>
              <p className="registration-approval__view-value">{viewModal.academic_session || "N/A"}</p>
            </div>
            <div>
              <label className="registration-approval__view-label">Phone</label>
              <p className="registration-approval__view-value">{viewModal.phone || "�"}</p>
            </div>
            <div>
              <label className="registration-approval__view-label">Status</label>
              <p className="registration-approval__view-value">
                <Badge variant={STATUS_VARIANT[viewModal.status] || "default"} className="registration-approval__view-badge">
                  {STATUS_LABEL[viewModal.status] || viewModal.status}
                </Badge>
              </p>
            </div>
            {viewModal.notes && (
              <div>
                <label className="registration-approval__view-label">Admin Notes</label>
                <p className="registration-approval__view-value">{viewModal.notes}</p>
              </div>
            )}
            <div>
              <label className="registration-approval__view-label">Applied At</label>
              <p className="registration-approval__view-value">
                {viewModal.created_at ? new Date(viewModal.created_at).toLocaleString() : "N/A"}
              </p>
            </div>
          </div>
          <div className="registration-approval__modal-footer">
            <Button variant="ghost" onClick={() => setViewModal(null)}>
              Close
            </Button>
            {viewModal.status === "pending" && (
              <Button
                variant="success"
                onClick={() => {
                  setViewModal(null);
                  setApproveModal({ id: viewModal.id, name: viewModal.full_name });
                }}
              >
                Approve
              </Button>
            )}
          </div>
        </Modal>
      </motion.div>
    </AdminLayout>
  );
}

