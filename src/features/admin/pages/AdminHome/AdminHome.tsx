// AdminHome page

import { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FaChartBar,
  FaFileAlt,
  FaBullhorn,
  FaUsers,
  FaPlus,
  FaPen,
  FaTrash,
  FaExternalLinkAlt,
  FaDownload,
  FaSearch,
  FaBookOpen,
  FaFolder
} from "react-icons/fa";
import { FACULTY, facultyCount } from "../../../../data/teachers.ts";
import {
  YEARS,
  loadSiteContent,
  saveNotes,
  saveSyllabus,
  saveNotices,
  resetSiteContent,
  subscribeToContent,
  getDownloads
} from "../../../../data/contentStore.ts";
import { useAuth, useRBAC } from "../../../../context/AuthContext.tsx";
import AdminLayout, { useToast } from "../../../../layouts/AdminLayout";
import Button from "../../../../components/admin/ui/Button";
import Input from "../../../../components/admin/ui/Input";
import Select from "../../../../components/admin/ui/Select";
import Modal from "../../../../components/admin/ui/Modal";
import Badge from "../../../../components/admin/ui/Badge";
import Avatar from "../../../../components/admin/ui/Avatar";
import Card from "../../../../components/admin/ui/Card";
import EmptyState from "../../../../components/common/EmptyState";
import StatCard from "../../../../components/admin/ui/StatCard";
import DataTable from "../../../../components/admin/data-table/DataTable.tsx";
import "./admin-home.scss";

const SECTIONS = [
  { id: "overview", label: "Overview", icon: <FaChartBar size={18} /> },
  { id: "notes", label: "Notes & Syllabus", icon: <FaFileAlt size={18} /> },
  { id: "notices", label: "Notices", icon: <FaBullhorn size={18} /> },
  { id: "faculty", label: "Faculty", icon: <FaUsers size={18} /> }
];

const NOTES_TYPES = [
  { id: "notes", label: "Notes" },
  { id: "syllabus", label: "Syllabus" }
];

const NOTICE_TAGS = ["Notice", "Examination", "Admission", "Seminar", "Result"];
const NOTICE_STATUS = ["Upcoming", "Recent", "Past"];

const downloadTotal = (downloads: Record<string, number>): number =>
  Object.values(downloads).reduce((sum, value) => sum + (Number(value) || 0), 0);

const isValidUrl = (url: string): boolean => url.startsWith("/") || /^https?:\/\//i.test(url);

const SECTION_META: Record<string, { title: string; subtitle: string }> = {
  overview: { title: "Dashboard", subtitle: "A snapshot of what the department publishes." },
  notes: { title: "Notes & Syllabus", subtitle: "These PDFs power the Academic page." },
  notices: { title: "Notices", subtitle: "Announcements shown on the homepage." },
  faculty: { title: "Faculty", subtitle: "Official roster from the college listing." }
};

interface NoteForm {
  kind: string;
  year: string;
  title: string;
  url: string;
  size: string;
}

interface NoticeForm {
  title: string;
  date: string;
  tag: string;
  excerpt: string;
  link: string;
  status: string;
}

const NoteEditor = ({ draft, onCancel, onSave, error }: { draft: NoteForm; onCancel: () => void; onSave: (form: NoteForm) => void; error: string }) => {
  const [form, setForm] = useState<NoteForm>(draft);

  const update = (field: keyof NoteForm) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  return (
    <>
      <div className="admin-shell__modal-body">
        <div className="admin-shell__modal-row">
          <Select
            label="Type"
            value={form.kind}
            onChange={update("kind") as any}
            options={NOTES_TYPES as any}
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
        />
        <Input
          label="File URL"
          value={form.url}
          onChange={update("url") as any}
          placeholder="/2nd Year Notes/optics.pdf"
          required
          helper="Use a path inside public/, or a full https:// link."
        />
        <Input
          label="File size (optional)"
          value={form.size}
          onChange={update("size") as any}
          placeholder="1.2 MB"
        />
        {error && <p className="admin-shell__modal-error">{error}</p>}
      </div>
      <div className="admin-shell__modal-footer">
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

const NoticeEditor = ({ draft, onCancel, onSave, error }: { draft: NoticeForm; onCancel: () => void; onSave: (form: NoticeForm) => void; error: string }) => {
  const [form, setForm] = useState<NoticeForm>(draft);

  const update = (field: keyof NoticeForm) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  return (
    <>
      <div className="admin-shell__modal-body">
        <Input
          label="Title"
          value={form.title}
          onChange={update("title") as any}
          placeholder="e.g. M.Sc. Final Examination Routine"
          required
          autoFocus
        />
        <div className="admin-shell__modal-row">
          <Input
            label="Date"
            value={form.date}
            onChange={update("date") as any}
            placeholder="Oct 02, 2026"
            required
          />
          <Select
            label="Tag"
            value={form.tag}
            onChange={update("tag") as any}
            options={NOTICE_TAGS as any}
            size="sm"
            required
          />
        </div>
        <textarea
          className="admin-shell__textarea"
          rows={3}
          value={form.excerpt}
          onChange={(event) => update("excerpt")(event as any)}
          placeholder="One or two sentences shown on the homepage."
          required
        />
        <div className="admin-shell__modal-row">
          <Select
            label="Status"
            value={form.status}
            onChange={update("status") as any}
            options={NOTICE_STATUS as any}
            size="sm"
            required
          />
          <Input
            label="Link"
            value={form.link}
            onChange={update("link") as any}
            placeholder="/class-routine"
          />
        </div>
        {error && <p className="admin-shell__modal-error">{error}</p>}
      </div>
      <div className="admin-shell__modal-footer">
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

const Admin = () => {
  const { userProfile } = useAuth();
  const { canManageContent } = useRBAC();
  const { addToast } = useToast();

  const [section, setSection] = useState("overview");
  const [content, setContent] = useState<any>(loadSiteContent());
  const [downloads, setDownloads] = useState<Record<string, number>>(getDownloads());
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("All");
  const [editor, setEditor] = useState<any>(null);
  const [viewFaculty, setViewFaculty] = useState<any>(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    document.title = "Admin | Department of Physics";
    return () => {
      document.title = "Department of Physics | Government Bangla College";
    };
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToContent(() => {
      setContent(loadSiteContent());
      setDownloads(getDownloads());
    });
    return unsubscribe;
  }, []);

  const toast = useCallback(
    (message: string, type: "success" | "error" | "warning" | "info" = "success") => {
      addToast({ message, title: message, type });
    },
    [addToast]
  );

  const noteRows = useMemo(() => {
    const rows: any[] = [];
    ["notes", "syllabus"].forEach((kind) => {
      Object.entries((content as any).notes || {}).forEach(([year, items]) => {
        (items as any[]).forEach((item: any) => rows.push({ ...item, year, kind }));
      });
    });
    return rows.sort(
      (a: any, b: any) => YEARS.indexOf(a.year) - YEARS.indexOf(b.year) || a.title.localeCompare(b.title)
    );
  }, [content]);

  const visibleNotes = useMemo(() =>
    noteRows.filter((row: any) => {
      const matchesYear = yearFilter === "All" || row.year === yearFilter;
      const term = search.trim().toLowerCase();
      const matchesSearch =
        !term ||
        row.title.toLowerCase().includes(term) ||
        row.url.toLowerCase().includes(term);
      return matchesYear && matchesSearch;
    }),
    [noteRows, yearFilter, search]
  );

  const stats = useMemo(() => {
    const notes = noteRows.filter((row: any) => row.kind === "notes").length;
    const syllabus = noteRows.length - notes;
    return {
      notes,
      syllabus,
      notices: (content.notices || []).length,
      faculty: facultyCount,
      downloads: downloadTotal(downloads)
    };
  }, [noteRows, content, downloads]);

  const perYear = useMemo(() =>
    YEARS.map((year) => ({
      year,
      notes: (content.notes?.[year] || []).length,
      syllabus: (content.syllabus?.[year] || []).length
    })),
    [content]
  );

  const openNoteEditor = (row: any) => {
    setFormError("");
    setEditor({
      kind: "note",
      mode: row ? "edit" : "create",
      original: row || null,
      draft: row
        ? {
            kind: row.kind,
            year: row.year,
            title: row.title,
            url: row.url,
            size: row.size || ""
          }
        : {
            kind: "notes",
            year: yearFilter === "All" ? YEARS[0] : yearFilter,
            title: "",
            url: "",
            size: ""
          }
    });
  };

  const openNoticeEditor = (notice: any, index: number | undefined) => {
    setFormError("");
    setEditor({
      kind: "notice",
      mode: index === undefined ? "create" : "edit",
      index: index === undefined ? null : index,
      draft: notice || {
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric"
        }),
        tag: "Notice",
        title: "",
        excerpt: "",
        link: "",
        status: "Recent"
      }
    });
  };

  const saveNote = (form: any) => {
    const title = form.title.trim();
    const url = form.url.trim();
    if (!title || !url) return setFormError("Title and file URL are required.");
    if (!isValidUrl(url)) return setFormError("Use a path starting with / or a full https:// URL.");

    const next: any = {
      notes: { ...content.notes },
      syllabus: { ...content.syllabus }
    };
    const original = editor?.original;

    if (original) {
      next[original.kind][original.year] = (next[original.kind][original.year] || []).filter(
        (item: any) => item.title !== original.title
      );
    }

    const bucket = next[form.kind][form.year] || [];
    next[form.kind][form.year] = [
      ...bucket,
      {
        title,
        url,
        type: "pdf",
        ...(form.size && form.size.trim() ? { size: form.size.trim() } : {})
      }
    ];

    saveNotes(next.notes);
    saveSyllabus(next.syllabus);
    setEditor(null);
    toast(original ? "Note updated" : "Note added");
  };

  const deleteNote = (row: any) => {
    if (!window.confirm("Delete " + row.title + " from " + row.year + " " + row.kind + "?")) return;
    const next = { ...(content as any)[row.kind] };
    (next as any)[row.year] = ((next as any)[row.year] || []).filter((item: any) => item.title !== row.title);
    if (row.kind === "notes") saveNotes(next);
    else saveSyllabus(next);
    toast("Item deleted");
  };

  const saveNotice = (form: any) => {
    const title = form.title.trim();
    const excerpt = form.excerpt.trim();
    if (!title || !excerpt) return setFormError("Title and summary are required.");
    if (form.link && !isValidUrl(form.link.trim())) {
      return setFormError("Link must start with / or be a full https:// URL.");
    }

    const next = [...(content.notices || [])];
    const draft = {
      date: form.date.trim(),
      tag: form.tag,
      title,
      excerpt,
      link: form.link.trim(),
      status: form.status
    };

    if (editor?.index === null) next.unshift(draft);
    else next[editor.index] = draft;

    saveNotices(next);
    setEditor(null);
    toast(editor?.index === null ? "Notice published" : "Notice updated");
  };

  const deleteNotice = (index: number) => {
    if (!window.confirm("Delete this notice?")) return;
    saveNotices((content.notices || []).filter(function(_: any, i: number) { return i !== index; }));
    toast("Notice deleted");
  };

  const resetAll = () => {
    if (!window.confirm("Reset notes, syllabus and notices to the site defaults?")) return;
    resetSiteContent();
    toast("Content reset to defaults");
  };

  const { title: pageTitle, subtitle: pageSubtitle } = SECTION_META[section];
  const noteColumns: any[] = [
    {
      key: "title",
      label: "Title",
      searchable: true,
      sortable: true,
      render: (row: any) => (
        <div className="admin-shell__cell-title">
          <strong>{row.title}</strong>
          <a
            href={row.url}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-shell__cell-url"
            title="Open PDF"
          >
            {row.url}
          </a>
        </div>
      )
    },
    { key: "year", label: "Year", searchable: false, sortable: true },
    {
      key: "kind",
      label: "Type",
      searchable: false,
      sortable: false,
      render: (row: any) => (
        <Badge
          variant={row.kind === "notes" ? "info" : "secondary"}
          size="sm"
          className={`admin-shell__badge--${row.kind}`}
        >
          {row.kind}
        </Badge>
      )
    },
    {
      key: "size",
      label: "Size",
      searchable: false,
      sortable: false,
      render: (row: any) => <span className="admin-shell__muted">{row.size || "—"}</span>
    },
    {
      key: "downloads",
      label: "Downloads",
      searchable: false,
      sortable: true,
      align: "right",
      render: (row: any) => <span className="admin-shell__muted">{downloads[row.title] || 0}</span>
    },
    {
      key: "actions",
      label: "Actions",
      searchable: false,
      sortable: false,
      align: "right",
      render: (row: any) => (
        <div className="admin-shell__row-actions">
          <Button
            variant="ghost"
            size="sm"
            icon={<FaPen size={16} />}
            onClick={() => openNoteEditor(row)}
            aria-label={`Edit ${row.title}`}
          />
          <Button
            variant="danger"
            size="sm"
            icon={<FaTrash size={16} />}
            onClick={() => deleteNote(row)}
            aria-label={`Delete ${row.title}`}
          />
        </div>
      )
    }
  ];

  const facultyColumns: any[] = [
    {
      key: "name",
      label: "Name",
      searchable: true,
      sortable: true,
      render: (row: any) => (
        <div className="admin-shell__cell-title">
          <strong>{row.name}</strong>
          {row.nameBn && <span className="admin-shell__cell-bn">{row.nameBn}</span>}
        </div>
      )
    },
    {
      key: "title",
      label: "Designation",
      searchable: true,
      sortable: true,
      render: (row: any) => (
        <span className="admin-shell__muted">{row.title.replace(", Department of Physics", "")}</span>
      )
    },
    {
      key: "batch",
      label: "Batch",
      searchable: false,
      sortable: false,
      render: (row: any) => <span className="admin-shell__muted">{row.batch || "—"}</span>
    },
    {
      key: "email",
      label: "Email",
      searchable: true,
      sortable: false,
      render: (row: any) =>
        row.email ? (
          <a href={`mailto:${row.email}`} className="admin-shell__cell-link">
            {row.email}
          </a>
        ) : (
          <span className="admin-shell__muted">—</span>
        )
    },
    {
      key: "actions",
      label: "Actions",
      searchable: false,
      sortable: false,
      align: "right",
      render: (row: any) => (
        <Button
          variant="outline"
          size="sm"
          icon={<FaFolder size={16} />}
          onClick={() => setViewFaculty(row)}
          aria-label={`View ${row.name}`}
        />
      )
    }
  ];

  const statusVariant = (status: string) => {
    switch (status) {
      case "Upcoming":
        return "warning";
      case "Recent":
        return "success";
      case "Past":
        return "default";
      default:
        return "default";
    }
  };
  return (
    <AdminLayout>
      <motion.div
        className="admin-shell"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
      >
        <header className="admin-shell__header">
          <div className="admin-shell__header-brand">
            <div className="admin-shell__brand-mark" aria-hidden="true">
              <FaBookOpen size={24} />
            </div>
            <div className="admin-shell__brand-text">
              <strong>Dept. of Physics</strong>
              <span>Admin Console</span>
            </div>
          </div>
          <div className="admin-shell__header-info">
            <h1>{pageTitle}</h1>
            <p>{pageSubtitle}</p>
          </div>
          <div className="admin-shell__header-actions">
            <Avatar
              src={userProfile?.avatar_url ?? undefined}
              name={userProfile?.full_name || "Admin User"}
              size="sm"
              className="admin-shell__avatar"
              aria-label="User avatar"
            />
          </div>
        </header>

        <nav className="admin-shell__nav" aria-label="Sections">
          {SECTIONS.map(function(item) {
            return (
              <button
                key={item.id}
                className={[
                  "admin-shell__nav-item",
                  section === item.id && "admin-shell__nav-item--active"
                ].join(" ")}
                onClick={() => setSection(item.id)}
                aria-current={section === item.id ? "page" : undefined}
              >
                <span className="admin-shell__nav-icon" aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <main className="admin-shell__main">
          {section === "overview" && (
            <section className="admin-shell__section-overview">
              <div className="admin-shell__stats">
                <StatCard
                  title="Notes published"
                  value={stats.notes}
                  Icon={FaFileAlt}
                  color="info"
                  trend={{ value: "+12%", positive: true, label: "vs last week" }}
                />
                <StatCard
                  title="Syllabus files"
                  value={stats.syllabus}
                  Icon={FaBookOpen}
                  color="primary"
                />
                <StatCard
                  title="Active notices"
                  value={stats.notices}
                  Icon={FaBullhorn}
                  color="warning"
                />
                <StatCard
                  title="Downloads tracked"
                  value={stats.downloads}
                  Icon={FaDownload}
                  color="success"
                />
              </div>

              <div className="admin-shell__dashboard-grid">
                <div className="admin-shell__chart">
                  <h2>Library by year</h2>
                  <p>Notes available for each honours year.</p>
                  <div className="admin-shell__chart-wrap">
                    {perYear.map(function(entry: any) {
                      const total = entry.notes + entry.syllabus;
                      const max = Math.max(...perYear.map((y: any) => y.notes + y.syllabus), 1);
                      return (
                        <div className="admin-shell__chart-col" key={entry.year}>
                          <span className="admin-shell__chart-value">{total}</span>
                          <div className="admin-shell__chart-track">
                            <div
                              className="admin-shell__chart-bar"
                              style={{ height: String(Math.max((total / max) * 100, 4)) + "%" }}
                            />
                          </div>
                          <span className="admin-shell__chart-label">
                            {entry.year.replace(" Year", "")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="admin-shell__notices">
                  <h2>Recent notices</h2>
                  <p>Newest announcements on the homepage.</p>
                  <ul className="admin-shell__notice-list">
                    {(content.notices || []).slice(0, 3).map(function(notice: any, index: number) {
                      return (
                        <li key={notice.title + "-" + index} className="admin-shell__notice-item">
                          <Badge
                            variant="primary"
                            size="sm"
                            className={`admin-shell__badge--tag admin-shell__badge--tag-${notice.tag.toLowerCase()}`}
                          >
                            {notice.tag}
                          </Badge>
                          <div>
                            <strong>{notice.title}</strong>
                            <span>{notice.date + " · " + notice.status}</span>
                          </div>
                        </li>
                      );
                    })}
                    {(content.notices || []).length === 0 && (
                      <li className="admin-shell__notice-empty">No notices yet.</li>
                    )}
                  </ul>
                </div>
              </div>

              <section className="admin-shell__quick-actions">
                <h2>Quick actions</h2>
                <p>Publish something in a couple of clicks.</p>
                <div className="admin-shell__quick-actions-grid">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<FaPlus size={16} />}
                    onClick={() => openNoteEditor(null)}
                    fullWidth
                  >
                    Add a note
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<FaBullhorn size={16} />}
                    onClick={() => openNoticeEditor(null, undefined)}
                    fullWidth
                  >
                    Post a notice
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<FaExternalLinkAlt size={16} />}
                    as="a"
                    href="/academic"
                    target="_blank"
                    fullWidth
                  >
                    Academic page
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<FaExternalLinkAlt size={16} />}
                    as="a"
                    href="/teachers"
                    target="_blank"
                    fullWidth
                  >
                    Teachers page
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<FaTrash size={16} />}
                    onClick={resetAll}
                    fullWidth
                  >
                    Reset content
                  </Button>
                </div>
                <p className="admin-shell__footnote">
                  Faculty profiles ({stats.faculty}) are maintained in the official roster and are
                  read-only here.
                </p>
              </section>
            </section>
          )}
          {section === "notes" && (
            <section className="admin-shell__section-notes">
              <div className="admin-shell__section-head">
                <div>
                  <h2>Library</h2>
                  <p>{visibleNotes.length} of {noteRows.length} items shown.</p>
                </div>
                <div className="admin-shell__section-toolbar">
                  <div className="admin-shell__search">
                    <FaSearch size={16} aria-hidden="true" />
                    <Input
                      value={search}
                      onChange={(value: string) => setSearch(value)}
                      placeholder="Search title or URL"
                      aria-label="Search notes"
                      size="sm"
                    />
                  </div>
                  <Select
                    value={yearFilter}
                    onChange={(value: string) => setYearFilter(value)}
                    aria-label="Filter by year"
                    size="sm"
                    placeholder="Filter by year"
                  >
                    <option value="All">All years</option>
                    {YEARS.map(function(year: string) {
                      return <option key={year} value={year}>{year}</option>;
                    })}
                  </Select>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<FaPlus size={16} />}
                    onClick={() => openNoteEditor(null)}
                    disabled={!canManageContent}
                  >
                    Add note
                  </Button>
                </div>
              </div>

              <DataTable
                columns={noteColumns}
                data={visibleNotes}
                loading={false}
                searchable={false}
                filterable={false}
                sortable={false}
                paginatable={false}
                rowActions={null}
                itemId="title"
                emptyState={{
                  icon: <FaFolder size={32} />,
                  title: "No items match this filter.",
                  description: "Try clearing the search or year filter.",
                  action: (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearch("");
                        setYearFilter("All");
                      }}
                    >
                      Clear filters
                    </Button>
                  )
                }}
                className="admin-shell__data-table"
              />
            </section>
          )}

          {section === "notices" && (
            <section className="admin-shell__section-notices">
              <div className="admin-shell__section-head">
                <div>
                  <h2>Homepage announcements</h2>
                  <p>{(content.notices || []).length} notices, newest first.</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<FaPlus size={16} />}
                  onClick={() => openNoticeEditor(null, undefined)}
                  disabled={!canManageContent}
                >
                  Add notice
                </Button>
              </div>

              {(content.notices || []).length === 0 ? (
                <EmptyState
                  icon={<FaBullhorn size={32} />}
                  title="No notices yet"
                  description="Post the first announcement to appear on the homepage."
                  action={
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<FaPlus size={16} />}
                      onClick={() => openNoticeEditor(null, undefined)}
                      disabled={!canManageContent}
                    >
                      Add notice
                    </Button>
                  }
                />
              ) : (
                <ul className="admin-shell__notice-grid">
                  {(content.notices || []).map(function(notice: any, index: number) {
                    return (
                      <li key={notice.title + "-" + index} className="admin-shell__notice-card">
                        <Card hover className="admin-shell__notice-card-inner">
                          <div className="admin-shell__notice-card-head">
                            <Badge
                              variant="primary"
                              size="sm"
                              className={`admin-shell__badge--tag admin-shell__badge--tag-${notice.tag.toLowerCase()}`}
                            >
                              {notice.tag}
                            </Badge>
                            <Badge
                              variant={statusVariant(notice.status)}
                              size="sm"
                              className="admin-shell__badge--status"
                            >
                              {notice.status}
                            </Badge>
                          </div>
                          <strong>{notice.title}</strong>
                          <span className="admin-shell__notice-date">{notice.date}</span>
                          <p>{notice.excerpt}</p>
                          <div className="admin-shell__notice-actions">
                            {notice.link && (
                              <Button
                                variant="outline"
                                size="sm"
                                as="a"
                                href={notice.link}
                                target="_blank"
                                icon={<FaExternalLinkAlt size={16} />}
                              >
                                Open link
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<FaPen size={16} />}
                              onClick={() => openNoticeEditor(notice, index)}
                              aria-label={`Edit ${notice.title}`}
                              disabled={!canManageContent}
                            />
                            <Button
                              variant="danger"
                              size="sm"
                              icon={<FaTrash size={16} />}
                              onClick={() => deleteNotice(index)}
                              aria-label={`Delete ${notice.title}`}
                              disabled={!canManageContent}
                            />
                          </div>
                        </Card>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          )}

          {section === "faculty" && (
            <section className="admin-shell__section-faculty">
              <div className="admin-shell__section-head">
                <div>
                  <h2>Department roster</h2>
                  <p>{facultyCount} members from the official college listing.</p>
                </div>
              </div>

              <DataTable
                columns={facultyColumns}
                data={FACULTY}
                loading={false}
                searchable={true}
                filterable={false}
                sortable={true}
                paginatable={false}
                rowActions={null}
                itemId="name"
                emptyState={{
                  icon: <FaUsers size={32} />,
                  title: "No faculty found",
                  description: "The roster is currently empty."
                }}
                className="admin-shell__data-table"
              />
            </section>
          )}
        </main>
        {editor && (
          <Modal
            isOpen
            onClose={() => setEditor(null)}
            title={
              editor.kind === "note"
                ? editor.mode === "edit"
                  ? "Edit note"
                  : "Add note"
                : editor.mode === "edit"
                  ? "Edit notice"
                  : "New notice"
            }
            description={
              editor.kind === "note"
                ? "Shown on the Academic page."
                : "Shown in the homepage announcements."
            }
            size="lg"
            showCloseButton
            closeOnEscape
            closeOnOverlayClick
          >
            {editor.kind === "note" ? (
              <NoteEditor
                draft={editor.draft}
                error={formError}
                onCancel={() => setEditor(null)}
                onSave={saveNote}
              />
            ) : (
              <NoticeEditor
                draft={editor.draft}
                error={formError}
                onCancel={() => setEditor(null)}
                onSave={saveNotice}
              />
            )}
          </Modal>
        )}

        {viewFaculty && (
          <Modal
            isOpen
            onClose={() => setViewFaculty(null)}
            title={viewFaculty.name}
            description={viewFaculty.title.replace(", Department of Physics", "")}
            size="md"
            showCloseButton
            closeOnEscape
            closeOnOverlayClick
          >
            <div className="admin-shell__modal-body">
              <div className="admin-shell__faculty-detail">
                <Avatar
                  src={viewFaculty.photo}
                  name={viewFaculty.name}
                  size="lg"
                  className="admin-shell__faculty-avatar"
                />
                <div className="admin-shell__faculty-info">
                  <p><strong>Email:</strong> {viewFaculty.email || "—"}</p>
                  <p><strong>Phone:</strong> {viewFaculty.phone || "—"}</p>
                  <p><strong>Batch:</strong> {viewFaculty.batch || "—"}</p>
                  {viewFaculty.nameBn && (
                    <p><strong>Name (Bn):</strong> {viewFaculty.nameBn}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="admin-shell__modal-footer">
              <Button variant="ghost" size="sm" onClick={() => setViewFaculty(null)}>
                Close
              </Button>
            </div>
          </Modal>
        )}
      </motion.div>
    </AdminLayout>
  );
};

export default Admin;
