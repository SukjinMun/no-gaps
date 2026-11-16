import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import Footer from "./components/Footer.jsx";
import LoginForm from "./components/LoginForm.jsx";
import RegisterForm from "./components/RegisterForm.jsx";
import ActivitiesPage from "./pages/ActivitiesPage.jsx";
import AddressesPage from "./pages/AddressesPage.jsx";
import AddressFormPage from "./pages/AddressFormPage.jsx";
import { getMe, logOut } from "./api/authApi.js";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Ask the server once whether this browser already has a session.
  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  async function handleLogOut() {
    await logOut();
    setUser(null);
    navigate("/login");
  }

  if (checking) {
    return <p className="app__loading">Loading…</p>;
  }

  // Pages that need a login send visitors to /login instead.
  const loggedIn = (page) => (user ? page : <Navigate to="/login" replace />);

  return (
    <>
      <NavBar username={user?.username} onLogOut={handleLogOut} />
      <Routes>
        <Route path="/" element={<Navigate to={user ? "/activities" : "/login"} replace />} />
        <Route path="/activities" element={loggedIn(<ActivitiesPage />)} />
        <Route path="/addresses" element={loggedIn(<AddressesPage />)} />
        <Route path="/addresses/new" element={loggedIn(<AddressFormPage />)} />
        <Route path="/addresses/:id/edit" element={loggedIn(<AddressFormPage />)} />
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/activities" replace />
            ) : (
              <LoginForm
                notice={location.state?.notice}
                onLoggedIn={(loggedInUser) => {
                  setUser(loggedInUser);
                  navigate("/activities");
                }}
              />
            )
          }
        />
        <Route
          path="/register"
          element={
            <RegisterForm
              onRegistered={() =>
                navigate("/login", { state: { notice: "Account created. Log in to start." } })
              }
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  );
}

// App takes no props: it reads the session from the server.
App.propTypes = {};
