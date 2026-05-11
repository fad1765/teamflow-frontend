import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import CreateProjectModal from "../components/CreateProjectModal";
import UserAvatar from "../components/UserAvatar";
import ConfirmModal from "../components/ConfirmModal";
import useLanguage from "../components/useLanguage";
import WelcomeOnboarding from "../components/WelcomeOnboarding";
import { useToast } from "../context/ToastContext";
import "../styles/projects.css";

export default function Projects() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const { language, toggleLanguage } = useLanguage();
  const { showToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [createType, setCreateType] = useState("personal");
  const [error, setError] = useState("");
  const [inviteActionLoadingId, setInviteActionLoadingId] = useState(null);

  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [acceptTarget, setAcceptTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchProjectsPage = async () => {
    try {
      setLoading(true);
      setError("");

      const [projectsRes, invitationsRes] = await Promise.all([
        api.get("/projects"),
        api.get("/invitations/my"),
      ]);

      const projectList = Array.isArray(projectsRes.data)
        ? projectsRes.data
        : [];

      setProjects(projectList);
      setInvitations(
        Array.isArray(invitationsRes.data) ? invitationsRes.data : [],
      );
    } catch (err) {
      console.error(err);
      setError(
        language === "zh"
          ? "取得專案或邀請失敗"
          : "Failed to load projects or invitations",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsPage();
  }, []);

  const openCreateModal = (type = "personal") => {
    setCreateType(type);
    setCreateOpen(true);
  };

  const handleCreateProject = async (payload) => {
    try {
      const res = await api.post("/projects", payload);
      const newProject = res.data;

      setProjects((prev) => [newProject, ...prev]);
      setCreateOpen(false);

      showToast(
        language === "zh" ? "專案建立成功" : "Project created",
        "success",
      );

      navigate(`/board/${newProject.id}`);
    } catch (err) {
      console.error(err);
      throw new Error(
        err.response?.data?.detail ||
          (language === "zh" ? "建立專案失敗" : "Failed to create project"),
      );
    }
  };

  const handleLogout = () => {
    setLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const confirmAcceptInvitation = async () => {
    if (!acceptTarget) return;

    try {
      setInviteActionLoadingId(acceptTarget.id);

      await api.post(`/invitations/${acceptTarget.id}/accept`);

      setInvitations((prev) =>
        prev.filter((item) => item.id !== acceptTarget.id),
      );

      const targetProjectId = acceptTarget.project_id;
      setAcceptTarget(null);

      showToast(language === "zh" ? "已加入專案" : "Joined project", "success");

      navigate(`/board/${targetProjectId}`);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          (language === "zh" ? "接受邀請失敗" : "Failed to accept invitation"),
      );
    } finally {
      setInviteActionLoadingId(null);
    }
  };

  const handleDeclineInvitation = async (invitationId) => {
    try {
      setInviteActionLoadingId(invitationId);

      await api.post(`/invitations/${invitationId}/decline`);
      showToast(
        language === "zh" ? "已拒絕邀請" : "Invitation declined",
        "info",
      );
      setInvitations((prev) => prev.filter((item) => item.id !== invitationId));
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          (language === "zh" ? "拒絕邀請失敗" : "Failed to decline invitation"),
      );
    } finally {
      setInviteActionLoadingId(null);
    }
  };

  const confirmDeleteProject = async () => {
    if (!deleteTarget) return;

    try {
      await api.delete(`/projects/${deleteTarget.id}`);

      setProjects((prev) =>
        prev.filter((project) => project.id !== deleteTarget.id),
      );

      showToast(
        language === "zh" ? "專案已刪除" : "Project deleted",
        "warning",
      );

      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          (language === "zh" ? "刪除專案失敗" : "Failed to delete project"),
      );
    }
  };

  return (
    <div className="projects-page">
      <div className="projects-topbar">
        <div>
          <h1>TeamFlow</h1>
          <p>{language === "zh" ? "我的專案" : "My Projects"}</p>
        </div>

        <div className="projects-topbar-right">
          <button
            type="button"
            className="projects-language-btn"
            onClick={toggleLanguage}
          >
            {language === "zh" ? "EN" : "中文"}
          </button>

          {currentUser && (
            <div className="projects-user-chip">
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
            className="projects-create-btn"
            onClick={() => openCreateModal("personal")}
          >
            {language === "zh" ? "建立專案" : "Create Project"}
          </button>

          <button
            type="button"
            className="projects-logout-btn"
            onClick={handleLogout}
          >
            {language === "zh" ? "登出" : "Logout"}
          </button>
        </div>
      </div>

      <div className="projects-content">
        {loading ? (
          <div className="projects-skeleton-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="project-skeleton-card">
                <div className="project-skeleton-header" />
                <div className="project-skeleton-line short" />
                <div className="project-skeleton-line" />
                <div className="project-skeleton-line" />

                <div className="project-skeleton-footer">
                  <div className="project-skeleton-btn" />
                  <div className="project-skeleton-btn" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {error && (
              <p className="projects-state projects-state--error">{error}</p>
            )}

            {invitations.length > 0 && (
              <div className="projects-section">
                <div className="projects-section-header">
                  <h2>{language === "zh" ? "我的邀請" : "My Invitations"}</h2>
                  <p>
                    {language === "zh"
                      ? "接受後即可加入對方的專案。"
                      : "Accept to join the invited project."}
                  </p>
                </div>

                <div className="projects-invitations">
                  {invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="project-invitation-card"
                    >
                      <div className="project-invitation-card__content">
                        <h3>{invitation.project_name}</h3>
                        <p>
                          {language === "zh" ? "邀請人：" : "Invited by: "}
                          {invitation.inviter_name || "-"}
                        </p>
                        <p>
                          {language === "zh" ? "邀請信箱：" : "Inviter email: "}
                          {invitation.inviter_email || "-"}
                        </p>
                        <small>
                          {language === "zh" ? "狀態：" : "Status: "}
                          {invitation.status}
                        </small>
                      </div>

                      <div className="project-invitation-card__actions">
                        <button
                          type="button"
                          className="invitation-accept-btn"
                          disabled={inviteActionLoadingId === invitation.id}
                          onClick={() => setAcceptTarget(invitation)}
                        >
                          {inviteActionLoadingId === invitation.id
                            ? language === "zh"
                              ? "處理中..."
                              : "Processing..."
                            : language === "zh"
                              ? "接受"
                              : "Accept"}
                        </button>

                        <button
                          type="button"
                          className="invitation-decline-btn"
                          disabled={inviteActionLoadingId === invitation.id}
                          onClick={() => handleDeclineInvitation(invitation.id)}
                        >
                          {language === "zh" ? "拒絕" : "Decline"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="projects-section">
              <div className="projects-section-header">
                <h2>{language === "zh" ? "我的專案" : "My Projects"}</h2>
                <p>
                  {language === "zh"
                    ? "點選專案即可進入專案看板。"
                    : "Click a project to enter the board."}
                </p>
              </div>

              {projects.length === 0 ? (
                <WelcomeOnboarding
                  onCreatePersonal={() => openCreateModal("personal")}
                  onCreateTeam={() => openCreateModal("team")}
                />
              ) : (
                <div className="projects-grid">
                  {projects.map((project) => {
                    const isOwner = currentUser?.id === project.owner_id;

                    return (
                      <div key={project.id} className="project-card">
                        <div className="project-card-header">
                          <h3>{project.name}</h3>
                          <span
                            className={`project-type-badge ${project.type}`}
                          >
                            {project.type === "team"
                              ? language === "zh"
                                ? "團體專案"
                                : "Team Project"
                              : language === "zh"
                                ? "個人專案"
                                : "Personal Project"}
                          </span>
                        </div>

                        <p className="project-card-meta">
                          {language === "zh" ? "專案 ID：" : "Project ID: "}
                          {project.id}
                        </p>

                        <p className="project-card-description">
                          {project.description?.trim()
                            ? project.description
                            : language === "zh"
                              ? "尚未填寫專案描述"
                              : "No project description"}
                        </p>

                        <div className="project-card-info">
                          <span>
                            {language === "zh" ? "建立時間：" : "Created: "}
                            {project.created_at
                              ? new Date(
                                  project.created_at,
                                ).toLocaleDateString()
                              : "-"}
                          </span>
                          <span>
                            {language === "zh" ? "成員數：" : "Members: "}
                            {project.member_count ?? 0}
                          </span>
                        </div>

                        <div className="project-card-actions">
                          <button
                            type="button"
                            className="project-enter-btn"
                            onClick={() => navigate(`/board/${project.id}`)}
                          >
                            {language === "zh" ? "進入專案" : "Enter Project"}
                          </button>

                          {isOwner && (
                            <button
                              type="button"
                              className="project-delete-btn"
                              onClick={() => setDeleteTarget(project)}
                            >
                              {language === "zh"
                                ? "刪除專案"
                                : "Delete Project"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <CreateProjectModal
        open={createOpen}
        initialType={createType}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreateProject}
      />

      <ConfirmModal
        open={logoutModalOpen}
        title={language === "zh" ? "登出帳戶" : "Logout"}
        message={
          language === "zh"
            ? "確定要登出目前帳戶嗎？"
            : "Are you sure you want to log out?"
        }
        confirmText={language === "zh" ? "登出" : "Logout"}
        cancelText={language === "zh" ? "取消" : "Cancel"}
        onConfirm={confirmLogout}
        onCancel={() => setLogoutModalOpen(false)}
      />

      <ConfirmModal
        open={acceptTarget !== null}
        title={language === "zh" ? "加入專案邀請" : "Join Project Invitation"}
        message={
          acceptTarget
            ? language === "zh"
              ? `你即將加入「${acceptTarget.project_name}」，確定要接受這個邀請嗎？`
              : `You are about to join "${acceptTarget.project_name}". Accept this invitation?`
            : ""
        }
        confirmText={language === "zh" ? "確定加入" : "Join"}
        cancelText={language === "zh" ? "取消" : "Cancel"}
        onConfirm={confirmAcceptInvitation}
        onCancel={() => setAcceptTarget(null)}
      />

      <ConfirmModal
        open={deleteTarget !== null}
        title={language === "zh" ? "刪除專案" : "Delete Project"}
        message={
          deleteTarget
            ? language === "zh"
              ? `確定要刪除「${deleteTarget.name}」嗎？刪除後任務、成員與邀請都會一起移除。`
              : `Are you sure you want to delete "${deleteTarget.name}"? Tasks, members, and invitations will also be removed.`
            : ""
        }
        confirmText={language === "zh" ? "刪除" : "Delete"}
        cancelText={language === "zh" ? "取消" : "Cancel"}
        onConfirm={confirmDeleteProject}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  );
}
