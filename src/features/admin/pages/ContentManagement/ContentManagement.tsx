// ContentManagement page — premium redesign.

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaFileAlt,
  FaNewspaper,
  FaCalendar,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaToggleOn,
  FaToggleOff,
  FaPaperPlane,
  FaArchive,
  FaClock,
  FaTags,
} from "react-icons/fa";
import AdminLayout, { useToast } from "../../../../layouts/AdminLayout";
import DataTable from "../../../../components/admin/data-table/DataTable.tsx";
import Button from "../../../../components/admin/ui/Button";
import Input from "../../../../components/admin/ui/Input";
import Select from "../../../../components/admin/ui/Select";
import Modal from "../../../../components/admin/ui/Modal";
import Badge from "../../../../components/admin/ui/Badge";
import Avatar from "../../../../components/admin/ui/Avatar";
import Card from "../../../../components/admin/ui/Card";
import Separator from "../../../../components/admin/ui/Separator";
import Skeleton from "../../../../components/admin/ui/Skeleton";
import EmptyState from "../../../../components/admin/ui/EmptyState";
import PageHeader from "../../../../components/admin/ui/PageHeader";
import { saveNotices, subscribeToContent, YEARS } from "../../../../data/contentStore.ts";
import { useAuth } from "../../../../context/AuthContext.tsx";
import { useRBAC } from "../../../../context/RBACContext.tsx";
import "./content-management.scss";

const STORAGE_KEYS = {
  announcements: "gbc-content-announcements",
  notices: "gbc-content-notices",
  events: "gbc-content-events"
};

const DEFAULT_ANNOUNCEMENTS = [
  { id: "a-1", title: "M.Sc. Final Examination Routine", body: "The final examination routine for M.Sc. students has been published. Visit the class routine page for the full schedule.", published: true, createdAt: new Date().toISOString() },
  { id: "a-2", title: "B.Sc. (Honours) 1st Year Orientation", body: "Newly admitted physics students are invited to the departmental orientation program at the Science Building gallery.", published: true, createdAt: new Date(Date.now() - 86400000).toISOString() }
];

const DEFAULT_NOTICES = [
  { id: "n-1", date: "Oct 02, 2026", tag: "Examination", title: "M.Sc. Final Examination Routine", excerpt: "The final examination routine for M.Sc. students has been published.", link: "/class-routine", status: "Upcoming", published: true, archived: false, createdAt: new Date().toISOString() },
  { id: "n-2", date: "Sep 15, 2026", tag: "Admission", title: "B.Sc. (Honours) 1st Year Orientation", excerpt: "Newly admitted physics students are invited to the departmental orientation program.", link: "/academic", status: "Recent", published: true, archived: false, createdAt: new Date(Date.now() - 86400000).toISOString() }
];

const DEFAULT_EVENTS = [
  { id: "e-1", title: "Seminar: Quantum Computing Basics", date: "Aug 20, 2026", time: "11:00 AM", location: "Department Seminar Library", body: "An introductory seminar on quantum computing for honours students.", published: true, createdAt: new Date(Date.now() - 172800000).toISOString() }
];

interface Announcement {
  id: string;
  title: string;
  body: string;
  published: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface Notice {
  id: string;
  date: string;
  tag: string;
  title: string;
  excerpt: string;
  link: string;
  status: string;
  published: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  body: string;
  published: boolean;
  createdAt: string;
  updatedAt?: string;
}

const read = (key: string, fallback: any[]): any[] => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback.slice();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback.slice();
  } catch (e) {
    return fallback.slice();
  }
};

const write = (key: string, value: any[]): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`Could not save ${key}.`, e);
    return false;
  }
};

const nextId = () => "c-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

const TABS = [
  { id: "announcements", label: "Announcements", icon: FaNewspaper },
  { id: "notices", label: "Notices", icon: FaFileAlt },
  { id: "events", label: "Events", icon: FaCalendar }
];

const TAB_LABEL: Record<string, string> = { announcements: "Announcement", notices: "Notice", events: "Event" };

const STATUS_LABELS = ["Upcoming", "Recent", "Past"];
const NOTICE_TAGS = ["Notice", "Examination", "Admission", "Seminar", "Result"];

const STATUS_BADGE_VARIANT: Record<string, string> = { Upcoming: "primary", Recent: "secondary", Past: "default" };

const initialForm = () => ({
  title: "",
  body: "",
  date: "",
  tag: "Notice",
  excerpt: "",
  link: "",
  status: "Recent",
  time: "",
  location: "",
  published: true
});

const NoteEditor = ({ draft, onCancel, onSave, error }: { draft: any; onCancel: () => void; onSave: (form: any) => void; error: string | null }) => {
  const [form, setForm] = useState(draft);
  const update = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev: any) => ({ ...prev, [field]: event.target.value }));

  return (
    <>
      <div className="content-management__editor-body">
        <div className="content-management__editor-row">
          <Select
            label="Type"
            value={form.kind}
            onChange={update("kind") as any}
            options={[{ id: "notes", label: "Notes" }, { id: "syllabus", label: "Syllabus" }] as any}
            size="sm"
            required
          />
          <Select
            label="Year"
            value={form.year}
            onChange={update("year") as any}
            options={YEARS as any}
            size="sm"
            required
          />
        </div>
        <Input
          label="Title"
          value={form.title}
          onChange={update("title") as any}
          placeholder="e.g. PHA 201 (OPTICS)"
          required
          autoFocus
          size="sm"
        />
        <Input
          label="File URL"
          value={form.url}
          onChange={update("url") as any}
          placeholder="/2nd Year Notes/optics.pdf"
          required
          helper="Use a path inside public/, or a full https:// link."
          size="sm"
        />
        <Input
          label="File size (optional)"
          value={form.size}
          onChange={update("size") as any}
          placeholder="1.2 MB"
          size="sm"
        />
        {error && <p className="content-management__editor-error">{error}</p>}
      </div>
      <div className="content-management__editor-footer">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={() => onSave(form)}>
          Save item
        </Button>
      </div>
    </>
  );
};

const NoticeEditor = ({ draft, onCancel, onSave, error }: { draft: any; onCancel: () => void; onSave: (form: any) => void; error: string | null }) => {
  const [form, setForm] = useState(draft);
  const update = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev: any) => ({ ...prev, [field]: event.target.value }));

  return (
    <>
      <div className="content-management__editor-body">
        <Input
          label="Title"
          value={form.title}
          onChange={update("title") as any}
          placeholder="e.g. M.Sc. Final Examination Routine"
          required
          autoFocus
          size="sm"
        />
        <div className="content-management__editor-row">
          <div className="content-management__editor-col">
            <Input label="Date" value={form.date} onChange={update("date") as any} placeholder="Oct 02, 2026" required size="sm" />
          </div>
          <div className="content-management__editor-col">
            <Select label="Tag" value={form.tag} onChange={update("tag") as any} options={NOTICE_TAGS as any} placeholder="Select tag" size="sm" required />
          </div>
        </div>
        <div className="content-management__editor-row">
          <div className="content-management__editor-col">
            <Select label="Status" value={form.status} onChange={update("status") as any} options={STATUS_LABELS as any} placeholder="Select status" size="sm" required />
          </div>
          <div className="content-management__editor-col">
            <Input label="Link" value={form.link} onChange={update("link") as any} placeholder="/class-routine" size="sm" />
          </div>
        </div>
        <label className="content-management__field-label">Summary</label>
        <textarea className="content-management__editor-textarea" rows={3} value={form.excerpt} onChange={(e) => update("excerpt")(e.target.value as any)} placeholder="Short summary shown on the homepage" required />
        <label className="content-management__field-label">Body (full text)</label>
        <textarea className="content-management__editor-textarea" rows={4} value={form.body} onChange={(e) => update("body")(e.target.value as any)} placeholder="Full notice text" />
        {error && <p className="content-management__editor-error">{error}</p>}
      </div>
      <div className="content-management__editor-footer">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={() => onSave(form)}>
          Save notice
        </Button>
      </div>
    </>
  );
};

export default function ContentManagement() {
  const { userProfile } = useAuth();
  const { canManageContent } = useRBAC();
  const { addToast } = useToast();

  const [tab, setTab] = useState<"announcements" | "notices" | "events">("announcements");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState<any>(null);
  const [form, setForm] = useState(initialForm);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    document.title = "Content Management | Department of Physics";
    const load = () => {
      setAnnouncements(read(STORAGE_KEYS.announcements, DEFAULT_ANNOUNCEMENTS));
      setNotices(read(STORAGE_KEYS.notices, DEFAULT_NOTICES));
      setEvents(read(STORAGE_KEYS.events, DEFAULT_EVENTS));
      setLoading(false);
    };
    load();

    const unsubscribe = subscribeToContent(() => {
      setAnnouncements(read(STORAGE_KEYS.announcements, DEFAULT_ANNOUNCEMENTS));
      setNotices(read(STORAGE_KEYS.notices, DEFAULT_NOTICES));
      setEvents(read(STORAGE_KEYS.events, DEFAULT_EVENTS));
    });
    return unsubscribe;
  }, []);

  const authorize = useCallback(() => {
    if (!canManageContent) {
      addToast({ title: "Not authorized", message: "Managing content requires an admin or faculty role.", type: "error" });
      return false;
    }
    return true;
  }, [canManageContent, addToast]);

  const save = useCallback((kind: string) => {
    if (kind === "announcements") write(STORAGE_KEYS.announcements, announcements);
    else if (kind === "notices") saveNotices(notices);
    else if (kind === "events") write(STORAGE_KEYS.events, events);
  }, [announcements, notices, events]);

  const current = useMemo(() => {
    if (tab === "announcements") return announcements;
    if (tab === "notices") return notices;
    return events;
  }, [tab, announcements, notices, events]);

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return current;
    const fields: string[] = {
      announcements: ["title", "body", "createdAt"],
      notices: ["title", "tag", "date", "status", "link", "excerpt"],
      events: ["title", "date", "time", "location"]
    }[tab];
    return current.filter((item: any) => fields.some((field: string) => String(item[field] ?? "").toLowerCase().includes(q)));
  }, [current, tab, searchText]);

  const openEditor = useCallback((kind: string, mode: string, item: any) => {
    setError(null);
    if (mode === "add") {
      setForm(initialForm());
      setEditor({ kind, mode: "add", item: null });
      return;
    }
    setForm({
      title: item.title || "",
      body: item.body || item.excerpt || "",
      date: item.date || "",
      tag: item.tag || "Notice",
      excerpt: item.excerpt || item.body || "",
      link: item.link || "",
      status: item.status || "Recent",
      time: item.time || "",
      location: item.location || "",
      published: item.published !== false
    });
    setEditor({ kind, mode: "edit", item });
  }, []);

  const closeEditor = useCallback(() => setEditor(null), []);

  const handleChange = useCallback((field: string) => (value: string) => setForm((prev) => ({ ...prev, [field]: value })), []);

  const saveItem = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!authorize()) return;
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    const now = new Date().toISOString();
    const published = form.published !== false;
    const base = { title: form.title.trim(), body: form.body.trim(), published, createdAt: editor.item ? editor.item.createdAt : now };

    let next: any;
    if (tab === "announcements") {
      const item = editor.mode === "edit" && editor.item ? { ...editor.item, ...base, updatedAt: now } : { ...base, id: nextId() };
      next = editor.mode === "edit" && editor.item ? announcements.map((a: any) => (a.id === item.id ? item : a)) : [...announcements, item];
      setAnnouncements(next);
      save("announcements");
    } else if (tab === "notices") {
      const item = editor.mode === "edit" && editor.item
        ? {
            ...editor.item,
            title: form.title.trim(),
            date: form.date || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
            tag: form.tag,
            excerpt: form.excerpt.trim(),
            link: form.link.trim(),
            status: form.status,
            body: form.body.trim(),
            published,
            updatedAt: now
          }
        : {
            ...base,
            id: nextId(),
            date: form.date || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
            tag: form.tag,
            excerpt: form.excerpt.trim(),
            link: form.link.trim(),
            status: form.status,
            archived: false
          };
      next = editor.mode === "edit" && editor.item ? notices.map((n: any) => (n.id === item.id ? item : n)) : [item, ...notices];
      setNotices(next);
      save("notices");
    } else {
      const item = editor.mode === "edit" && editor.item ? { ...editor.item, ...base, date: form.date, time: form.time, location: form.location, updatedAt: now } : { ...base, id: nextId(), date: form.date, time: form.time, location: form.location };
      next = editor.mode === "edit" && editor.item ? events.map((ev: any) => (ev.id === item.id ? item : ev)) : [...events, item];
      setEvents(next);
      save("events");
    }
    closeEditor();
    addToast({ title: `${TAB_LABEL[tab]} saved`, message: "Your changes were saved.", type: "success" });
  }, [tab, form, editor, authorize, announcements, notices, events, save, closeEditor, addToast]);

  const deleteItem = useCallback((id: string) => {
    if (!window.confirm("Delete this item? This cannot be undone.")) return;
    if (!authorize()) return;
    if (tab === "announcements") {
      setAnnouncements((prev: any[]) => prev.filter((a) => a.id !== id));
      save("announcements");
    } else if (tab === "notices") {
      setNotices((prev: any[]) => prev.filter((n) => n.id !== id));
      save("notices");
    } else {
      setEvents((prev: any[]) => prev.filter((ev: any) => ev.id !== id));
      save("events");
    }
    addToast({ title: "Item deleted", message: "The item has been removed.", type: "info" });
  }, [tab, authorize, save, addToast]);

  const togglePublish = useCallback((id: string) => {
    if (!authorize()) return;
    if (tab === "announcements") {
      setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, published: !a.published } : a)));
      save("announcements");
    } else if (tab === "notices") {
      setNotices((prev) => prev.map((n) => (n.id === id ? { ...n, published: !n.published } : n)));
      save("notices");
    } else {
      setEvents((prev) => prev.map((ev: any) => (ev.id === id ? { ...ev, published: !ev.published } : ev)));
      save("events");
    }
    addToast({ title: "Publish status updated", message: "Visibility has been changed.", type: "info" });
  }, [tab, authorize, save, addToast]);

  const archiveNotice = useCallback((id: string) => {
    if (!authorize()) return;
    setNotices((prev) => prev.map((n) => (n.id === id ? { ...n, archived: !n.archived } : n)));
    save("notices");
    addToast({ title: "Archive status updated", message: "Archive state has been changed.", type: "info" });
  }, [authorize, save, addToast]);

  const openDeleteConfirm = useCallback((id: string, title: string) => setDeleteConfirm({ id, title }), []);
  const closeDeleteConfirm = useCallback(() => setDeleteConfirm(null), []);

  const confirmDelete = useCallback(() => {
    if (!deleteConfirm) return;
    deleteItem(deleteConfirm.id);
    closeDeleteConfirm();
  }, [deleteConfirm, deleteItem, closeDeleteConfirm]);

  const columns = useMemo(() => {
    const publishCell = (row: any) => {
      const published = row.published !== false;
      return (
        <Button
          size="sm"
          variant="ghost"
          onClick={(e: React.MouseEvent) => { e.stopPropagation(); togglePublish(row.id); }}
          aria-label={published ? "Unpublish" : "Publish"}
          title={published ? "Published" : "Draft"}
        >
          {published ? <FaToggleOn /> : <FaToggleOff />}
        </Button>
      );
    };

    if (tab === "announcements") {
      return [
        { key: "title", label: "Title", width: "260px" },
        {
          key: "body",
          label: "Content",
          width: "380px",
          render: (row: any) => (
            <span className="cm-cell-excerpt" title={row.body || ""}>
              {row.body ? row.body.slice(0, 130) + (row.body.length > 130 ? "…" : "") : "—"}
            </span>
          )
        },
        { key: "published", label: "Published", width: "120px", render: publishCell },
        { key: "createdAt", label: "Created At", width: "180px", render: (row: any) => <span className="cm-muted">{new Date(row.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</span> }
      ];
    }

    if (tab === "notices") {
      return [
        { key: "title", label: "Title", width: "250px" },
        {
          key: "tag",
          label: "Tag",
          width: "140px",
          render: (row: any) => <span className="cm-tag-cell"><FaTags size={14} /> <Badge variant="secondary" size="sm">{row.tag}</Badge></span>
        },
        { key: "date", label: "Date", width: "140px", render: (row: any) => <span className="cm-muted"><FaClock size={14} /> {row.date}</span> },
        {
          key: "status",
          label: "Status",
          width: "130px",
          render: (row: any) => <Badge variant={(STATUS_BADGE_VARIANT[row.status] ?? "default") as React.ComponentProps<typeof Badge>["variant"]} size="sm">{row.status}</Badge>
        },
        {
          key: "link",
          label: "Link",
          width: "180px",
          render: (row: any) =>
            row.link ? (
              <Button size="sm" variant="ghost" onClick={(e: React.MouseEvent) => { e.stopPropagation(); window.open(row.link, "_blank"); }} aria-label="View link">
                <FaEye size={14} />
              </Button>
            ) : (
              <span className="cm-muted">—</span>
            )
        }
      ];
    }

    return [
      { key: "title", label: "Title", width: "260px" },
      { key: "date", label: "Date", width: "140px", render: (row: any) => <span className="cm-muted"><FaClock size={14} /> {row.date}</span> },
      { key: "time", label: "Time", width: "130px" },
      { key: "location", label: "Location", width: "210px", render: (row: any) => <span>{row.location || "—"}</span> },
      { key: "status", label: "Status", width: "120px", render: publishCell }
    ];
  }, [tab, togglePublish]);

  const rowActions = useMemo(() => {
    const actions: any[] = [
      { label: "Edit", icon: <FaEdit />, variant: "primary", onClick: (row: any) => openEditor(tab, "edit", row) },
      { label: "Delete", icon: <FaTrash />, variant: "danger", onClick: (row: any) => openDeleteConfirm(row.id, row.title) }
    ];
    if (tab === "notices") {
      actions.splice(1, 0, { label: "Publish", icon: <FaPaperPlane />, variant: "ghost", onClick: (row: any) => togglePublish(row.id) });
      actions.splice(2, 0, { label: "Archive", icon: <FaArchive />, variant: "ghost", onClick: (row: any) => archiveNotice(row.id) });
    }
    return actions;
  }, [tab, openEditor, togglePublish, archiveNotice]);

  const EMPTY_CONFIG = useMemo(
    () => ({
      announcements: { icon: <FaNewspaper size={48} />, title: "No announcements", description: "Create your first announcement to share updates with students and staff." },
      notices: { icon: <FaFileAlt size={48} />, title: "No notices", description: "Add notices for examinations, admissions, seminars, and results." },
      events: { icon: <FaCalendar size={48} />, title: "No events", description: "Schedule department events, seminars, and workshops." }
    }),
    []
  );

  const userName = userProfile?.full_name ?? "Admin User";
  const publishedCount = current.filter((item: any) => item.published !== false).length;

  const tabTitle = (() => {
    switch (tab) {
      case "announcements": return "Announcements";
      case "notices": return "Notices";
      case "events": return "Events";
    }
  })();

  const tabSubtitle = (() => {
    switch (tab) {
      case "announcements": return "Share updates with students and staff.";
      case "notices": return "Manage examinations, admissions, seminars, and results.";
      case "events": return "Schedule department events, seminars, and workshops.";
    }
  })();

  return (
    <AdminLayout>
      <header className="content-management__header">
        <PageHeader
          title={`Content Management — ${tabTitle}`}
          description={tabSubtitle}
          actions={
            <div className="content-management__header-actions">
              <Avatar name={userName} src={userProfile?.avatar_url || undefined} size="lg" className="cm-brand-avatar" />
            </div>
          }
        />
        <nav className="content-management__tabs" aria-label="Content sections">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                className={["content-management__tab", tab === t.id ? "content-management__tab--active" : ""].filter(Boolean).join(" ")}
                onClick={() => setTab(t.id as "announcements" | "notices" | "events")}
                aria-pressed={isActive}
              >
                <Icon size={18} strokeWidth={2} className="content-management__tab-icon" aria-hidden="true" /> {t.label}
              </button>
            );
          })}
        </nav>
      </header>

      <div className="content-management__stats">
        <Card className="cm-stat-card" padding="none">
          <div className="cm-stat-body">
            <span className="cm-stat-value">{announcements.length}</span>
            <span className="cm-stat-label">Announcements</span>
          </div>
        </Card>
        <Card className="cm-stat-card" padding="none">
          <div className="cm-stat-body">
            <span className="cm-stat-value">{notices.length}</span>
            <span className="cm-stat-label">Notices</span>
          </div>
        </Card>
        <Card className="cm-stat-card" padding="none">
          <div className="cm-stat-body">
            <span className="cm-stat-value">{events.length}</span>
            <span className="cm-stat-label">Events</span>
          </div>
        </Card>
        <Card className="cm-stat-card" padding="none">
          <div className="cm-stat-body">
            <span className="cm-stat-value">{publishedCount}</span>
            <span className="cm-stat-label">Published</span>
          </div>
        </Card>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          className="content-management__tab-panel"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          {loading ? (
            <div className="content-management__loading">
              <Skeleton width="40%" height="1.25rem" className="cm-skeleton-title" />
              <Separator orientation="vertical" className="cm-loading-separator" />
              <Skeleton width="70%" height="0.875rem" className="cm-skeleton-sub" />
              <Skeleton width="100%" height="3.5rem" className="cm-skeleton-table" />
            </div>
          ) : (
            <div className="content-management__section">
              <div className="content-management__toolbar">
                <Input placeholder={`Search ${TAB_LABEL[tab]}s`} value={searchText} onChange={(value: string) => setSearchText(value)} size="sm" aria-label={`Search ${tab}`} />
                <Separator orientation="vertical" />
                <Button variant="primary" icon={<FaPlus size={18} />} disabled={!canManageContent} onClick={() => openEditor(tab, "add", null)} aria-label={`Add ${TAB_LABEL[tab]}`}>
                  Add {TAB_LABEL[tab]}
                </Button>
              </div>
              <div className="content-management__table-wrapper">
                {filtered.length === 0 ? (
                  <EmptyState
                    icon={EMPTY_CONFIG[tab].icon}
                    title={searchText ? "No matching results" : EMPTY_CONFIG[tab].title}
                    description={searchText ? "Try adjusting your search." : EMPTY_CONFIG[tab].description}
                    action={
                      <Button variant="outline" size="sm" disabled={!canManageContent} onClick={() => openEditor(tab, "add", null)}>
                        Add {TAB_LABEL[tab]}
                      </Button>
                    }
                  />
                ) : (
                  <DataTable
                    columns={columns}
                    data={filtered}
                    loading={false}
                    searchable={false}
                    filterable={false}
                    sortable
                    paginatable
                    rowActions={rowActions}
                    aria-label={`${TAB_LABEL[tab]} management`}
                    className="content-management__table"
                  />
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {editor && (
        <Modal
          isOpen
          onClose={() => setEditor(null)}
          size="lg"
          className="content-management__modal"
          title={editor.mode === "add" ? `Add ${TAB_LABEL[tab]}` : `Edit ${TAB_LABEL[tab]}`}
          description={editor.mode === "add" ? `Create a new ${TAB_LABEL[tab].toLowerCase()}.` : `Update the selected ${TAB_LABEL[tab].toLowerCase()}.`}
        >
          {editor.kind === "notes" || editor.kind === "syllabus" ? (
            <NoteEditor draft={form} error={error} onCancel={() => setEditor(null)} onSave={saveItem} />
          ) : (
            <form onSubmit={saveItem} className="content-management__modal-form">
              <Input label="Title" value={form.title} onChange={handleChange("title")} required autoFocus error={error && !form.title.trim() ? "Title is required." : undefined} size="sm" />
              {tab === "announcements" && (
                <>
                  <label className="cm-field-label">Body</label>
                  <textarea className="content-management__editor-textarea" rows={5} value={form.body} onChange={(e) => handleChange("body")(e.target.value)} placeholder="Full announcement text" />
                  <div className="cm-field-row">
                    <span className="cm-label">Published</span>
                    <Button size="sm" variant="ghost" onClick={() => setForm((prev) => ({ ...prev, published: !prev.published }))} aria-label={form.published ? "Unpublish" : "Publish"} title={form.published ? "Published" : "Draft"}>
                      {form.published ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                    </Button>
                  </div>
                </>
              )}
              {tab === "notices" && (
                <NoticeEditor draft={form} error={error} onCancel={() => setEditor(null)} onSave={saveItem} />
              )}
              {tab === "events" && (
                <>
                  <div className="cm-field-row">
                    <div className="content-management__editor-col">
                      <Input label="Date" value={form.date} onChange={handleChange("date")} placeholder="Aug 20, 2026" size="sm" />
                    </div>
                    <div className="content-management__editor-col">
                      <Input label="Time" value={form.time} onChange={handleChange("time")} placeholder="11:00 AM" size="sm" />
                    </div>
                  </div>
                  <Input label="Location" value={form.location} onChange={handleChange("location")} placeholder="Department Seminar Library" size="sm" />
                  <label className="cm-field-label">Body</label>
                  <textarea className="content-management__editor-textarea" rows={4} value={form.body} onChange={(e) => handleChange("body")(e.target.value as any)} placeholder="Event description" />
                  <div className="cm-field-row">
                    <span className="cm-label">Published</span>
                    <Button size="sm" variant="ghost" onClick={() => setForm((prev) => ({ ...prev, published: !prev.published }))} aria-label={form.published ? "Unpublish" : "Publish"} title={form.published ? "Published" : "Draft"}>
                      {form.published ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                    </Button>
                  </div>
                </>
              )}
              {error && <p className="content-management__editor-error">{error}</p>}
              <div className="content-management__form-actions">
                <Button type="button" variant="ghost" onClick={() => setEditor(null)}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={!canManageContent}>
                  Save {TAB_LABEL[tab]}
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {deleteConfirm && (
        <Modal
          isOpen
          onClose={closeDeleteConfirm}
          size="lg"
          className="content-management__modal content-management__modal--confirm"
          title="Delete item"
          description={`Are you sure you want to delete "${deleteConfirm.title}"? This cannot be undone.`}
        >
          <div className="content-management__confirm-actions">
            <Button type="button" variant="ghost" onClick={closeDeleteConfirm}>Cancel</Button>
            <Button type="button" variant="danger" onClick={confirmDelete} onMouseDown={(e) => e.stopPropagation()}>
              Delete
            </Button>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
