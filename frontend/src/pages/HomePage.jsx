import Button from "react-bootstrap/Button";
import { Link } from "react-router";
import { useUser } from "../context/UserContext.jsx";
import "./HomePage.css";

export default function HomePage() {
  const user = useUser();

  return (
    <div className="home-page">
      <h1>No Gaps</h1>
      <p className="lead">
        Rental applications and green card forms ask for every address you lived
        at in the last few years. No Gaps keeps your addresses in one private
        timeline and flags every missing month.
      </p>

      <h2>How to use it</h2>
      <ol>
        <li>Log in. Only you can see your entries.</li>
        <li>
          Open Addresses and add each address you lived at, with its months and
          the landlord contact.
        </li>
        <li>
          Read the gap check. It lists the months of the last 5 years with no
          address and the months with two addresses.
        </li>
        <li>Edit or delete an address to fix its months.</li>
      </ol>

      {user ? (
        <Button as={Link} variant="primary" to="/addresses">
          Open my addresses
        </Button>
      ) : (
        <Button as={Link} variant="primary" to="/login">
          Log in
        </Button>
      )}
    </div>
  );
}

HomePage.propTypes = {};
