import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useMotionValue, animate } from "framer-motion";
import {
  FaChartPie,
  FaUsers,
  FaUserClock,
  FaChalkboardTeacher,
  FaFileAlt,
  FaDownload,
  FaBuilding,
  FaArrowRight,
  FaCalendar,
  FaBell,
  FaChartLine,
  FaUser,
  FaUserCheck,
  FaClipboardList,
  FaShieldAlt
} from "react-icons/fa";

import AdminLayout, { useToast } from "../../../layouts/AdminLayout/AdminLayout.js";
import StatCard from "../../../components/admin/ui/StatCard.js";
import Card from "../../../components/admin/ui/Card.js";
import Button from "../../../components/admin/ui/Button.js";
import Badge from "../../../components/admin/ui/Badge.js";
import Avatar from "../../../components/admin/ui/Avatar.js";
import Separator from "../../../components/admin/ui/Separator.js";
import Skeleton from "../../../components/admin/ui/Skeleton.js";
import EmptyState from "../../../components/admin/ui/EmptyState.js";
import { getDashboardStats } from "../../../data/db.js";
import { supabase, isSupabaseConfigured } from "../../../data/supabase.js";
import { useAuth } from "../../../context/AuthContext.js";
import { useRBAC } from "../../../context/RBACContext.js";
import "../../../styles/admin-dashboard.scss";

const DEMO_STATS = {
  totalStudents: 1240,
  approved: 980,
  pending: 86,
  rejected: 42,
  suspended: 12,
  totalFaculty: 38,
  activeFaculty: 34,
  totalAdmins: 4
};
const DEMO_NOTICES = 17;
const DEMO_DOWNLOADS = 3420;
const DEMO_STORAGE = 64;

const DEMO_ACTIVITIES = [
  {
    id: "demo-1",
    type: "registration",
    actor: "Ayesha Rahman",
    action: "New student registration",
    time: "2 min ago",
    status: "pending"
  },
  {
    id: "demo-2",
    type: "approval",
    actor: "Admin",
    action: "Approved registration for Rahim Khan",
    time: "15 min ago",
    status: "approved"
  },
  {
    id: "demo-3",
    type: "content",
    actor: "Faculty",
    action: "Published optics seminar notice",
    time: "1 hr ago",
    status: "content"
  },
  {
    id: "demo-4",
    type: "system",
    actor: "System",
    action: "Scheduled backup completed",
    time: "3 hr ago",
    status: "system"
  },
  {
    id: "demo-5",
    type: "registration",
    actor: "Sumona Das",
    action: "New student registration",
    time: "5 hr ago",
    status: "rejected"
  }
];

const STAT_CARDS = [
  {
    key: "students",
    title: "Total Students",
    label: "enrolled learners",
    Icon: FaUsers,
    color: "primary",
    suffix: "",
    trend: { value: "+12%", positive: true, label: "vs last month" }
  },
  {
    key: "pending",
    title: "Pending Approvals",
    label: "awaiting review",
    Icon: FaUserClock,
    color: "warning",
    suffix: "",
    trend: { value: "+3", positive: false, label: "new this week" }
  },
  {
    key: "faculty",
    title: "Active Faculty",
    label: "teaching staff",
    Icon: FaChalkboardTeacher,
    color: "success",
    suffix: "",
    trend: { value: "+2", positive: true, label: "this semester" }
  },
  {
    key: "notices",
    title: "Total Notices",
    label: "published announcements",
    Icon: FaFileAlt,
    color: "info",
    suffix: "",
    trend: { value: "+5", positive: true, label: "new notices" }
  },
  {
    key: "downloads",
    title: "Downloads",
    label: "resource downloads",
    Icon: FaDownload,
    color: "primary",
    suffix: "",
    trend: { value: "+18%", positive: true, label: "vs last month" }
  },
  {
    key: "storage",
    title: "Storage / Usage",
    label: "of 5 GB used",
    Icon: FaBuilding,
    suffix: "%",
    trend: { value: "2.1 GB / 5 GB", positive: true, label: "storage used" }
  }
];

const QUICK_ACTIONS = [
  { label: "Add Student", to: "/admin/students", icon: FaUsers, desc: "Register a new student" },
  { label: "Review Approvals", to: "/admin/approvals", icon: FaClipboardList, desc: "Approve pending registrations" },
  { label: "Manage Faculty", to: "/admin/faculty", icon: FaChalkboardTeacher, desc: "Manage faculty records" },
  { label: "Post Notice", to: "/admin/content", icon: FaFileAlt, desc: "Publish a new notice" },
  { label: "Activity Logs", to: "/admin/activity-logs", icon: FaBell, desc: "View recent system activity" },
  { label: "Settings", to: "/admin/settings", icon: FaShieldAlt, desc: "Account preferences" }
];

const ACTIVITY_ICON = {
  registration: FaUser,
  approval: FaUserCheck,
  content: FaClipboardList,
  system: FaBell
};
const ACTIVITY_LABEL = {
  registration: "Student",
  approval: "Approval",
  content: "Content",
  system: "System"
};

const relativeTime = (iso) => {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day ago`;
};

const StatCounter = ({ value, suffix = "" }) => {
  const count = useMotionValue(0);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (typeof value !== "number") {
      return undefined;
    }
    const unsub = count.on("change", setShown);
    const controls = animate(count, value, { type: "spring", stiffness: 300, damping: 22 });
    return () => { unsub(); controls.stop(); };
  }, [value, count]);
  if (typeof value !== "number") {
    return <span className="admin-dashboard__stat-counter">{value}{suffix}</span>;
  }
  return <span className="admin-dashboard__stat-counter">{Math.max(0, Math.floor(shown))}{suffix}</span>;
};

export default function Dashboard() {
  const { userProfile } = useAuth();
  const { userRole } = useRBAC();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const demoMode = !isSupabaseConfigured;
  const [stats, setStats] = useState(null);
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  const name = userProfile?.full_name ?? "Admin";
  const roleLabel = (userRole ?? "admin").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  useEffect(() => {
    document.title = "Dashboard | Department of Physics";
    if (demoMode) {
      addToast({
        message: "Demo mode: Supabase is not configured. Showing default data.",
        type: "info"
      });
    }
    let active = true;
    const load = async () => {
      try {
        const fetched = await getDashboardStats();
        setStats(demoMode ? DEMO_STATS : fetched);
        if (!demoMode && supabase) {
          const { data, error: queryError } = await supabase
            .from("students")
            .select("id, student_id, status, created_at")
            .order("created_at", { ascending: false })
            .limit(10);
          if (queryError) throw queryError;
          setRecentStudents(data || []);
        }
      } catch (err) {
        if (!active) return;
        setError(err.message || "Failed to load dashboard.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [addToast, demoMode, supabase, version]);

  const retry = useCallback(() => {
    setError(null);
    setLoading(true);
    setVersion((v) => v + 1);
  }, []);

  const cardValues = useMemo(
    () => ({
      students: stats?.totalStudents ?? 0,
      pending: stats?.pending ?? 0,
      faculty: stats?.activeFaculty ?? 0,
      notices: DEMO_NOTICES,
      downloads: DEMO_DOWNLOADS,
      storage: DEMO_STORAGE
    }),
    [stats]
  );

  const activities = useMemo(() => {
    const fromStudents = (recentStudents || []).map((student) => ({
      id: `reg-${student.id}`,
      type: "registration",
      actor: student.student_id || "Unknown student",
      action: `Registration ${student.status || "pending"}`,
      time: student.created_at ? relativeTime(student.created_at) : "recently",
      status: student.status || "pending"
    }));
    return demoMode ? [...DEMO_ACTIVITIES] : [...fromStudents];
  }, [recentStudents, demoMode]);

  const statusChart = useMemo(() => {
    const total = Math.max(stats?.totalStudents || 1, 1);
    const items = [
      { label: "Approved", value: stats?.approved || 0, color: "var(--admin-success)" },
      { label: "Pending", value: stats?.pending || 0, color: "var(--admin-warning)" },
      { label: "Rejected", value: stats?.rejected || 0, color: "var(--admin-error)" },
      { label: "Suspended", value: stats?.suspended || 0, color: "#8b5cf6" }
    ];
    const max = Math.max(...items.map((item) => item.value), 1);
    return items.map((item) => ({
      ...item,
      width: Math.max((item.value / total) * 100, 4),
      share: total ? Math.round((item.value / total) * 100) : 0
    }));
  }, [stats]);

  const activityChart = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts = demoMode
      ? [12, 19, 15, 25, 22, 30, 28]
      : [stats?.totalStudents ? Math.floor(stats.totalStudents / 7) : 0, 0, 0, 0, 0, 0, 0];
    const max = Math.max(...counts, 1);
    return days.map((day, index) => ({
      day,
      count: counts[index],
      height: Math.max((counts[index] / max) * 100, 6)
    }));
  }, [demoMode, stats]);

  const renderChartBar = (item, orient, key) => {
    const prop = orient === "horizontal" ? "width" : "height";
    const pct = item.width ?? item.height;
    return (
      <div className={`admin-dashboard__chart-bar admin-dashboard__chart-bar--${orient}`} key={`bar-${orient}-${item.label}`}>
        <span className="admin-dashboard__chart-bar-fill"
          style={{ [prop]: `${pct}%`, backgroundColor: item.color ?? "var(--admin-primary)" }} />
      </div>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
      <section className="admin-dashboard admin-dashboard--loading" aria-busy="true">
        <header className="admin-dashboard__header">
          <div className="admin-dashboard__header-skeleton">
            <Skeleton className="admin-dashboard__skeleton-title" width="40%" height="1.25rem" />
            <Separator className="admin-dashboard__skeleton-sep" />
            <Skeleton className="admin-dashboard__skeleton-desc" width="60%" height="1rem" />
            <Skeleton className="admin-dashboard__skeleton-avatar" width="2.5rem" height="2.5rem" variant="circle" />
          </div>
        </header>

        <div className="admin-dashboard__stats">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="admin-dashboard__stat-skeleton">
              <Skeleton className="admin-dashboard__skeleton-stat-title" width="35%" height="0.875rem" />
              <Skeleton className="admin-dashboard__skeleton-stat-value" width="28%" height="1.875rem" />
              <Skeleton className="admin-dashboard__skeleton-stat-trend" width="45%" height="0.75rem" />
            </div>
          ))}
        </div>

        <div className="admin-dashboard__charts">
          <div className="admin-dashboard__chart-panel admin-dashboard__chart-skeleton">
            <Skeleton className="admin-dashboard__skeleton-panel-head" width="100%" height="1rem" />
            <Skeleton className="admin-dashboard__skeleton-panel-head" width="60%" height="0.75rem" />
            <div className="admin-dashboard__chart-skeleton-bars">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="admin-dashboard__chart-skeleton-bar">
                  <Skeleton width="70%" height="0.625rem" />
                </div>
              ))}
            </div>
          </div>
          <div className="admin-dashboard__chart-panel admin-dashboard__chart-skeleton">
            <Skeleton className="admin-dashboard__skeleton-panel-head" width="100%" height="1rem" />
            <Skeleton className="admin-dashboard__skeleton-panel-head" width="60%" height="0.75rem" />
            <div className="admin-dashboard__chart-skeleton-bars">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="admin-dashboard__chart-skeleton-bar">
                  <Skeleton width="100%" height="0.625rem" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="admin-dashboard__row">
          <section className="admin-dashboard__activities admin-dashboard__loading-skeleton">
            <Skeleton className="admin-dashboard__skeleton-panel-head" width="100%" height="1rem" />
            <Skeleton className="admin-dashboard__skeleton-panel-head" width="60%" height="0.75rem" />
            <div className="admin-dashboard__activity-skeleton-list">
              {[1, 2, 3].map((i) => (
                <div key={i} className="admin-dashboard__activity-skeleton-item">
                  <Skeleton className="admin-dashboard__skeleton-avatar" width="2.5rem" height="2.5rem" variant="circle" />
                  <div className="admin-dashboard__activity-skeleton-text">
                    <Skeleton width="45%" height="0.875rem" />
                    <Skeleton width="70%" height="0.75rem" />
                    <Skeleton width="30%" height="0.625rem" />
                  </div>
                  <Skeleton width="18%" height="1.125rem" />
                </div>
              ))}
            </div>
          </section>
          <section className="admin-dashboard__quick-actions admin-dashboard__loading-skeleton">
            <Skeleton className="admin-dashboard__skeleton-panel-head" width="100%" height="1rem" />
            <div className="admin-dashboard__action-skeleton-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="admin-dashboard__action-skeleton-card">
                  <Skeleton width="100%" height="2.75rem" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
      <section className="admin-dashboard admin-dashboard--error">
        <header className="admin-dashboard__header">
          <div className="admin-dashboard__header-content">
            <h1 className="admin-dashboard__title">Dashboard</h1>
            <p className="admin-dashboard__description">Unable to load dashboard data.</p>
          </div>
          <div className="admin-dashboard__header-meta">
            <Avatar name={name} size="lg" />
            <span className="admin-dashboard__user">{name}</span>
          </div>
        </header>
        <div className="admin-dashboard__empty">
          <div className="admin-dashboard__empty-icon" aria-hidden="true">{"\u26A0"}</div>
          <h2 className="admin-dashboard__empty-title">Something went wrong</h2>
          <p className="admin-dashboard__empty-description">{error}</p>
          <Button variant="outline" onClick={retry} icon={<FaArrowRight />}>
            Try again
          </Button>
        </div>
      </section>
    </AdminLayout>
    );
  }

  return (
    <AdminLayout>
    <section className="admin-dashboard">
      <header className="admin-dashboard__header">
        <div className="admin-dashboard__header-content">
          <div className="admin-dashboard__header-icon" aria-hidden="true">
            <FaChartPie />
          </div>
          <div>
            <h1 className="admin-dashboard__title">Dashboard</h1>
            <p className="admin-dashboard__description">
              Overview of student registrations, faculty, notices and recent activity.
            </p>
          </div>
        </div>
        <div className="admin-dashboard__header-meta">
          <Avatar name={name} size="lg" />
          <div className="admin-dashboard__user-info">
            <span className="admin-dashboard__user">{name}</span>
            <span className="admin-dashboard__role">{roleLabel}</span>
          </div>
        </div>
      </header>

      <div className="admin-dashboard__stats">
        {STAT_CARDS.map((card) => {
          const Value = StatCounter;
          return (
            <StatCard
              key={card.key}
              title={card.title}
              value={<Value value={cardValues[card.key]} suffix={card.suffix} />}
              label={card.label}
              Icon={card.Icon}
              trend={card.trend}
              className={`admin-dashboard__stat-card admin-dashboard__stat-card--${card.key}`}
              color={card.color}
            />
          );
        })}
      </div>

      <div className="admin-dashboard__charts">
        <section className="admin-dashboard__chart-panel">
          <header className="admin-dashboard__chart-head">
            <div className="admin-dashboard__chart-title">
              <span className="admin-dashboard__chart-badge" style={{ color: "var(--admin-success)" }}>
                <FaChartLine />
              </span>
              <h2 className="admin-dashboard__chart-heading">Registrations by Status</h2>
            </div>
            <p className="admin-dashboard__chart-subtitle">
              {stats?.totalStudents} total students tracked
            </p>
          </header>
          <div className="admin-dashboard__chart-grid">
            {statusChart.map((item) => (
              <div key={item.label} className="admin-dashboard__chart-row">
                <span className="admin-dashboard__chart-label">{item.label}</span>
                <div className="admin-dashboard__chart-track">
                  {renderChartBar({ label: item.label, width: item.width, color: item.color }, "horizontal", item.label)}
                </div>
                <span className="admin-dashboard__chart-value">
                  {item.value} <span className="admin-dashboard__chart-share">({item.share}%)</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-dashboard__chart-panel">
          <header className="admin-dashboard__chart-head">
            <div className="admin-dashboard__chart-title">
              <span className="admin-dashboard__chart-badge" style={{ color: "var(--admin-info)" }}>
                <FaCalendar />
              </span>
              <h2 className="admin-dashboard__chart-heading">Activity Over Time</h2>
            </div>
            <p className="admin-dashboard__chart-subtitle">Last 7 days of registrations</p>
          </header>
          <div className="admin-dashboard__chart-vertical">
            {activityChart.map((item) => (
              <div key={item.day} className="admin-dashboard__chart-column">
                {renderChartBar({ label: item.day, height: item.height }, "vertical", item.day)}
                <span className="admin-dashboard__chart-day-value">{item.count}</span>
                <span className="admin-dashboard__chart-day-label">{item.day}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="admin-dashboard__row">
        <section className="admin-dashboard__activities">
          <header className="admin-dashboard__section-head">
            <div>
              <h2 className="admin-dashboard__section-title">Recent Activities</h2>
              <p className="admin-dashboard__section-subtitle">Latest student registrations and updates.</p>
            </div>
            <Link to="/admin/activity-logs" className="admin-dashboard__section-link">
              View all <FaArrowRight />
            </Link>
          </header>
          <div className="admin-dashboard__activity-list">
            {activities.length === 0 ? (
              <EmptyState
                icon={<FaClipboardList />}
                title="No recent activity"
                description="There are no activities to display at the moment."
              />
            ) : (
              activities.map((activity) => {
                const ActivityIcon = ACTIVITY_ICON[activity.type] || FaUser;
                const badgeVariant =
                  activity.status === "approved" ? "success" : activity.status === "pending" ? "warning" : activity.status === "rejected" ? "error" : "default";
                return (
                  <div key={activity.id} className={`admin-dashboard__activity-item admin-dashboard__activity-item--${badgeVariant}`}>
                    <div className="admin-dashboard__activity-icon">
                      <ActivityIcon />
                    </div>
                    <div className="admin-dashboard__activity-body">
                      <div className="admin-dashboard__activity-actor">
                        <Avatar name={activity.actor} size="sm" />
                        <span className="admin-dashboard__activity-actor-name">{activity.actor}</span>
                      </div>
                      <p className="admin-dashboard__activity-action">{activity.action}</p>
                      <span className="admin-dashboard__activity-time">
                        <FaCalendar className="admin-dashboard__activity-time-icon" /> {activity.time}
                      </span>
                    </div>
                    <Badge variant={badgeVariant} className="admin-dashboard__activity-badge">
                      {ACTIVITY_LABEL[activity.type]}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="admin-dashboard__quick-actions">
          <header className="admin-dashboard__section-head">
            <div>
              <h2 className="admin-dashboard__section-title">Quick Actions</h2>
              <p className="admin-dashboard__section-subtitle">Common admin tasks in one place.</p>
            </div>
          </header>
          <div className="admin-dashboard__action-grid">
            {QUICK_ACTIONS.map((action) => {
              const ActionIcon = action.icon;
              return (
                <Card key={action.label} className="admin-dashboard__action-card" hover padding="none" clickable onClick={() => navigate(action.to)}>
                  <div className="admin-dashboard__action-icon">
                    <ActionIcon />
                  </div>
                  <div className="admin-dashboard__action-info">
                    <span className="admin-dashboard__action-title">{action.label}</span>
                    <span className="admin-dashboard__action-desc">{action.desc}</span>
                  </div>
                  <FaArrowRight className="admin-dashboard__action-arrow" />
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </section>
  </AdminLayout>
  );
}





