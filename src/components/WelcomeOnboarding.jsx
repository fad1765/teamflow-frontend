import { IoPersonSharp } from "react-icons/io5";
import { MdGroups } from "react-icons/md";
import useLanguage from "../components/useLanguage";

export default function WelcomeOnboarding({ onCreatePersonal, onCreateTeam }) {
  const { language } = useLanguage();

  return (
    <section className="welcome-onboarding">
      <div className="welcome-hero">
        <span className="welcome-eyebrow">
          {language === "zh" ? "第一次使用 TeamFlow" : "New to TeamFlow"}
        </span>

        <h2>
          {language === "zh"
            ? "建立你的第一個專案工作區"
            : "Create your first project workspace"}
        </h2>

        <p>
          {language === "zh"
            ? "選擇你想管理的專案類型，TeamFlow 會帶你進入對應的任務看板、時程管理與協作流程。"
            : "Choose how you want to start. TeamFlow will guide you into the right board, timeline, and collaboration workflow."}
        </p>
      </div>

      <div className="welcome-options">
        <button
          type="button"
          className="welcome-card welcome-card--personal"
          onClick={onCreatePersonal}
        >
          <div className="welcome-card-top">
            <div className="welcome-card-icon">
              <IoPersonSharp />
            </div>
            <span className="welcome-card-tag">
              {language === "zh" ? "Personal" : "Personal"}
            </span>
          </div>

          <div>
            <h3>{language === "zh" ? "個人專案" : "Personal Project"}</h3>
            <p>
              {language === "zh"
                ? "適合管理自己的任務、讀書計畫、每日待辦與個人時程。"
                : "Best for personal tasks, study plans, portfolios, daily work, and schedules."}
            </p>
          </div>

          <div className="welcome-card-footer">
            <span>{language === "zh" ? "開始個人專案" : "Start Personal"}</span>
            <b>→</b>
          </div>
        </button>

        <button
          type="button"
          className="welcome-card welcome-card--team"
          onClick={onCreateTeam}
        >
          <div className="welcome-card-top">
            <div className="welcome-card-icon">
              <MdGroups />
            </div>
            <span className="welcome-card-tag">
              {language === "zh" ? "Team" : "Team"}
            </span>
          </div>

          <div>
            <h3>{language === "zh" ? "團體專案" : "Team Project"}</h3>
            <p>
              {language === "zh"
                ? "適合邀請成員、分派任務、追蹤進度、留言討論與團隊協作開發。"
                : "Best for inviting members, assigning tasks, tracking progress, comments, and team collaboration."}
            </p>
          </div>

          <div className="welcome-card-footer">
            <span>{language === "zh" ? "建立團體專案" : "Create Team"}</span>
            <b>→</b>
          </div>
        </button>
      </div>
    </section>
  );
}