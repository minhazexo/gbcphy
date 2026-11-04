// src/pages/AdminDashboard/AdminDashboard.js
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUsers, FaUserCheck, FaUserClock, FaUserTimes, FaUserSlash,
  FaChalkboardTeacher, FaShieldAlt, FaClipboardList, FaArrowRight
} from "react-icons/fa";
import AdminLayout from "../../components/admin/layout/AdminLayout.js";
import { useToast } from "../../components/admin/layout/AdminLayout.js";
import { getDashboardStats } from "../../data/db.js";
import { supabase, isSupabaseConfigured } from "../../data/supabase.js";
import "./AdminDashboard.scss";
import Card from "../../components/admin/ui/Card.js";
import Badge from "../../components/admin/ui/Badge.js";
import Button from "../../components/admin/ui/Button.js";
import PageHeader from "../../components/admin/ui/PageHeader.js";
import StatCard from "../../components/admin/ui/StatCard.js";


const STATUS_LABEL = { pending: "Pending", approved: "Approved", rejected: "Rejected", suspended: "Suspended" };

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [stats, setStats] = useState({ totalStudents: 0, approved: 0, pending: 0, rejected: 0, suspended: 0, totalFaculty: 0, activeFaculty: 0, totalAdmins: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Admin Dashboard | Department of Physics";
    let active = true;
    const load = async () => {
      try {
        setStats(await getDashboardStats());
        if (isSupabaseConfigured) {
          const { data, error } = await supabase
            .from("students")
            .select("id, student_id, registration_number, batch, academic_session, status, created_at")
            .order("created_at", { ascending: false })
            .limit(10);
          if (error) throw error;
          setRecent(data || []);
          const { data: profiles } = await supabase.from("profiles").select("id, full_name");
          const profileMap = new Map((profiles || []).map(p => [p.id, p.full_name]));
          setRecent((data || []).map(s => ({ ...s, profile_name: profileMap.get(s.id) || "N/A" })));
        }
      } catch (err) {
        setError(err.message || "Failed to load dashboard.");
        addToast({ title: "Error", description: err.message || "Failed to load dashboard.", variant: "error" });
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [addToast]);

  const statCards = [
    { title: "Total Students", value: stats.totalStudents, icon: FaUsers, color: "primary", trend: { value: "+12%", positive: true, label: "vs last month" } },
    { title: "Approved", value: stats.approved, icon: FaUserCheck, color: "success" },
    { title: "Pending", value: stats.pending, icon: FaUserClock, color: "warning" },
    { title: "Rejected", value: stats.rejected, icon: FaUserTimes, color: "error" },
    { title: "Suspended", value: stats.suspended, icon: FaUserSlash, color: "default" },
    { title: "Total Faculty", value: stats.totalFaculty, icon: FaChalkboardTeacher, color: "primary" },
    { title: "Active Faculty", value: stats.activeFaculty, icon: FaUserCheck, color: "success" },
    { title: "Total Admins", value: stats.totalAdmins, icon: FaShieldAlt, color: "default" }
  ];

  const quickActions = [
    { label: "Manage Students", to: "/admin/students", icon: FaUsers },
    { label: "Review Approvals", to: "/admin/approvals", icon: FaClipboardList },
    { label: "Manage Faculty", to: "/admin/faculty", icon: FaChalkboardTeacher },
    { label: "Manage Content", to: "/admin/content", icon: FaClipboardList }
  ];

  const statusBadge = (status) => (
    <Badge variant={status === "pending" ? "warning" : status === "approved" ? "success" : status === "rejected" ? "error" : "default"} size="sm">
      {STATUS_LABEL[status] || status}
    </Badge>
  );

  if (loading) {
    return (
      <AdminLayout>
        <PageHeader title="Dashboard" description="Overview of department activities." />
        <p className="admin-dashboard-loading">Loading dashboard...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {error && (
        <div className="admin-dashboard-error" role="alert">
          {error}
        </div>
      )}

      <PageHeader
        title="Dashboard"
        description="Overview of department activities and recent registrations."
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/students")}>
            Manage Students <FaArrowRight size={16} />
          </Button>
        }
      />

      <section className="admin-dashboard-stats">
        {statCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            trend={card.trend}
            className="admin-dashboard-stat-card"
          />
        ))}
      </section>

      <section className="admin-dashboard-body">
        <section className="admin-dashboard-panel">
          <header className="admin-dashboard-panel-head">
            <div>
              <h2>Recent Registrations</h2>
              <p>Last 10 student sign-ups.</p>
            </div>
            <Link to="/admin/students" className="admin-dashboard-btn primary">View all students <FaArrowRight /></Link>
          </header>
          <div className="admin-dashboard-table-wrap">
            <table className="admin-dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Student ID</th>
                  <th>Batch</th>
                  <th>Session</th>
                  <th>Status</th>
                  <th className="right">Joined</th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 ? (
                  <tr><td colSpan={6} className="admin-dashboard-empty">No recent registrations.</td></tr>
                ) : (
                  recent.map((s) => (
                    <tr key={s.id || s.student_id}>
                      <td>{s.profile_name || "N/A"}</td>
                      <td className="muted">{s.student_id || "N/A"}</td>
                      <td className="muted">{s.batch || "N/A"}</td>
                      <td className="muted">{s.academic_session || "N/A"}</td>
                      <td>{statusBadge(s.status || "pending")}</td>
                      <td className="right muted">{s.created_at ? new Date(s.created_at).toLocaleDateString() : "�"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-dashboard-panel">
          <header className="admin-dashboard-panel-head">
            <div>
              <h2>Quick Actions</h2>
              <p>Common admin tasks.</p>
            </div>
          </header>
          <div className="admin-dashboard-quick-actions">
            {quickActions.map((action) => (
              <Link key={action.label} to={action.to} className="admin-dashboard-btn">
                <action.icon size={16} /> {action.label}
              </Link>
            ))}
          </div>
        </section>
      </section>
    </AdminLayout>
  );
}
