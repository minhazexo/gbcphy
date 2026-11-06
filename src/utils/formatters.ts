// Data formatting helpers.
// Centralize date, currency, and display formatting so the UI stays consistent.

export const formatDate = (iso: string | undefined | null, options: Intl.DateTimeFormatOptions = {}): string => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...options,
    });
  } catch {
    return "—";
  }
};

export const formatDateTime = (iso: string | undefined | null): string => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

export const relativeTime = (iso: string | undefined | null): string => {
  if (!iso) return "recently";
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day ago`;
};

export const capitalize = (str: string | undefined | null): string => {
  if (!str) return "";
  return String(str).charAt(0).toUpperCase() + String(str).slice(1);
};

export const titleCase = (str: string | undefined | null): string => {
  if (!str) return "";
  return String(str)
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
};

export const formatRole = (role: string | undefined | null): string => {
  if (!role) return "—";
  return role
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

export const statusLabel = (status: string | undefined | null): string => {
  const labels: Record<string, string> = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    suspended: "Suspended",
  };
  return labels[String(status ?? "").toLowerCase()] ?? String(status ?? "");
};

export const downloadTotal = (downloads: Record<string, number> | undefined | null): number => {
  return Object.values(downloads ?? {}).reduce((sum, value) => sum + (Number(value) || 0), 0);
};

export default {
  formatDate,
  formatDateTime,
  relativeTime,
  capitalize,
  titleCase,
  formatRole,
  statusLabel,
  downloadTotal,
};
