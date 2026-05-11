import { useMemo, useState } from "react";
import useLanguage from "../components/useLanguage";
import "../styles/inviteMembersModal.css";

export default function InviteMembersModal({ open, users, onClose, onSave }) {
  const { language } = useLanguage();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const normalizedUsers = useMemo(() => {
    return Array.isArray(users) ? users : [];
  }, [users]);

  if (!open) return null;

  const handleClose = () => {
    setEmail("");
    setError("");
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError(language === "zh" ? "請輸入會員 Email" : "Please enter member email");
      return;
    }

    const matchedUser = normalizedUsers.find(
      (user) => String(user.email).trim().toLowerCase() === cleanEmail,
    );

    if (!matchedUser) {
      setError(
        language === "zh"
          ? "查無此會員，或該會員尚未註冊"
          : "Member not found or not registered",
      );
      return;
    }

    onSave([matchedUser]);
    setEmail("");
    setError("");
  };

  return (
    <div
      className="modal-backdrop invite-members-backdrop"
      onClick={handleClose}
    >
      <div
        className="invite-members-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="invite-members-header">
          <div>
            <h3>{language === "zh" ? "邀請專案成員" : "Invite Project Members"}</h3>
            <p>
              {language === "zh"
                ? "請輸入已註冊會員的 Email 進行邀請。"
                : "Enter the email of a registered member to invite them."}
            </p>
          </div>

          <button
            type="button"
            className="invite-members-close"
            onClick={handleClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form className="invite-members-form" onSubmit={handleSubmit}>
          <input
            type="email"
            className="invite-search-input"
            placeholder={
              language === "zh" ? "請輸入會員 Email" : "Enter member email"
            }
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
          />

          {error ? <p className="invite-members-error">{error}</p> : null}

          <div className="invite-members-actions">
            <button
              type="button"
              className="invite-members-cancel"
              onClick={handleClose}
            >
              {language === "zh" ? "取消" : "Cancel"}
            </button>
            <button type="submit" className="invite-members-save">
              {language === "zh" ? "送出邀請" : "Send Invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}