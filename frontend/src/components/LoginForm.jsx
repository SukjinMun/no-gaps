import { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { logIn } from "../api/authApi.js";
import "./LoginForm.css";

export default function LoginForm({ notice, onLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSending(true);
    setError("");
    try {
      const user = await logIn(username.trim(), password);
      onLoggedIn(user);
    } catch (loginError) {
      setError(loginError.message);
      setSending(false);
    }
  }

  return (
    <main className="register">
      <div className="register__intro">
        <h1>Log in</h1>
        <p>See your addresses, jobs and schools, and any months missing from them.</p>
      </div>

      <form className="register__card" onSubmit={handleSubmit}>
        {notice && !error && (
          <p role="status" className="register__notice">
            {notice}
          </p>
        )}
        {error && (
          <p role="alert" className="register__alert">
            {error}
          </p>
        )}

        <div className="register__field">
          <label htmlFor="login-username">Username</label>
          <input
            id="login-username"
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="register__field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="register__submit" disabled={sending}>
          {sending ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="register__login">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </main>
  );
}

LoginForm.propTypes = {
  notice: PropTypes.string,
  onLoggedIn: PropTypes.func.isRequired,
};
