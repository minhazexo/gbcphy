// Profile page — modern UI/UX with image upload + inline field CRUD

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.tsx";
import { useToast } from "../../../components/common/Toast/Toast.tsx";
import { supabase, isSupabaseConfigured } from "../../../data/supabase.ts";
import {
  FaCamera,
  FaEdit,
  FaSave,
  FaTimes,
  FaTrash,
  FaPhone,
  FaEnvelope,
  FaBuilding,
  FaGraduationCap,
  FaIdCard,
  FaUser,
  FaCalendar,
} from "react-icons/fa";
import "./profile.scss";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

interface UserProfile {
  id: string;
  username: string;
  email: string;
  roll: string;
  session: string;
  profile_image: string | null;
  full_name?: string;
  student_id?: string;
  registration_number?: string;
  department?: string;
  batch?: string;
  academic_session?: string;
  status?: string;
  phone?: string;
  avatar_url?: string | null;
  created_at?: string;
  role?: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
};

const FIELD_CONFIG: Array<{
  key: string;
  label: string;
  icon: React.ReactNode;
  type: "text" | "email" | "tel";
  placeholder: string;
}> = [
  { key: "full_name", label: "Full Name", icon: <FaUser />, type: "text", placeholder: "Enter full name" },
  { key: "student_id", label: "Student ID", icon: <FaIdCard />, type: "text", placeholder: "Enter student ID" },
  { key: "registration_number", label: "Registration No.", icon: <FaGraduationCap />, type: "text", placeholder: "Enter registration no." },
  { key: "department", label: "Department", icon: <FaBuilding />, type: "text", placeholder: "Enter department" },
  { key: "batch", label: "Batch", icon: <FaCalendar />, type: "text", placeholder: "Enter batch" },
  { key: "academic_session", label: "Academic Session", icon: <FaCalendar />, type: "text", placeholder: "Enter session" },
  { key: "email", label: "Email", icon: <FaEnvelope />, type: "email", placeholder: "Enter email" },
  { key: "phone", label: "Phone", icon: <FaPhone />, type: "tel", placeholder: "Enter phone" },
];

export default function Profile() {
  const { userProfile, isAuthenticated, authReady, logout, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState("");
  const [originalValue, setOriginalValue] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [savingField, setSavingField] = useState<string | null>(null);

  useEffect(() => {
    if (!authReady) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setLoading(true);
    (async () => {
      try {
        if (isSupabaseConfigured && userProfile) {
          const { data: profileData, error: profileError } = await supabase!
            .from("profiles")
            .select("*")
            .eq("id", userProfile.id)
            .single();
          if (profileError) throw profileError;

          let studentData: any = null;
          try {
            const { data, error } = await supabase!
              .from("students")
              .select("*")
              .eq("id", userProfile.id)
              .single();
            if (error && error.code !== "PGRST116") throw error;
            studentData = data || null;
          } catch {
            studentData = null;
          }

          setProfile({
            ...profileData,
            ...studentData,
            full_name: profileData.full_name || studentData?.name || userProfile.username || "",
            student_id: profileData.student_id || studentData?.student_id || userProfile.roll || "",
            registration_number: profileData.registration_number || studentData?.registration_number || "",
            department: profileData.department || studentData?.department || "",
            batch: profileData.batch || studentData?.batch || "",
            academic_session: profileData.academic_session || studentData?.academic_session || profileData.session || userProfile.session || "",
            status: profileData.status || studentData?.status || "pending",
            email: profileData.email || userProfile.email || "",
            created_at: profileData.created_at,
            avatar_url: profileData.avatar_url || userProfile.avatar_url || null,
            profile_image: profileData.profile_image || userProfile.profile_image || null,
          });
        } else {
          setProfile({
            ...userProfile!,
            full_name: userProfile!.username || "",
            student_id: userProfile!.roll || "",
            status: "pending",
          } as UserProfile);
        }
      } catch (err: any) {
        toast({ message: err.message || "Failed to load profile.", type: "error" });
        setProfile(userProfile ? { ...userProfile, full_name: userProfile.username || "", student_id: userProfile.roll || "", status: "pending" } as UserProfile : null);
      } finally {
        setLoading(false);
      }
    })();
  }, [authReady, isAuthenticated, userProfile, navigate, toast]);

  const fieldValue = (key: string): string => {
    if (!profile) return "";
    const v = (profile as any)[key];
    return v == null ? "" : String(v);
  };

  const labelForKey = (key: string) => key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const startEdit = (key: string) => {
    setEditingField(key);
    setDraftValue(fieldValue(key));
    setOriginalValue(fieldValue(key));
  };

  const cancelEdit = () => {
    setEditingField(null);
    setDraftValue("");
    setOriginalValue("");
  };

  const saveField = async (key: string) => {
    if (draftValue === originalValue) {
      cancelEdit();
      return;
    }
    setSavingField(key);
    try {
      const updates: Record<string, unknown> = { [key]: draftValue.trim() || null };
      await updateUserProfile(updates);
      setProfile((prev) => (prev ? { ...prev, [key]: draftValue.trim() || null } : prev));
      toast({ message: `${labelForKey(key)} updated.`, type: "success" });
      cancelEdit();
    } catch (err: any) {
      toast({ message: err.message || "Failed to update field.", type: "error" });
    } finally {
      setSavingField(null);
    }
  };

  const clearField = async (key: string) => {
    setSavingField(key);
    try {
      await updateUserProfile({ [key]: null });
      setProfile((prev) => (prev ? { ...prev, [key]: null } : prev));
      toast({ message: `${labelForKey(key)} cleared.`, type: "success" });
    } catch (err: any) {
      toast({ message: err.message || "Failed to clear field.", type: "error" });
    } finally {
      setSavingField(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ message: "Please select an image file.", type: "error" });
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast({ message: "Image must be smaller than 5 MB.", type: "error" });
      return;
    }
    setProfilePicture(file);
    setPreviewUrl(URL.createObjectURL(file));
    uploadImage();
  };

  const uploadImage = async () => {
    if (!profilePicture || !userProfile || !isSupabaseConfigured) return;
    setUploading(true);
    try {
      const fileName = `${userProfile.id}/${Date.now()}-${profilePicture.name.replace(/\s+/g, "_")}`;
      const { error: uploadError } = await supabase!.storage.from("profile-images").upload(fileName, profilePicture);
      if (uploadError) throw uploadError;
      const { data: urlData } = await supabase!.storage.from("profile-images").getPublicUrl(fileName);
      await updateUserProfile({ avatar_url: urlData.publicUrl, profile_image: urlData.publicUrl });
      setProfile((prev) => (prev ? { ...prev, avatar_url: urlData.publicUrl, profile_image: urlData.publicUrl } : prev));
      setProfilePicture(null);
      setPreviewUrl("");
      toast({ message: "Profile picture updated.", type: "success" });
    } catch (err: any) {
      toast({ message: err.message || "Failed to upload image.", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err: any) {
      toast({ message: err.message || "Logout failed.", type: "error" });
    }
  };

  const avatarSrc = profile?.avatar_url || profile?.profile_image || previewUrl;
  const statusKey = String(profile?.status || "pending").toLowerCase();
  const badgeClass = `status-badge ${statusKey}`;
  const displayName = profile?.full_name || profile?.username || "Student";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-skeleton">Loading profile…</div>
      </div>
    );
  }

  if (!isAuthenticated || !profile) {
    return (
      <div className="profile-container">
        <div className="profile-empty">Redirecting to sign in…</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <header className="profile-header">
        <div className="profile-header-inner">
          <div className="profile-avatar" onClick={() => document.getElementById("profile-file-input")?.click()}>
            {avatarSrc ? (
              <img src={avatarSrc} alt="Profile" className="avatar-img" />
            ) : (
              <div className="avatar-placeholder">{initials}</div>
            )}
            <label className="avatar-upload" htmlFor="profile-file-input" title="Change photo">
              <FaCamera size={20} />
            </label>
            <input
              id="profile-file-input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
            {uploading && <span className="upload-spinner">Uploading…</span>}
          </div>
          <div className="profile-identity">
            <h1>{displayName}</h1>
            <span className={badgeClass}>{STATUS_LABELS[statusKey] || "Pending"}</span>
            <p className="profile-handle">@{profile.username}</p>
          </div>
          <button className="btn-edit-profile" onClick={() => navigate("/edit-profile")} title="Edit full profile">
            <FaEdit size={18} /> Edit Profile
          </button>
        </div>
      </header>

      <div className="profile-body">
        <div className="profile-stats">
          <div className="stat-card">
            <span className="stat-label">Member Since</span>
            <span className="stat-value">{profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Role</span>
            <span className="stat-value">{userProfile?.role || "student"}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Email</span>
            <span className="stat-value">{profile.email}</span>
          </div>
        </div>

        <div className="profile-fields">
          <h2 className="fields-title">Profile Information</h2>
          <div className="fields-grid">
            {FIELD_CONFIG.map((field) => {
              const isEditing = editingField === field.key;
              const value = fieldValue(field.key);
              const isEmpty = !value;
              return (
                <div key={field.key} className="field-card">
                  <div className="field-header">
                    <span className="field-icon">{field.icon}</span>
                    <span className="field-label">{field.label}</span>
                  </div>
                  {isEditing ? (
                    <div className="field-edit">
                      <input
                        type={field.type}
                        value={draftValue}
                        onChange={(e) => setDraftValue(e.target.value)}
                        autoFocus
                        className="field-input"
                        placeholder={field.placeholder}
                      />
                      <div className="field-actions">
                        <button
                          type="button"
                          className="btn-save"
                          disabled={savingField === field.key}
                          onClick={() => saveField(field.key)}
                          title="Save"
                        >
                          {savingField === field.key ? "Saving…" : <FaSave size={16} />}
                        </button>
                        <button type="button" className="btn-cancel" onClick={cancelEdit} title="Cancel">
                          <FaTimes size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="field-value">
                      {isEmpty ? (
                        <span className="field-empty">Not set</span>
                      ) : (
                        <span className="field-text">{value}</span>
                      )}
                      <div className="field-controls">
                        {!isEmpty && (
                          <button
                            type="button"
                            className="btn-clear"
                            onClick={() => clearField(field.key)}
                            title="Clear"
                            disabled={savingField === field.key}
                          >
                            <FaTrash size={16} />
                          </button>
                        )}
                        <button type="button" className="btn-field-edit" onClick={() => startEdit(field.key)} title="Edit">
                          <FaEdit size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="profile-actions">
          <button className="btn-change-password" onClick={() => navigate("/edit-profile")}>
            Change Password
          </button>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
