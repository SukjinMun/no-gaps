import { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { registerUser } from "../api/authApi.js";
import "./RegisterForm.css";

export default function RegisterForm({ onRegistered }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (password !== confirm) {
      setErrors({ confirm: "Passwords don't match." });
      return;
    }
    setSaving(true);
    setErrors({});
    try {
      const user = await registerUser(username.trim(), password);
      onRegistered(user.username);
    } catch (error) {
      setErrors(error.errors ?? { form: error.message });
      setSaving(false);
    }
  }

  return (
    <main className="register">
      <div className="register__intro">
        <h1>Create your account</h1>
        <p>
          Keep your past addresses, jobs and schools in one place. Only you can see your entries.
        </p>
      </div>

      <form className="register__card" onSubmit={handleSubmit} noValidate>
        {errors.form && (
          <p role="alert" className="register__alert">
            {errors.form}
          </p>
        )}

        <div className="register__field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            aria-invalid={Boolean(errors.username)}
            aria-describedby={errors.username ? "username-error" : undefined}
          />
          {errors.username && (
            <span id="username-error" className="register__error">
              {errors.username}
            </span>
          )}
        </div>

        <div className="register__field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(errors.password)}
            aria-describedby="password-hint"
          />
          <span
            id="password-hint"
            className={errors.password ? "register__error" : "register__hint"}
          >
            {errors.password ?? "At least 8 characters."}
          </span>
        </div>

        <div className="register__field">
          <label htmlFor="confirm">Confirm password</label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            aria-invalid={Boolean(errors.confirm)}
            aria-describedby={errors.confirm ? "confirm-error" : undefined}
          />
          {errors.confirm && (
            <span id="confirm-error" className="register__error">
              {errors.confirm}
            </span>
          )}
        </div>

        <button type="submit" className="register__submit" disabled={saving}>
          {saving ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="register__login">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </main>
  );
}

RegisterForm.propTypes = {
  onRegistered: PropTypes.func.isRequired,
};
