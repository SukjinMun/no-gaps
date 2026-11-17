import { useState } from "react";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import logoMark from "../assets/logo-mark.svg";
import "./NavBar.css";

export default function NavBar({ username, onLogOut }) {
  const [leaving, setLeaving] = useState(false);

  async function handleLogOut() {
    setLeaving(true);
    try {
      await onLogOut();
    } finally {
      setLeaving(false);
    }
  }

  return (
    <header className="navbar">
      <nav aria-label="Main" className="navbar__inner">
        <NavLink to="/" className="navbar__brand">
          <img src={logoMark} alt="No Gaps logo" className="navbar__logo" width="32" height="32" />
          No Gaps
        </NavLink>

        {username ? (
          <>
            <div className="navbar__links">
              <NavLink to="/addresses">Addresses</NavLink>
              <NavLink to="/activities">Jobs &amp; Schools</NavLink>
            </div>
            <div className="navbar__user">
              <span>Signed in as {username}</span>
              <button
                type="button"
                className="navbar__logout"
                onClick={handleLogOut}
                disabled={leaving}
              >
                {leaving ? "Logging out…" : "Log out"}
              </button>
            </div>
          </>
        ) : (
          <div className="navbar__links navbar__links--end">
            <NavLink to="/login">Log in</NavLink>
            <NavLink to="/register">Create account</NavLink>
          </div>
        )}
      </nav>
    </header>
  );
}

NavBar.propTypes = {
  username: PropTypes.string,
  onLogOut: PropTypes.func.isRequired,
};
