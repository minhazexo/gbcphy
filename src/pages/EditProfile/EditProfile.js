// src/pages/EditProfile/EditProfile.js
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.js";
import { supabase, isSupabaseConfigured } from "../../data/supabase.js";
import "../../styles/editProfile.scss";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function EditProfile() {
  const { userProfile, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    setLoading(true);
    (async () => {
      try {
        if (isSupabaseConfigured && userProfile) {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userProfile.id)
            .single();
          if (error) throw error;

          let studentData = null;
          try {
            const { data: sData, error: sError } = await supabase
              .from("students")
              .select("*")
              .eq("id", userProfile.id)
              .single();
            if (sError && sError.code !== "PGRST116") throw sError;
            studentData = sData || null;
          } catch (_studentErr) {
            // students table may not exist or have no matching row; ignore
          }

          const merged = {
            ...data,
            ...studentData,
            full_name:
              data.full_name ||
              studentData?.full_name ||
              studentData?.name ||
              userProfile.username ||
              "",
            student_id:
              data.student_id ||
              studentData?.student_id ||
              userProfile.roll ||
              "",
            registration_number:
              data.registration_number ||
              studentData?.registration_number ||
              "",
            department: data.department || studentData?.department || "",
            batch: data.batch || studentData?.batch || "",
            academic_session:
              data.academic_session ||
              studentData?.academic_session ||
              data.session ||
              userProfile.session ||
              "",
            status: data.status || studentData?.status || "pending",
            email: data.email || userProfile.email || "",
            created_at: data.created_at
          };

          setProfile(merged);
          setName(merged.full_name || "");
          setPhone(merged.phone || "");
          setPreviewImage(merged.profile_image || "");
        } else {
          setProfile({
            ...userProfile,
            full_name: userProfile.username || "",
            student_id: userProfile.roll || "",
            status: "pending"
          });
          setName(userProfile.username || "");
          setPreviewImage(userProfile.profile_image || "");
        }
      } catch (err) {
        setError(err.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, [userProfile]);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("Image must be smaller than 5 MB.");
      return;
    }
    setProfilePicture(file);
    setPreviewImage(URL.createObjectURL(file));
    setError(null);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const updates = {};

      if (name.trim() && name.trim() !== (profile?.full_name || userProfile?.username || "")) {
        updates.full_name = name.trim();
      }
      if (phone.trim() !== (profile?.phone || "")) {
        updates.phone = phone.trim();
      }

      if (newPassword) {
        if (newPassword.length < 6) throw new Error("Password must be at least 6 characters.");
        if (newPassword !== confirmPassword) throw new Error("Passwords do not match.");
      }

      if (Object.keys(updates).length > 0) {
        if (isSupabaseConfigured) {
          await supabase.auth.updateUser({ data: updates });
          if (userProfile) {
            await supabase.from("profiles").update(updates).eq("id", userProfile.id);
          }
        } else if (updateUserProfile) {
          await updateUserProfile(updates);
        }
      }

      if (newPassword) {
        if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");
        await supabase.auth.updateUser({ password: newPassword });
      }

      if (isSupabaseConfigured && profilePicture && userProfile) {
        const fileName = `${userProfile.id}/${Date.now()}-${profilePicture.name.replace(/s+/g, "_")}`;
        const { error: uploadError } = await supabase.storage.from("profile-images").upload(fileName, profilePicture);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("profile-images").getPublicUrl(fileName);
        await supabase.auth.updateUser({ data: { profile_image: urlData.publicUrl } });
        await supabase.from("profiles").update({ profile_image: urlData.publicUrl }).eq("id", userProfile.id);
        setPreviewImage(urlData.publicUrl);
      }

      setSuccess("Profile updated successfully.");
      setTimeout(() => navigate("/profile"), 1200);
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      setError(err.message || "Logout failed.");
    }
  };
  const readOnly = (label, value) => (
    <div className="form-group" key={label}>
      <label>{label}</label>
      <input className="input-field readonly" type="text" value={value || "N/A"} readOnly />
    </div>
  );

  if (loading) {
    return (
      <div className="edit-profile-container">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="edit-profile-container">
      {error && <div className="error-message">{error}</div>}
      {success && <div className="error-message" style={{ color: "var(--accent-color)" }}>{success}</div>}
      <form className="edit-profile-form" onSubmit={handleSubmit}>
        <div className="image-preview">
          {previewImage ? (
            <img src={previewImage} alt="Profile Preview" className="profile-preview" />
          ) : (
            <p>No image selected</p>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="file-input"
          id="file-input"
        />
        <label htmlFor="file-input" className="file-input-label">Change Profile Picture</label>

        {readOnly("Student ID", profile?.student_id || userProfile?.roll)}
        {readOnly("Registration Number", profile?.registration_number)}
        {readOnly("Department", profile?.department)}
        {readOnly("Batch", profile?.batch)}
        {readOnly("Academic Session", profile?.academic_session)}
        {readOnly("Account Status", profile?.status || "pending")}

        <div className="form-group">
          <label>Full Name</label>
          <input
            className="input-field"
            type="text"
            placeholder="Enter full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            className="input-field"
            type="tel"
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>New Password (optional)</label>
          <input
            className="input-field"
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Confirm New Password</label>
          <input
            className="input-field"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="btn-save" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
        <button type="button" className="btn-save ghost" onClick={() => navigate("/profile")}>
          Cancel
        </button>
        <button type="button" className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </form>
    </div>
  );
}

