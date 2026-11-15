import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { UserContext } from "../context/UserContext.jsx";
import NavigationBar from "../components/NavigationBar.jsx";
import "./BaseTemplate.css";

export default function BaseTemplate({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/user");
        setUser(res.ok ? (await res.json()).user : null);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={user}>
      <NavigationBar />
      <main>{children}</main>
    </UserContext.Provider>
  );
}

BaseTemplate.propTypes = {
  children: PropTypes.node.isRequired,
};
