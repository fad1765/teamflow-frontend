import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UserAvatar from "../components/UserAvatar";
import ProjectDashboard from "../components/ProjectDashboard";
import api from "../services/api";
import useLanguage from "../components/useLanguage";
import "../styles/board.css";
import "../styles/dashboard.css";

function OverviewSkeleton() {
  return (
    <div className="board-skeleton">
      <div className="board-skeleton-toolbar" />
      <div className="dashboard-stats-grid">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="board-skeleton-card" />
        ))}
      </div>
    </div>
  );
}

export default function ProjectOverview() {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const { language, toggleLanguage } = useLanguage();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        const [projectRes, tasksRes, membersRes] = await Promise.all([
          api.get(`/projects/${projectId}`),
          api.get(`/projects/${projectId}/tasks`),
          api.get(`/projects/${projectId}/members`),
        ]);

        
        setProject(projectRes.data || null);
        setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
        setMembers(Array.isArray(membersRes.data) ? membersRes.data : []);
      } catch (err) {
        console.error(err);
        navigate("/projects");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [projectId, navigate]);

  return (
    <div className="board-page">
      <div className="topbar">
        <div>
          <h1>{project?.name || "Loading..."}</h1>
          <p className="topbar-subtitle">
            {project?.type === "team"
              ? language === "zh"
                ? "團體專案"
                : "Team Project"
              : language === "zh"
                ? "個人專案"
                : "Personal Project"}
          </p>
        </div>

        <div className="topbar-right">
          <button className="language-btn" onClick={toggleLanguage}>
            {language === "zh" ? "EN" : "中文"}
          </button>

          {currentUser && (
            <div className="current-user-chip">
              <UserAvatar
                name={currentUser.name}
                color={currentUser.color}
                size="sm"
              />
              <span>{currentUser.name}</span>
            </div>
          )}

          <button
            type="button"
            className="back-projects-btn"
            onClick={() => navigate("/projects")}
          >
            {language === "zh" ? "返回專案" : "Back to Projects"}
          </button>
        </div>
      </div>

      <div className="project-tabs">
        <button type="button" className="project-tab active">
          {language === "zh" ? "專案總覽" : "Overview"}
        </button>

        <button
          type="button"
          className="project-tab"
          onClick={() => navigate(`/board/${projectId}`)}
        >
          {language === "zh" ? "任務管理" : "Tasks"}
        </button>
      </div>

      {loading ? (
        <OverviewSkeleton />
      ) : (
        <ProjectDashboard tasks={tasks} members={members} language={language} />
      )}
    </div>
  );
}