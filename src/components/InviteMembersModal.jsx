import { useMemo, useState } from "react";
import UserAvatar from "../components/UserAvatar";
import useLanguage from "../components/useLanguage";
import "../styles/inviteMembersModal.css";

export default function InviteMembersModal({
  open,
  users,
  selectedMembers,
  onClose,
  onSave,
}) {
  const { language } = useLanguage();
const [keyword, setKeyword] = useState("");
const [selectedEmails, setSelectedEmails] = useState(() =>
  selectedMembers.map((member) => member.email),
);

  const filteredUsers = useMemo(() => {
    const lowerKeyword = keyword.trim().toLowerCase();

    if (!lowerKeyword) return users;

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(lowerKeyword) ||
        user.email.toLowerCase().includes(lowerKeyword),
    );
  }, [users, keyword]);

  const handleToggleMember = (email) => {
    setSelectedEmails((prev) =>
      prev.includes(email)
        ? prev.filter((item) => item !== email)
        : [...prev, email],
    );
  };

  const handleSave = () => {
    const members = users.filter((user) => selectedEmails.includes(user.email));
    onSave(members);
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop invite-members-backdrop" onClick={onClose}>
      <div
        className="invite-members-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="invite-members-header">
          <div>
            <h3>{language === "zh" ? "邀請專案成員" : "Invite Members"}</h3>
            <p>
              {language === "zh"
                ? "選擇要加入團體專案的成員。"
                : "Choose users to join this team project."}
            </p>
          </div>

          <button
            type="button"
            className="invite-members-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <input
          type="text"
          className="invite-search-input"
          placeholder={
            language === "zh" ? "搜尋姓名或 Email" : "Search by name or email"
          }
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <div className="invite-members-list">
          {filteredUsers.length === 0 ? (
            <div className="invite-members-empty">
              {language === "zh" ? "找不到符合的使用者" : "No users found"}
            </div>
          ) : (
            filteredUsers.map((user) => {
              const checked = selectedEmails.includes(user.email);

              return (
                <label key={user.id} className="invite-member-item">
                  <div className="invite-member-left">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleMember(user.email)}
                    />

                    <UserAvatar
                      name={user.name}
                      color={user.color}
                      size="sm"
                    />

                    <div className="invite-member-text">
                      <span>{user.name}</span>
                      <small>{user.email}</small>
                    </div>
                  </div>
                </label>
              );
            })
          )}
        </div>

        <div className="invite-members-actions">
          <button
            type="button"
            className="invite-members-cancel"
            onClick={onClose}
          >
            {language === "zh" ? "取消" : "Cancel"}
          </button>
          <button
            type="button"
            className="invite-members-save"
            onClick={handleSave}
          >
            {language === "zh" ? "儲存成員" : "Save Members"}
          </button>
        </div>
      </div>
    </div>
  );
}