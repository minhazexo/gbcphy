// Avatar UI component for the admin dashboard.

import "./Avatar.scss";

const AVATAR_COLORS = [
  "#4f46e5",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f97316"
];

const hashName = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const initialsFromName = (name) => {
  if (!name) {
    return "AD";
  }
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (parts[0].slice(0, 2) || "AD").toUpperCase();
};

const SIZES = {
  sm: "var(--admin-space-6)",
  md: "var(--admin-space-8)",
  lg: "var(--admin-space-10)",
  xl: "var(--admin-space-12)"
};

export const Avatar = ({
  src,
  alt,
  name,
  size = "md",
  className,
  "aria-label": ariaLabel
}) => {
  const showImage = Boolean(src);
  const label = ariaLabel ?? (name ?? "User avatar");
  const initials = showImage ? "" : initialsFromName(name);
  const color = showImage
    ? "transparent"
    : AVATAR_COLORS[hashName(name ?? "AD") % AVATAR_COLORS.length];
  const dimension = SIZES[size] ?? SIZES.md;

  return (
    <span
      className={`avatar avatar--${size} ${className ?? ""}`}
      style={{ width: dimension, height: dimension, background: color }}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt ?? label}
          className="avatar__image"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span className="avatar__initials" aria-hidden="true">
          {initials}
        </span>
      )}
      {!showImage && <span className="admin-visually-hidden">{label}</span>}
    </span>
  );
};

export default Avatar;
