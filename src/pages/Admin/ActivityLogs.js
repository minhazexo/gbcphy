import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaHistory,
  FaSearch,
  FaTrash,
  FaEdit,
  FaClock,
  FaDownload
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
import EmptyState from "../../components/admin/ui/EmptyState.js";
import { useAuth } from "../../context/AuthContext.js";
import { useRBAC } from "../../context/RBACContext.js";
import "./ActivityLogs.scss";

const STORAGE_KEY = "gbc-activity-logs";
const PAGE_SIZE = 15;

const ACTION_TYPES = [
  "login",
  "logout",
  "create",
  "update",
  "delete",
  "approve",
  "reject",
  "upload",
  "download",
  "publish",
  "archive",
  "restore"
];

const ACTORS = ["system", "admin", "faculty", "student"];

const ACTION_LABELS = {
  login: "Login",
  logout: "Logout",
  create: "Create",
  update: "Update",
  delete: "Delete",
  approve: "Approve",
  reject: "Reject",
  upload: "Upload",
  download: "Download",
  publish: "Publish",
  archive: "Archive",
  restore: "Restore",
  register: "Registration",
  approval: "Approval",
  rejection: "Rejection",
  profile_update: "Profile Update",
  status_change: "Status Change",
  content_create: "Content Created",
  content_edit: "Content Edited",
  content_delete: "Content Deleted",
  suspension: "Suspension"
};

const DEFAULT_LOGS = [
  {
    id: "l-1",
    action: "login",
    actor: "student",
    actorName: "A. Rahman",
    actorId: "BCS22-001",
    target: "session",
    targetId: "BCS22-001",
    details: "Student sign-in.",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    ip: "192.168.1.24",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0 Safari/537.36"
  },
  {
    id: "l-2",
    action: "approve",
    actor: "admin",
    actorName: "Admin",
    actorId: "admin-1",
    target: "student",
    targetId: "BCS22-001",
    details: "Approved registration for BCS22-001.",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    ip: "10.0.0.5",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15"
  },
  {
    id: "l-3",
    action: "update",
    actor: "admin",
    actorName: "Admin",
    actorId: "admin-1",
    target: "student",
    targetId: "BCS23-012",
    details: "Updated student status BCS23-012.",
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    ip: "10.0.0.5",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0 Safari/537.36"
  },
  {
    id: "l-4",
    action: "create",
    actor: "admin",
    actorName: "Admin",
    actorId: "admin-1",
    target: "notice",
    targetId: "n-1",
    details: "Created notice: M.Sc. Final Examination Routine.",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    ip: "10.0.0.5",
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/122.0 Safari/537.36"
  },
  {
    id: "l-5",
    action: "login",
    actor: "faculty",
    actorName: "K. Nahar",
    actorId: "fac-1",
    target: "session",
    targetId: "fac-1",
    details: "Faculty sign-in.",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    ip: "192.168.1.41",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/604.1"
  }
];

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback.slice();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback.slice();
  } catch {
    return fallback.slice();
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    console.error(`Could not save ${key}.`);
    return false;
  }
};

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const formatDateTime = (iso) => {
  if (!iso) return "�";
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return "�";
  }
};

const actionVariant = (action) => {
  const a = String(action).toLowerCase();
  if (
    a === "delete" ||
    a === "deletion" ||
    a === "reject" ||
    a === "rejection" ||
    a.includes("suspend") ||
    a === "suspension"
  ) {
    return "error";
  }
  if (
    a === "create" ||
    a === "approve" ||
    a === "approval" ||
    a === "publish" ||
    a === "restore" ||
    a === "register"
  ) {
    return "success";
  }
  if (a === "update" || a === "edit" || a === "status_change") {
    return "warning";
  }
  if (a === "login" || a === "logout" || a === "upload" || a === "download") {
    return "info";
  }
  return "default";
};

export default function ActivityLogs() {
  const { userProfile } = useAuth();
  const { loading: rbacLoading, canViewDashboard } = useRBAC();
  const { addToast } = useToast();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All");
  const [actorFilter, setActorFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selected, setSelected] = useState(null);
  const [clearOpen, setClearOpen] = useState(false);

  useEffect(() => {
    document.title = "Activity Logs | Department of Physics";
    const load = () => {
      setLogs(read(STORAGE_KEY, DEFAULT_LOGS));
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const from = dateFrom ? startOfDay(dateFrom) : null;
    const to = dateTo ? endOfDay(dateTo) : null;
    return logs.filter((log) => {
      const matchesSearch =
        !term ||
        String(log.action || "").toLowerCase().includes(term) ||
        String(log.actor || "").toLowerCase().includes(term) ||
        String(log.actorName || "").toLowerCase().includes(term) ||
        String(log.target || "").toLowerCase().includes(term) ||
        String(log.details || "").toLowerCase().includes(term) ||
        String(log.ip || "").toLowerCase().includes(term);
      const matchesAction = actionFilter === "All" || log.action === actionFilter;
      const matchesActor = actorFilter === "All" || log.actor === actorFilter;
      const created = log.createdAt ? new Date(log.createdAt) : null;
      const matchesDate =
        (!from || (created && created >= from)) && (!to || (created && created <= to));
      return matchesSearch && matchesAction && matchesActor && matchesDate;
    });
  }, [logs, search, actionFilter, actorFilter, dateFrom, dateTo]);

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [filtered]
  );

  const clearFilters = useCallback(() => {
    setSearch("");
    setActionFilter("All");
    setActorFilter("All");
    setDateFrom("");
    setDateTo("");
  }, []);

  const handleDelete = useCallback(
    (row) => {
      if (!window.confirm(`Delete log entry "${row.id}"?`)) return;
      setLogs((prev) => {
        const next = prev.filter((log) => log.id !== row.id);
        write(STORAGE_KEY, next);
        addToast({ title: "Log deleted", message: `Entry ${row.id} removed.`, variant: "success" });
        return next;
      });
    },
    [addToast]
  );

  const handleClearConfirm = useCallback(() => {
    setLogs([]);
    write(STORAGE_KEY, []);
    setSelected(null);
    setClearOpen(false);
    addToast({
      title: "Logs cleared",
      message: "All activity logs have been deleted.",
      variant: "warning"
    });
  }, [addToast]);

  const handleExport = useCallback(() => {
    const headers = ["Timestamp", "Actor", "Action", "Details", "IP", "User Agent"];
    const rows = sorted.map((log) => [
      formatDateTime(log.createdAt),
      log.actorName || log.actor || "�",
      ACTION_LABELS[log.action] || log.action,
      log.details || "�",
      log.ip || "�",
      log.userAgent || "�"
    ]);
    const escape = (value) => `"${String(value).replace(/"/g, '""')}"`;
    const csv = [headers.map(escape).join(","), ...rows.map((row) => row.map(escape).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `activity-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast({
      title: "Exported",
      message: `${sorted.length} log entr${sorted.length === 1 ? "y" : "ies"} exported to CSV.`,
      variant: "success"
    });
  }, [sorted, addToast]);

  const columns = useMemo(
    () => [
      {
        key: "createdAt",
        label: "Timestamp",
        sortable: true,
        width: 160,
        render: (row) => (
          <span className="activity-logs__cell-timestamp">
            <FaClock className="activity-logs__cell-icon" aria-hidden="true" />
            {formatDateTime(row.createdAt)}
          </span>
        )
      },
      {
        key: "actor",
        label: "Actor",
        sortable: true,
        width: 170,
        render: (row) => (
          <div className="activity-logs__cell-actor">
            <Avatar name={row.actorName || row.actor} size="sm" className="activity-logs__avatar" />
            <div className="activity-logs__actor-info">
              <span className="activity-logs__actor-name">
                {row.actorName || row.actor || "�"}
              </span>
              <span className="activity-logs__actor-type">{row.actor}</span>
            </div>
          </div>
        )
      },
      {
        key: "action",
        label: "Action",
        sortable: true,
        width: 120,
        render: (row) => (
          <Badge variant={actionVariant(row.action)} size="sm" className="activity-logs__action-badge">
            {ACTION_LABELS[row.action] || row.action}
          </Badge>
        )
      },
      {
        key: "details",
        label: "Details",
        width: 300,
        render: (row) => <span className="activity-logs__cell-details">{row.details || "�"}</span>
      },
      {
        key: "ip",
        label: "IP / User Agent",
        width: 210,
        render: (row) => (
          <div className="activity-logs__cell-ip">
            <span className="activity-logs__ip-label">IP</span>
            <span className="activity-logs__ip">{row.ip || "�"}</span>
            <span className="activity-logs__ua">{row.userAgent || "�"}</span>
          </div>
        )
      }
    ],
    []
  );

  const rowActions = useMemo(
    () => [
      {
        label: "View details",
        icon: <FaEdit />,
        variant: "ghost",
        onClick: (row) => setSelected(row)
      },
      {
        label: "Delete",
        icon: <FaTrash />,
        variant: "danger",
        onClick: handleDelete
      }
    ],
    [handleDelete]
  );

  if (!rbacLoading && !canViewDashboard) {
    return (
      <AdminLayout>
        <section className="activity-logs">
          <Card className="activity-logs__unauthorized" padding="lg">
            <EmptyState
              icon={<FaHistory />}
              title="Not authorized"
              description="You do not have permission to view activity logs."
            />
          </Card>
        </section>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <section className="activity-logs">
        <header className="activity-logs__header">
          <div className="activity-logs__header-start">
            <div className="activity-logs__header-icon" aria-hidden="true">
              <FaHistory />
            </div>
            <div>
              <h1 className="activity-logs__title">Activity Logs</h1>
              <p className="activity-logs__description">
                Audit trail of system actions, user activity and changes.
              </p>
            </div>
          </div>
          <div className="activity-logs__header-end">
            <Badge className="activity-logs__count-badge">
              {sorted.length} log entr{sorted.length === 1 ? "y" : "ies"}
            </Badge>
            <div className="activity-logs__user-chip">
              <Avatar name={userProfile?.full_name ?? "Admin"} size="sm" />
              <span className="activity-logs__user-name">{userProfile?.full_name ?? "Admin"}</span>
            </div>
          </div>
        </header>

        <div className="activity-logs__toolbar">
          <div className="activity-logs__search">
            <Input
              leftIcon={<FaSearch />}
              placeholder="Search actor, action, details�"
              value={search}
              onChange={(value) => setSearch(value)}
              size="sm"
              aria-label="Search activity logs"
            />
          </div>
          <div className="activity-logs__filters">
            <Select
              label="Action"
              value={actionFilter}
              onChange={(value) => setActionFilter(value)}
              options={[
                { label: "All actions", value: "All" },
                ...ACTION_TYPES.map((action) => ({
                  label: ACTION_LABELS[action] || action,
                  value: action
                }))
              ]}
              placeholder="All actions"
              size="sm"
              aria-label="Filter by action"
            />
            <Select
              label="Actor"
              value={actorFilter}
              onChange={(value) => setActorFilter(value)}
              options={[
                { label: "All actors", value: "All" },
                ...ACTORS.map((actor) => ({ label: actor, value: actor }))
              ]}
              placeholder="All actors"
              size="sm"
              aria-label="Filter by actor"
            />
          </div>
          <div className="activity-logs__date-range">
            <Input
              label="From"
              type="date"
              value={dateFrom}
              onChange={(value) => setDateFrom(value)}
              size="sm"
              aria-label="From date"
            />
            <Input
              label="To"
              type="date"
              value={dateTo}
              onChange={(value) => setDateTo(value)}
              size="sm"
              aria-label="To date"
            />
          </div>
          <div className="activity-logs__actions">
            <Button variant="outline" size="sm" onClick={handleExport} icon={<FaDownload />}>
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
            <Button variant="danger" size="sm" onClick={() => setClearOpen(true)}>
              <FaTrash /> Clear all logs
            </Button>
          </div>
        </div>

        <DataTable
          className="activity-logs__table"
          columns={columns}
          data={sorted}
          loading={loading}
          pageSize={PAGE_SIZE}
          searchable={false}
          filterable={false}
          sortable={true}
          paginatable={true}
          rowActions={rowActions}
          emptyState={{
            title: "No activity logs",
            description: "There are no log entries matching the current filters.",
            action: (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            )
          }}
          aria-label="Activity logs"
        />
      </section>

      {selected && (
        <Modal
          isOpen
          onClose={() => setSelected(null)}
          title="Log Details"
          size="lg"
          className="activity-logs__modal"
          aria-label="Log entry details"
          footer={
            <Button variant="outline" size="sm" onClick={() => setSelected(null)}>
              Close
            </Button>
          }
        >
          <div className="activity-logs__modal-body">
            <div className="activity-logs__meta">
              <div className="activity-logs__meta-item">
                <span className="activity-logs__meta-label">Action</span>
                <Badge
                  variant={actionVariant(selected.action)}
                  size="sm"
                  className="activity-logs__modal-action-badge"
                >
                  {ACTION_LABELS[selected.action] || selected.action}
                </Badge>
              </div>
              <div className="activity-logs__meta-item">
                <span className="activity-logs__meta-label">Time</span>
                <span className="activity-logs__meta-value">
                  {formatDateTime(selected.createdAt)}
                </span>
              </div>
              <div className="activity-logs__meta-item">
                <span className="activity-logs__meta-label">Actor</span>
                <span className="activity-logs__meta-value">
                  <Avatar
                    name={selected.actorName || selected.actor}
                    size="sm"
                    className="activity-logs__modal-avatar"
                  />
                  {selected.actorName || selected.actor}
                  <span className="activity-logs__meta-muted">({selected.actor})</span>
                </span>
              </div>
            </div>
            <Separator className="activity-logs__modal-separator" />
            <div className="activity-logs__detail-grid">
              {[
                { label: "ID", value: selected.id },
                { label: "Actor ID", value: selected.actorId || "�" },
                { label: "Target", value: selected.target || "�" },
                { label: "Target ID", value: selected.targetId || "�" },
                { label: "IP Address", value: selected.ip || "�" },
                { label: "User Agent", value: selected.userAgent || "�" }
              ].map((field, index) => (
                <div key={index} className="activity-logs__detail-field">
                  <span className="activity-logs__detail-label">{field.label}</span>
                  <span className="activity-logs__detail-value">{field.value}</span>
                </div>
              ))}
              <div className="activity-logs__detail-field">
                <span className="activity-logs__detail-label">Details</span>
                <span
                  className="activity-logs__detail-value activity-logs__detail-value--details"
                >
                  {selected.details || "�"}
                </span>
              </div>
            </div>
            <div className="activity-logs__json">
              <h3 className="activity-logs__json-title">Raw entry</h3>
              <pre className="activity-logs__json-pre">{JSON.stringify(selected, null, 2)}</pre>
            </div>
          </div>
        </Modal>
      )}

      <Modal
        isOpen={clearOpen}
        onClose={() => setClearOpen(false)}
        title="Clear all activity logs"
        description="This will permanently delete every log entry. This action cannot be undone."
        size="sm"
        className="activity-logs__modal--confirm"
        aria-label="Confirm clear all logs"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setClearOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleClearConfirm}>
              Clear all logs
            </Button>
          </>
        }
      />
    </AdminLayout>
  );
}
