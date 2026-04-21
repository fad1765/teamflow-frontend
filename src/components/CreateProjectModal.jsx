import { useState } from "react";
import useLanguage from "../components/useLanguage";
import "../styles/createProjectModal.css";

const initialForm = {
  name: "",
  description: "",
  type: "personal",
};

export default function CreateProjectModal({ open, onClose, onCreate }) {
  const { language } = useLanguage();

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError(
        language === "zh" ? "請輸入專案名稱" : "Please enter a project name",
      );
      return;
    }

    try {
      setSubmitting(true);

      await onCreate({
        name: form.name.trim(),
        description: form.description.trim(),
        type: form.type,
      });

      setForm(initialForm);
      setError("");
    } catch (err) {
      setError(
        err.message ||
          (language === "zh" ? "建立專案失敗" : "Failed to create project"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setForm(initialForm);
    setError("");
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div
        className="create-project-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="create-project-header">
          <h3>{language === "zh" ? "建立專案" : "Create Project"}</h3>
          <button
            type="button"
            className="create-project-close"
            onClick={handleClose}
            aria-label={language === "zh" ? "關閉" : "Close"}
          >
            ×
          </button>
        </div>

        <form className="create-project-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder={language === "zh" ? "專案名稱" : "Project name"}
            value={form.name}
            onChange={handleChange}
          />

          <textarea
            name="description"
            placeholder={
              language === "zh"
                ? "專案描述（選填）"
                : "Project description (optional)"
            }
            value={form.description}
            onChange={handleChange}
            rows={4}
          />

          <select name="type" value={form.type} onChange={handleChange}>
            <option value="personal">
              {language === "zh" ? "個人專案" : "Personal Project"}
            </option>
            <option value="team">
              {language === "zh" ? "團體專案" : "Team Project"}
            </option>
          </select>

          {error && <p className="create-project-error">{error}</p>}

          <div className="create-project-actions">
            <button
              type="button"
              className="create-project-cancel"
              onClick={handleClose}
            >
              {language === "zh" ? "取消" : "Cancel"}
            </button>
            <button
              type="submit"
              className="create-project-confirm"
              disabled={submitting}
            >
              {submitting
                ? language === "zh"
                  ? "建立中..."
                  : "Creating..."
                : language === "zh"
                  ? "建立專案"
                  : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
