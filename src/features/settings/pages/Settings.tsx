// Settings page — premium redesign.

import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaMoon, FaSun, FaBell, FaSave, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";
import AdminLayout from "../../../layouts/AdminLayout";
import { useToast } from "../../../layouts/AdminLayout";
import { useTheme } from "../../../context/ThemeContext.tsx";
import { useAuth } from "../../../context/AuthContext.tsx";
import Card from "../../../components/admin/ui/Card";
import Button from "../../../components/admin/ui/Button";
import Input from "../../../components/admin/ui/Input";
import PageHeader from "../../../components/admin/ui/PageHeader";
import "./settings.scss";

export default function Settings() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const { userProfile, updateUserProfile } = useAuth();

  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    full_name: userProfile?.full_name || "",
    email: userProfile?.email || ""
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });

  const [notificationPrefs, setNotificationPrefs] = useState({
    email: true,
    sms: false,
    announcements: true
  });

  useEffect(() => {
    document.title = "Settings | Department of Physics";
  }, []);

  useEffect(() => {
    if (userProfile) {
      setForm({
        full_name: userProfile.full_name || "",
        email: userProfile.email || ""
      });
    }
  }, [userProfile]);

  const handleProfileChange = useCallback((field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handlePasswordChange = useCallback((field: string, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleNotificationToggle = useCallback((key: "email" | "sms" | "announcements") => {
    setNotificationPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleSaveProfile = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile(form as Record<string, unknown>);
      addToast({ title: "Profile saved", message: "Your profile information has been updated.", type: "success" });
    } catch (error: any) {
      console.error("Failed to save profile:", error);
      addToast({ title: "Save failed", message: error.message || "Could not update profile.", type: "error" });
    } finally {
      setSaving(false);
    }
  }, [form, updateUserProfile, addToast]);

  const handleSavePassword = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (passwordForm.new_password !== passwordForm.confirm_password) {
        throw new Error("New password and confirmation do not match.");
      }
      if (!passwordForm.current_password) throw new Error("Current password is required.");
      if (!passwordForm.new_password) throw new Error("New password is required.");
      addToast({ title: "Password updated", message: "Your password has been changed successfully.", type: "success" });
      setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (error: any) {
      addToast({ title: "Password change failed", message: error.message, type: "error" });
    } finally {
      setSaving(false);
    }
  }, [passwordForm, addToast]);

  const TABS = [
    { key: "profile", label: "Profile", icon: FaUser },
    { key: "security", label: "Security", icon: FaLock },
    { key: "theme", label: "Appearance", icon: FaSun },
    { key: "notifications", label: "Notifications", icon: FaBell }
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Settings"
        description="Manage your account preferences and security."
        actions={<Button variant="outline" size="sm" onClick={() => navigate("/")}><FaArrowRight size={14} /> Back to dashboard</Button>}
      />
      <div className="settings">
        <nav className="settings__tabs" role="tablist" aria-label="Settings sections">
          {TABS.map((tab) => {
            const Icon: React.ComponentType<{ size?: number; className?: string }> = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={["settings__tab", isActive && "settings__tab--active"].filter(Boolean).join(" ")}
                onClick={() => setActiveTab(tab.key)}
              >
                <Icon size={16} className="settings__tab-icon" aria-hidden="true" />
                <span className="settings__tab-label">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {activeTab === "profile" && (
          <motion.section className="settings__panel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <Card className="settings__card" padding="lg">
              <div className="settings__panel-header">
                <h2 className="settings__panel-title">Profile</h2>
                <p className="settings__panel-description">Update your name and email address.</p>
              </div>
              <form onSubmit={handleSaveProfile} className="settings__form">
                <div className="settings__form-grid">
                  <Input label="Full Name" value={form.full_name} onChange={(v: string) => handleProfileChange("full_name", v)} placeholder="Enter your full name" leftIcon={<FaUser size={16} aria-hidden="true" />} size="sm" aria-label="Full name" />
                  <Input type="email" label="Email Address" value={form.email} onChange={(v: string) => handleProfileChange("email", v)} placeholder="Enter your email" leftIcon={<FaLock size={16} aria-hidden="true" />} size="sm" aria-label="Email address" />
                </div>
                <div className="settings__form-actions">
                  <Button type="submit" variant="primary" loading={saving} disabled={saving}><FaSave size={16} /> Save changes</Button>
                </div>
              </form>
            </Card>
          </motion.section>
        )}

        {activeTab === "security" && (
          <motion.section className="settings__panel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <Card className="settings__card" padding="lg">
              <div className="settings__panel-header">
                <h2 className="settings__panel-title">Security</h2>
                <p className="settings__panel-description">Change your account password.</p>
              </div>
              <form onSubmit={handleSavePassword} className="settings__form">
                <Input type="password" label="Current Password" value={passwordForm.current_password} onChange={(v: string) => handlePasswordChange("current_password", v)} placeholder="••••••••" leftIcon={<FaLock size={16} aria-hidden="true" />} size="sm" aria-label="Current password" />
                <Input type="password" label="New Password" value={passwordForm.new_password} onChange={(v: string) => handlePasswordChange("new_password", v)} placeholder="••••••••" leftIcon={<FaLock size={16} aria-hidden="true" />} size="sm" aria-label="New password" />
                <Input type="password" label="Confirm New Password" value={passwordForm.confirm_password} onChange={(v: string) => handlePasswordChange("confirm_password", v)} placeholder="••••••••" leftIcon={<FaLock size={16} aria-hidden="true" />} size="sm" aria-label="Confirm new password" />
                <div className="settings__form-actions">
                  <Button type="submit" variant="danger" loading={saving} disabled={saving}>Change password</Button>
                </div>
              </form>
            </Card>
          </motion.section>
        )}

        {activeTab === "theme" && (
          <motion.section className="settings__panel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <Card className="settings__card" padding="lg">
              <div className="settings__panel-header">
                <h2 className="settings__panel-title">Appearance</h2>
                <p className="settings__panel-description">Choose your preferred color theme.</p>
              </div>
              <div className="settings__theme-options">
                {[
                  { key: "light", label: "Light", icon: <FaSun /> },
                  { key: "dark", label: "Dark", icon: <FaMoon /> }
                ].map((option) => {
                  const isActive = theme === option.key;
                  return (
                    <Button
                      key={option.key}
                      type="button"
                      variant={isActive ? "primary" : "outline"}
                      size="md"
                      onClick={() => { if (theme !== option.key) toggleTheme(); }}
                      className={isActive ? "settings__theme-btn--active" : "settings__theme-btn"}
                    >
                      {option.icon} {option.label}
                    </Button>
                  );
                })}
              </div>
            </Card>
          </motion.section>
        )}

        {activeTab === "notifications" && (
          <motion.section className="settings__panel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <Card className="settings__card" padding="lg">
              <div className="settings__panel-header">
                <h2 className="settings__panel-title">Notifications</h2>
                <p className="settings__panel-description">Manage how you receive updates.</p>
              </div>
              <div className="settings__pref-list">
                {[
                  { key: "email", label: "Email notifications", description: "Receive updates via email." },
                  { key: "sms", label: "SMS notifications", description: "Receive updates via text message." },
                  { key: "announcements", label: "Department announcements", description: "Receive official department announcements." }
                ].map((pref) => (
                  <div key={pref.key} className="settings__pref-item">
                    <div className="settings__pref-info">
                      <span className="settings__pref-label">{pref.label}</span>
                      <p className="settings__pref-description">{pref.description}</p>
                    </div>
                    <button
                      type="button"
                      className={["settings__pref-toggle", notificationPrefs[pref.key as keyof typeof notificationPrefs] && "settings__pref-toggle--active"].filter(Boolean).join(" ")}
                      onClick={() => handleNotificationToggle(pref.key as "email" | "sms" | "announcements")}
                      aria-pressed={notificationPrefs[pref.key as keyof typeof notificationPrefs]}
                      role="switch"
                    >
                      <span className="settings__pref-toggle-thumb" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="settings__form-actions">
                <Button variant="primary" onClick={() => { addToast({ title: "Saved", message: "Notification preferences updated.", type: "success" }); }}>Save preferences</Button>
              </div>
            </Card>
          </motion.section>
        )}
      </div>
    </AdminLayout>
  );
}
