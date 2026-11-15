import { useId } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link, NavLink } from "react-router";
import { useUser } from "../context/UserContext.jsx";
import "./NavigationBar.css";

export default function NavigationBar() {
  const user = useUser();
  const linksId = useId();

  return (
    <Navbar
      expand="md"
      bg="dark"
      data-bs-theme="dark"
      className="navigation-bar"
    >
      <Container>
        <Navbar.Brand as={Link} to="/">
          No Gaps
        </Navbar.Brand>
        <Navbar.Toggle aria-controls={linksId} />
        <Navbar.Collapse id={linksId}>
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end>
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/addresses">
              Addresses
            </Nav.Link>
          </Nav>
          {user ? (
            <>
              <Navbar.Text className="me-3">
                Signed in as {user.username}
              </Navbar.Text>
              <Button variant="outline-light" size="sm" href="/api/auth/logout">
                Log out
              </Button>
            </>
          ) : (
            <Button as={Link} variant="outline-light" size="sm" to="/login">
              Log in
            </Button>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

NavigationBar.propTypes = {};
