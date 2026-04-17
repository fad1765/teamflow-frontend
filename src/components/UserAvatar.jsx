import "../styles/avatar.css";

function getInitials(name) {
  if (!name) return "?";

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function UserAvatar({ name, color, size = "md" }) {
  const initials = getInitials(name);

  return (
    <div
      className={`user-avatar user-avatar--${size}`}
      style={{ backgroundColor: color || "#94a3b8" }}
      title={name}
    >
      {initials}
    </div>
  );
}
