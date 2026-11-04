// Avatar component for user profile images with initials fallback.

import "./Avatar.scss";

export const Avatar = ({
  src,
  name = "U",
  size = "md",
  className,
  "aria-label": ariaLabel,
}) => {
  const sizeClasses = {
    sm: "common-avatar--sm",
    md: "common-avatar--md",
    lg: "common-avatar--lg",
    xl: "common-avatar--xl",
  };

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <div
      className={["common-avatar", sizeClasses[size], className].filter(Boolean).join(" ")}
      aria-label={ariaLabel}
    >
      {src ? (
        <img
          src={src}
          alt={ariaLabel || name}
          className="common-avatar__image"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="common-avatar__initials" aria-hidden="true">
          {initials}
        </div>
      )}
    </div>
  );
};

export default Avatar;
