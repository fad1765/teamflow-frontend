import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import "../styles/login.css";

const initialLoginForm = {
  email: "",
  password: "",
};

const initialRegisterForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function Login() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [mode, setMode] = useState("login");
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isLoginMode = useMemo(() => mode === "login", [mode]);

  const handleSwitchMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setSuccessMessage("");
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;

    setLoginForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccessMessage("");
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;

    setRegisterForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccessMessage("");
  };

  // ✅ 修正：登入後導向 /projects
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      setSubmitting(true);

      const res = await api.post("/auth/login", loginForm);

      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      showToast("登入成功", "success");
      // 🔥 這裡是關鍵
      navigate("/projects");
    } catch (err) {
      const message = err.response?.data?.detail || "登入失敗";
      setError(message);
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!registerForm.name.trim()) {
      setError("請輸入姓名");
      return;
    }

    if (!registerForm.email.trim()) {
      setError("請輸入 Email");
      return;
    }

    if (!registerForm.password.trim()) {
      setError("請輸入密碼");
      return;
    }

    if (registerForm.password.length < 6) {
      setError("密碼至少需要 6 個字元");
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setError("兩次輸入的密碼不一致");
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/auth/register", {
        name: registerForm.name.trim(),
        email: registerForm.email.trim(),
        password: registerForm.password,
      });

      setSuccessMessage("註冊成功，請登入");
      showToast("註冊成功，請登入", "success");
      setRegisterForm(initialRegisterForm);
      setMode("login");

      setLoginForm((prev) => ({
        ...prev,
        email: registerForm.email.trim(),
      }));
    } catch (err) {
      const message = err.response?.data?.detail || "註冊失敗";
      setError(message);
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <h1>TeamFlow</h1>
          <p>Meeting-driven Project Board</p>
        </div>

        <div className="login-mode-switch">
          <button
            type="button"
            className={`login-mode-btn ${isLoginMode ? "active" : ""}`}
            onClick={() => handleSwitchMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={`login-mode-btn ${!isLoginMode ? "active" : ""}`}
            onClick={() => handleSwitchMode("register")}
          >
            Register
          </button>
        </div>

        {isLoginMode ? (
          <form onSubmit={handleLoginSubmit} className="login-form">
            <input
              type="email"
              name="email"
              placeholder="Email"
              autoComplete="email"
              value={loginForm.email}
              onChange={handleLoginChange}
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              autoComplete="current-password"
              value={loginForm.password}
              onChange={handleLoginChange}
            />

            {error && <p className="error">{error}</p>}
            {successMessage && <p className="success">{successMessage}</p>}

            <button type="submit" disabled={submitting}>
              {submitting ? "Signing in..." : "Login"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="login-form">
            <input
              type="text"
              name="name"
              placeholder="Name"
              autoComplete="name"
              value={registerForm.name}
              onChange={handleRegisterChange}
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              autoComplete="email"
              value={registerForm.email}
              onChange={handleRegisterChange}
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              autoComplete="new-password"
              value={registerForm.password}
              onChange={handleRegisterChange}
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              autoComplete="new-password"
              value={registerForm.confirmPassword}
              onChange={handleRegisterChange}
            />

            {error && <p className="error">{error}</p>}
            {successMessage && <p className="success">{successMessage}</p>}

            <button type="submit" disabled={submitting}>
              {submitting ? "Creating account..." : "Register"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
