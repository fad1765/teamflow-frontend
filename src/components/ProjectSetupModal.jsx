import useLanguage from "../components/useLanguage";
import "../styles/projectSetupModal.css";

export default function ProjectSetupModal({ open, onSelect }) {
  const { language } = useLanguage();

  if (!open) return null;

  return (
    <div className="modal-backdrop project-setup-backdrop">
      <div className="project-setup-modal">
        <div className="project-setup-header">
          <h2>
            {language === "zh" ? "選擇專案類型" : "Choose Project Type"}
          </h2>
          <p>
            {language === "zh"
              ? "請先選擇你要建立個人專案，還是團體專案。"
              : "Choose whether you want a personal project or a team project."}
          </p>
        </div>

        <div className="project-setup-options">
          <button
            type="button"
            className="project-type-card"
            onClick={() => onSelect("personal")}
          >
            <h3>{language === "zh" ? "個人專案" : "Personal Project"}</h3>
            <p>
              {language === "zh"
                ? "適合個人管理任務，不需要邀請其他成員。"
                : "Best for solo planning and task management."}
            </p>
          </button>

          <button
            type="button"
            className="project-type-card"
            onClick={() => onSelect("team")}
          >
            <h3>{language === "zh" ? "團體專案" : "Team Project"}</h3>
            <p>
              {language === "zh"
                ? "適合 PM 與團隊協作，可邀請其他成員加入。"
                : "Best for PM and collaboration. Invite team members."}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}