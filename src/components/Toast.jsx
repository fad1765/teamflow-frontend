import "../styles/toast.css";

export default function Toast({ open, message, type = "info" }) {
  if (!open) return null;

  return (
    <div className={`toast toast--${type}`}>
      <span>{message}</span>
    </div>
  );
}
