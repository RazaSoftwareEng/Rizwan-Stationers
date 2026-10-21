import { useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useSeo } from "../seo.js";
import { login, getSession, rememberedEmail } from "./auth.js";
import { AdminIcon } from "./ui.jsx";
import "./admin.css";

export default function AdminLogin() {
  useSeo({ title: "Admin sign in", description: "Rizwan Stationer admin sign in.", noindex: true });
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next")?.startsWith("/admin") ? params.get("next") : "/admin";
  const [email, setEmail] = useState(rememberedEmail);
  const [remember, setRemember] = useState(() => !!rememberedEmail());
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (getSession()) return <Navigate to={next} replace />;

  async function onSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Enter your username and password.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await login(email, password, remember);
      navigate(next, { replace: true });
    } catch (err) {
      setBusy(false);
      setError(
        err instanceof TypeError
          ? "Can't reach the server. Check that the API is running."
          : err.status === 401
          ? "That username and password don't match an admin account."
          : err.message,
      );
    }
  }

  return (
    <div className="adm-login">
      <form className="adm-login__card" onSubmit={onSubmit} method="post" action="/admin-login" noValidate>
        <img src="/seal.png" alt="" width="64" height="64" />
        <h1>Admin sign in</h1>
        <p className="adm-muted">Rizwan Stationer dashboard</p>

        {error && (
          <div className="adm-note adm-note--bad" role="alert">
            <AdminIcon name="alert" />
            <span>{error}</span>
          </div>
        )}

        <label className="adm-field">
          <span>Username or email</span>
          <input
            className="adm-input"
            type="text"
            name="username"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Username or email"
            autoFocus={!email}
          />
        </label>
        <label className="adm-field">
          <span>Password</span>
          <span className="adm-pass">
            <input
              className="adm-input"
              type={show ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"}>
              {show ? "Hide" : "Show"}
            </button>
          </span>
        </label>

        <label className="adm-remember">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <span>
            Remember me
            <small>Stay signed in on this device</small>
          </span>
        </label>

        <button type="submit" className="adm-btn adm-btn--primary adm-login__submit" disabled={busy}>
          <AdminIcon name="lock" />
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <a href="/" className="adm-link adm-login__back">
          ← Back to the store
        </a>
      </form>
    </div>
  );
}
