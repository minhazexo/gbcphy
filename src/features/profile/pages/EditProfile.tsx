// EditProfile page

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.tsx";
import { supabase, isSupabaseConfigured } from "../../../data/supabase.ts";
import "./editProfile.scss";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function EditProfile() {
  const { userProfile, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState("");
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    setLoading(true);
    (async () => {
      try {
        if (isSupabaseConfigured && userProfile) {
          const { data, error } = await supabase!
            .from("profiles")
            .select("*")
            .eq("id", userProfile.id)
            .single();
          if (error) throw error;
          setName(data.full_name || "");
          setPhone(data.phone || "");
        } else {
          setName(userProfile?.username || "");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, [loaded, userProfile]);

  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value);
  const handleChangePhone = (e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value);
  const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value);
  const handleChangeConfirm = (e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
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
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const updates: Record<string, unknown> = {};
      if (name.trim()) updates.full_name = name.trim();
      if (phone.trim()) updates.phone = phone.trim();
      if (newPassword) updates.password = newPassword;

      if (isSupabaseConfigured && userProfile && profilePicture) {
        const fileName = `${userProfile.id}/${Date.now()}-${profilePicture.name.replace(/\s+/g, "_")}`;
        const { error: uploadError } = await supabase!.storage.from("profile-images").upload(fileName, profilePicture);
        if (uploadError) throw uploadError;
        const { data: urlData } = await supabase!.storage.from("profile-images").getPublicUrl(fileName);
        updates.avatar_url = urlData.publicUrl;
      }

      await updateUserProfile(updates);
      setSuccess("Profile updated successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="edit-profile-container">Loading...</div>;
  }

  return (
    <div className="edit-profile-container">
      <h1>Edit Profile</h1>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <form onSubmit={handleSave} className="edit-profile-form">
        <div className="form-group">
          <label>Full Name</label>
          <input type="text" value={name} onChange={handleChangeName} required />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input type="tel" value={phone} onChange={handleChangePhone} />
        </div>
        <div className="form-group">
          <label>New Password</label>
          <input type="password" value={newPassword} onChange={handleChangePassword} />
        </div>
        <div className="form-group">
          <label>Confirm Password</label>
          <input type="password" value={confirmPassword} onChange={handleChangeConfirm} />
        </div>
        <div className="form-group">
          <label>Profile Picture</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {previewImage && <img src={previewImage} alt="Preview" className="image-preview" />}
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
      <button className="btn-logout" onClick={() => navigate("/profile")}>
        Back to Profile
      </button>
    </div>
  );
}
