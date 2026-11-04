import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FaChalkboardTeacher,
  FaUser,
  FaUserPlus,
  FaTrash,
  FaEdit,
  FaEye,
  FaImage,
  FaPhone,
  FaEnvelope,
  FaBuilding,
  FaCheck,
  FaTimes,
  FaPlus
} from "react-icons/fa";
import { supabase, isSupabaseConfigured } from "../../../data/supabase.js";
import { useRBAC } from "../../../context/RBACContext.js";
import { useToast } from "../../../layouts/AdminLayout/AdminLayout.js";
import AdminLayout from "../../../layouts/AdminLayout/AdminLayout.js";
import DataTable from "../../../components/admin/data-table/DataTable.js";
import { Button, Input, Select, Modal, Badge, Avatar, Skeleton } from "../../../components/admin/ui/index.js";
import "../../../styles/faculty-management.scss";

const DEPARTMENTS = ["Physics", "Chemistry", "Mathematics", "Botany", "Zoology"];
const DESIGNATIONS = ["Professor", "Associate Professor", "Assistant Professor", "Lecturer", "Demonstrator"];
const PAGE_SIZE = 10;
const STATUS_LABEL = { active: "Active", inactive: "Inactive", pending: "Pending" };

const initialForm = () => ({
  name: "",
  email: "",
  phone: "",
  designation: "",
  department: DEPARTMENTS[0],
  profilePicture: null
});

export default function FacultyManagement() {
  const { addToast } = useToast();
  const { canManageFaculty } = useRBAC();

  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const [formModal, setFormModal] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState(initialForm());
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = "Faculty Management | Department of Physics";
    loadFaculty();
  }, []);

  const loadFaculty = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (isSupabaseConfigured) {
        const { data, error: err } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "faculty")
          .order("full_name", { ascending: true });
        if (err) throw err;
        setFaculty(data || []);
      } else {
        setFaculty([]);
        setError("Supabase is not configured. Faculty records require REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.");
      }
    } catch (err) {
      setError(err.message || "Failed to load faculty.");
      addToast({ title: "Error", description: err.message || "Failed to load faculty.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return faculty.filter((f) =>
      !term ||
      String(f.full_name || "").toLowerCase().includes(term) ||
      String(f.email || "").toLowerCase().includes(term) ||
      String(f.phone || "").toLowerCase().includes(term) ||
      String(f.designation || "").toLowerCase().includes(term) ||
      String(f.department || "").toLowerCase().includes(term) ||
      String(f.status || "").toLowerCase().includes(term)
    );
  }, [faculty, search]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      return;
    }
    setError(null);
    setForm((prev) => ({ ...prev, profilePicture: file }));
    setPreview(URL.createObjectURL(file));
  };

  const clearAvatar = () => {
    setForm((prev) => ({ ...prev, profilePicture: null }));
    setPreview(formModal?.item?.avatar_url || null);
  };

  const openAdd = () => {
    setForm(initialForm());
    setPreview(null);
    setError(null);
    setFormModal({ mode: "add", item: null });
  };

  const openEdit = (item) => {
    setForm({
      name: item.full_name || "",
      email: item.email || "",
      phone: item.phone || "",
      designation: item.designation || "",
      department: item.department || DEPARTMENTS[0],
      profilePicture: null
    });
    setPreview(item.avatar_url || null);
    setError(null);
    setFormModal({ mode: "edit", item });
  };

  const saveFaculty = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required.");
      return;
    }
    if (!isSupabaseConfigured) {
      setError("Supabase is not configured.");
      return;
    }
    setSaving(true);
    try {
      let avatarUrl = formModal?.item?.avatar_url || null;
      if (form.profilePicture) {
        const fileName = `${Date.now()}-${form.profilePicture.name.replace(/s+/g, "_")}`;
        const { error: uploadError } = await supabase.storage.from("profile-images").upload(fileName, form.profilePicture);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("profile-images").getPublicUrl(fileName);
        avatarUrl = urlData.publicUrl;
      }

      const payload = {
        full_name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        role: "faculty",
        avatar_url: avatarUrl,
        department: form.department,
        designation: form.designation || null
      };

      if (formModal && formModal.mode === "edit" && formModal.item) {
        const { error: err } = await supabase.from("profiles").update(payload).eq("id", formModal.item.id);
        if (err) throw err;
        setFaculty((prev) => prev.map((f) => (f.id === formModal.item.id ? { ...f, ...payload } : f)));
        addToast({ title: "Faculty updated", variant: "success" });
      } else {
        const password = "GbcFaculty" + Math.random().toString(36).slice(-8);
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: form.email.trim(),
          password,
          options: { data: { ...payload, status: "active" } }
        });
        if (authError) throw authError;
        if (!authData?.user) throw new Error("Failed to create faculty account.");
        const { error: err } = await supabase.from("profiles").insert({ id: authData.user.id, ...payload });
        if (err) throw err;
        setFaculty((prev) => [...prev, { id: authData.user.id, ...payload }]);
        addToast({ title: "Faculty added", variant: "success" });
      }
      setFormModal(null);
      setForm(initialForm());
      setPreview(null);
    } catch (err) {
      setError(err.message || "Failed to save faculty.");
      addToast({ title: "Error", description: err.message || "Failed to save faculty.", variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = useCallback(async (id, current) => {
    if (!isSupabaseConfigured || !canManageFaculty) return;
    try {
      const next = current === "active" ? "inactive" : "active";
      const { error: err } = await supabase.from("profiles").update({ status: next }).eq("id", id);
      if (err) throw err;
      setFaculty((prev) => prev.map((f) => (f.id === id ? { ...f, status: next } : f)));
      addToast({ title: `Faculty ${next.charAt(0).toUpperCase() + next.slice(1)}`, variant: "success" });
    } catch (err) {
      setError(err.message || "Failed to update faculty status.");
      addToast({ title: "Error", description: err.message || "Failed to update faculty status.", variant: "error" });
    }
  }, [canManageFaculty, addToast]);

  const removeFaculty = useCallback(async (id) => {
    if (!isSupabaseConfigured || !canManageFaculty) return;
    try {
      const { error: err } = await supabase.from("profiles").delete().eq("id", id);
      if (err) throw err;
      setFaculty((prev) => prev.filter((f) => f.id !== id));
      setDeleteId(null);
      addToast({ title: "Faculty deleted", variant: "success" });
    } catch (err) {
      setError(err.message || "Failed to delete faculty.");
      addToast({ title: "Error", description: err.message || "Failed to delete faculty.", variant: "error" });
    }
  }, [canManageFaculty, addToast]);

  const columns = useMemo(() => [
    {
      key: "avatar",
      label: "Faculty",
      width: "230px",
      sortable: false,
      searchable: false,
      render: (row) => (
        <div className="faculty-management__row-avatar">
          <Avatar src={row.avatar_url || undefined} name={row.full_name} size="md" className="faculty-management__avatar" />
          <div className="faculty-management__avatar-info">
            <div className="faculty-management__avatar-name">{row.full_name || "N/A"}</div>
            <div className="faculty-management__avatar-meta">
              <FaBuilding size={13} className="faculty-management__meta-icon" aria-hidden="true" />
              {row.department || "—"}
            </div>
          </div>
        </div>
      )
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      sortBy: "email",
      render: (row) => (
        <div className="faculty-management__cell-email">
          <FaEnvelope size={13} className="faculty-management__cell-icon" aria-hidden="true" />
          <span className="faculty-management__cell-value">{row.email || "—"}</span>
        </div>
      )
    },
    {
      key: "designation",
      label: "Designation",
      sortable: true,
      sortBy: "designation",
      render: (row) => <span className="faculty-management__cell-value">{row.designation || "—"}</span>
    },
    {
      key: "department",
      label: "Department",
      sortable: true,
      sortBy: "department",
      render: (row) => <span className="faculty-management__cell-value">{row.department || "—"}</span>
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      sortBy: "status",
      render: (row) => {
        const variant = row.status === "active" ? "success" : row.status === "inactive" ? "secondary" : "warning";
        return <Badge variant={variant} size="sm">{STATUS_LABEL[row.status] || row.status || "Pending"}</Badge>;
      }
    },
    {
      key: "actions",
      label: "Actions",
      width: "170px",
      sortable: false,
      searchable: false,
      render: (row) => (
        <div className="faculty-management__row-actions">
          <Button
            variant="ghost"
            size="sm"
            icon={<FaEye />}
            onClick={(event) => { event.stopPropagation(); setViewItem(row); }}
            aria-label={`View ${row.full_name}`}
            title="View details"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<FaEdit />}
            disabled={!canManageFaculty}
            onClick={(event) => { event.stopPropagation(); openEdit(row); }}
            aria-label={`Edit ${row.full_name}`}
            title="Edit"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={row.status === "active" ? <FaTimes /> : <FaCheck />}
            onClick={(event) => { event.stopPropagation(); toggleActive(row.id, row.status); }}
            aria-label={row.status === "active" ? "Deactivate faculty" : "Activate faculty"}
            title={row.status === "active" ? "Deactivate" : "Activate"}
          />
          <Button
            variant="danger"
            size="sm"
            icon={<FaTrash />}
            disabled={!canManageFaculty}
            onClick={(event) => { event.stopPropagation(); setDeleteId(row.id); }}
            aria-label={`Delete ${row.full_name}`}
            title="Delete"
          />
        </div>
      )
    }
  ], [canManageFaculty]);

  if (loading) {
    return (
      <AdminLayout>
        <motion.div
          className="faculty-management"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="faculty-management__skeleton-wrap">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="faculty-management__skeleton-card">
                <Skeleton variant="circle" width="48px" height="48px" className="faculty-management__skeleton-avatar" />
                <div className="faculty-management__skeleton-body">
                  <Skeleton width="55%" height="14px" />
                  <Skeleton width="35%" height="12px" className="faculty-management__skeleton-meta" />
                  <Skeleton width="40%" height="12px" />
                  <Skeleton width="25%" height="12px" />
                  <Skeleton width="30%" height="10px" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </AdminLayout>
    );
  }

  const facultyToDelete = faculty.find((f) => f.id === deleteId);

  return (
    <AdminLayout>
      <motion.div
        className="faculty-management"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
      >
        {error && (
          <div className="faculty-management__error" role="alert">
            {error}
          </div>
        )}

        <header className="faculty-management__header">
          <div className="faculty-management__brand">
            <FaChalkboardTeacher className="faculty-management__brand-icon" aria-hidden="true" />
            <div className="faculty-management__brand-text">
              <h1>Faculty Management</h1>
              <p>Manage faculty profiles, accounts, and teaching status.</p>
            </div>
          </div>
          <span className="faculty-management__count">{filtered.length} of {faculty.length} faculty</span>
        </header>

        <div className="faculty-management__toolbar">
          <Input
            leftIcon={<FaSearch />}
            placeholder="Search name, email, phone, designation, department…"
            value={search}
            onChange={(value) => { setSearch(value); }}
            size="sm"
            aria-label="Search faculty"
          />
          <Button variant="primary" icon={<FaUserPlus />} onClick={openAdd} disabled={!canManageFaculty}>
            Add Faculty
          </Button>
        </div>

        <section className="faculty-management__table">
          <DataTable
            columns={columns}
            data={filtered}
            loading={loading}
            pageSize={PAGE_SIZE}
            searchable={false}
            filterable={false}
            sortable={true}
            paginatable={true}
            emptyState={{
              icon: <FaUserPlus size={40} aria-hidden="true" />,
              title: "No faculty found",
              description: search ? "Try adjusting your search to find a faculty member." : "No faculty records have been added yet.",
              action: (
                <Button variant="primary" icon={<FaPlus />} onClick={openAdd} disabled={!canManageFaculty}>
                  Add Faculty
                </Button>
              )
            }}
            aria-label="Faculty records"
          />
        </section>

        {viewItem && (
          <Modal
            isOpen
            onClose={() => setViewItem(null)}
            title="Faculty Details"
            className="faculty-management__modal-view"
            size="md"
          >
            <div className="faculty-management__view-body">
              <div className="faculty-management__view-header">
                <Avatar src={viewItem.avatar_url || undefined} name={viewItem.full_name} size="xl" className="faculty-management__view-avatar" />
                <div className="faculty-management__view-info">
                  <h2 className="faculty-management__view-name">{viewItem.full_name || "N/A"}</h2>
                  <p className="faculty-management__view-email">{viewItem.email || "No email on file"}</p>
                </div>
              </div>
              <div className="faculty-management__detail-grid">
                <div>
                  <span className="faculty-management__detail-label">Designation</span>
                  <p className="faculty-management__detail-value">{viewItem.designation || "—"}</p>
                </div>
                <div>
                  <span className="faculty-management__detail-label">Department</span>
                  <p className="faculty-management__detail-value">{viewItem.department || "—"}</p>
                </div>
                <div>
                  <span className="faculty-management__detail-label">Phone</span>
                  <p className="faculty-management__detail-value">{viewItem.phone || "—"}</p>
                </div>
                <div>
                  <span className="faculty-management__detail-label">Status</span>
                  <p className="faculty-management__detail-value">
                    <Badge variant={viewItem.status === "active" ? "success" : "secondary"} size="sm">
                      {STATUS_LABEL[viewItem.status] || viewItem.status || "Pending"}
                    </Badge>
                  </p>
                </div>
                <div>
                  <span className="faculty-management__detail-label">Role</span>
                  <p className="faculty-management__detail-value">{viewItem.role || "faculty"}</p>
                </div>
                <div>
                  <span className="faculty-management__detail-label">Email</span>
                  <p className="faculty-management__detail-value">{viewItem.email || "—"}</p>
                </div>
              </div>
              {viewItem.avatar_url && (
                <div className="faculty-management__view-avatar-note">
                  <FaImage size={14} className="faculty-management__view-avatar-icon" aria-hidden="true" />
                  Profile picture uploaded
                </div>
              )}
            </div>
            <div className="modal__footer">
              <Button variant="ghost" onClick={() => setViewItem(null)}>Close</Button>
              {canManageFaculty && (
                <Button
                  variant="primary"
                  icon={<FaEdit />}
                  onClick={() => { setViewItem(null); openEdit(viewItem); }}
                >
                  Edit Faculty
                </Button>
              )}
            </div>
          </Modal>
        )}

        {formModal && (
          <Modal
            isOpen
            onClose={() => setFormModal(null)}
            title={formModal.mode === "add" ? "Add Faculty" : "Edit Faculty"}
            description={formModal.mode === "add" ? "Create a new faculty account and profile." : "Update faculty information."}
            className={`faculty-management__modal-${formModal.mode}`}
            size="lg"
          >
            <form className="faculty-management__form" onSubmit={saveFaculty}>
              <div className="faculty-management__form-row">
                <div>
                  <Input
                    label="Full Name"
                    value={form.name}
                    onChange={(value) => setForm({ ...form, name: value })}
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <Input
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(value) => setForm({ ...form, email: value })}
                    required
                  />
                </div>
              </div>
              <div className="faculty-management__form-row">
                <div>
                  <Input
                    label="Phone"
                    type="tel"
                    value={form.phone}
                    onChange={(value) => setForm({ ...form, phone: value })}
                  />
                </div>
                <div>
                  <Select
                    label="Designation"
                    value={form.designation}
                    onChange={(value) => setForm({ ...form, designation: value })}
                    placeholder="Select designation"
                    options={DESIGNATIONS}
                  />
                </div>
              </div>
              <div className="faculty-management__form-row">
                <div>
                  <Select
                    label="Department"
                    value={form.department}
                    onChange={(value) => setForm({ ...form, department: value })}
                    options={DEPARTMENTS}
                  />
                </div>
              </div>
              <div className="faculty-management__form-row">
                <div className="avatar-upload">
                  <label className="avatar-upload__label" aria-label="Upload profile picture">
                    <FaImage size={14} aria-hidden="true" />
                    {form.profilePicture ? "Change photo" : formModal?.item?.avatar_url ? "Update photo" : "Upload photo"}
                    <input
                      type="file"
                      accept="image/*"
                      className="avatar-upload__input"
                      onChange={handleImageChange}
                    />
                  </label>
                  {preview ? (
                    <div className="avatar-upload__preview">
                      <img src={preview} alt="Preview" className="avatar-upload__preview-image" />
                      <button type="button" className="avatar-upload__remove" onClick={clearAvatar} aria-label="Remove photo">
                        <FaTimes size={14} />
                      </button>
                    </div>
                  ) : formModal?.item?.avatar_url ? (
                    <div className="avatar-upload__preview">
                      <img src={formModal.item.avatar_url} alt="Current" className="avatar-upload__preview-image" />
                      <button type="button" className="avatar-upload__remove" onClick={clearAvatar} aria-label="Remove photo">
                        <FaTimes size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="avatar-upload__placeholder">
                      <Avatar size="lg" className="avatar-upload__placeholder-avatar" />
                      <p className="avatar-upload__placeholder-text">JPG or PNG, up to 5 MB</p>
                    </div>
                  )}
                  <p className="avatar-upload__hint">Profile picture is uploaded to Supabase Storage (profile-images bucket).</p>
                </div>
              </div>
              {error && (
                <p className="faculty-management__form-error" role="alert">{error}</p>
              )}
              <div className="faculty-management__form-actions">
                <Button variant="ghost" onClick={() => setFormModal(null)}>Cancel</Button>
                <Button variant="primary" type="submit" loading={saving} disabled={saving}>
                  {formModal.mode === "add" ? "Add faculty" : "Save changes"}
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {deleteId && facultyToDelete && (
          <Modal
            isOpen
            onClose={() => setDeleteId(null)}
            title="Delete Faculty"
            description="This action cannot be undone."
            className="faculty-management__modal-delete"
            size="sm"
          >
            <div className="faculty-management__delete-body">
              <Avatar src={facultyToDelete.avatar_url || undefined} name={facultyToDelete.full_name} size="md" className="faculty-management__delete-avatar" />
              <p>Are you sure you want to delete <strong>{facultyToDelete.full_name}</strong>?</p>
              <p className="faculty-management__delete-email">{facultyToDelete.email}</p>
            </div>
            <div className="modal__footer">
              <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="danger" onClick={() => removeFaculty(deleteId)} loading={saving} disabled={saving}>
                Delete
              </Button>
            </div>
          </Modal>
        )}
      </motion.div>
    </AdminLayout>
  );
}

