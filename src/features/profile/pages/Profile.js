// src/pages/Profile/Profile.js
import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext.js";
import { useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../../../data/supabase.js";
import { FaUserCircle } from "react-icons/fa";
import "../../../styles/profile.scss";

const STATUS_LABELS = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended"
};

export default function Profile() {
  const { userProfile, isAuthenticated, authReady, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userProfile.id)
            .single();
          if (profileError) throw profileError;

          let studentData = null;
          try {
            const { data, error } = await supabase
              .from("students")
              .select("*")
              .eq("id", userProfile.id)
              .single();
            if (error && error.code !== "PGRST116") throw error;
            studentData = data || null;
          } catch (studentErr) {
            // students table may not exist or have no matching row; ignore
          }

          setProfile({
            ...profileData,
            ...studentData,
            full_name:
              profileData.full_name ||
              studentData?.name ||
              userProfile.username ||
              "",
            student_id:
              profileData.student_id ||
              studentData?.student_id ||
              userProfile.roll ||
              "",
            registration_number:
              profileData.registration_number ||
              studentData?.registration_number ||
              "",
            department:
              profileData.department || studentData?.department || "",
            batch: profileData.batch || studentData?.batch || "",
            academic_session:
              profileData.academic_session ||
              studentData?.academic_session ||
              profileData.session ||
              userProfile.session ||
              "",
            status: profileData.status || studentData?.status || "pending",
            email: profileData.email || userProfile.email || "",
            created_at: profileData.created_at
          });
        } else {
          setProfile({
            ...userProfile,
            full_name: userProfile.username || "",
            student_id: userProfile.roll || "",
            status: "pending"
          });
        }
      } catch (err) {
        setError(err.message || "Failed to load profile.");
        setProfile(userProfile ? {
          ...userProfile,
          full_name: userProfile.username || "",
          student_id: userProfile.roll || "",
          status: "pending"
        } : null);
      } finally {
        setLoading(false);
      }
    })();
  }, [authReady, isAuthenticated, userProfile, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      setError(err.message || "Logout failed.");
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="profile-container">
        <p>Redirecting to sign in...</p>
      </div>
    );
  }

  const p = profile || {};
  const statusKey = String(p.status || "pending").toLowerCase();
  const badgeClass = `status-badge ${statusKey}`;

  return (
    <div className="profile-container">
      {error && <div className="error-message">{error}</div>}
      <div className="profile-card">
        <div className="profile-image">
          {p.profile_image ? (
            <img src={p.profile_image} alt="Profile" className="profile-img" />
          ) : (
            <FaUserCircle size={100} />
          )}
        </div>

        <div className="profile-details">
          <h1>{p.full_name || p.username || "Student"}</h1>
          <span className={badgeClass}>{STATUS_LABELS[statusKey] || "Pending"}</span>
          <p><strong>Student ID:</strong> {p.student_id || p.roll || "N/A"}</p>
          <p><strong>Registration Number:</strong> {p.registration_number || "N/A"}</p>
          <p><strong>Department:</strong> {p.department || "N/A"}</p>
          <p><strong>Batch:</strong> {p.batch || "N/A"}</p>
          <p><strong>Academic Session:</strong> {p.academic_session || p.session || "N/A"}</p>
          <p><strong>Email:</strong> {p.email || userProfile.email || "N/A"}</p>
          <p><strong>Phone:</strong> {p.phone || "N/A"}</p>
          <p><strong>Verification Status:</strong> {statusKey === "approved" ? "Verified" : "Pending verification"}</p>
          <p><strong>Account Created:</strong> {p.created_at ? new Date(p.created_at).toLocaleDateString() : "N/A"}</p>
        </div>

        <div className="profile-actions">
          <button className="btn-edit" onClick={() => navigate("/edit-profile")}>
            Edit Profile
          </button>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
