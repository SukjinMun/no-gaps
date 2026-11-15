import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useSearchParams } from "react-router";
import "./LoginPage.css";

export default function LoginPage() {
  const [searchParams] = useSearchParams();

  return (
    <div className="login-page">
      <h1>Log in</h1>
      <p className="text-body-secondary">Only you can see your entries.</p>

      {searchParams.has("failed") && (
        <Alert variant="danger">
          The username or password is incorrect. Try again.
        </Alert>
      )}

      <Form className="login-page-form" method="POST" action="/api/auth/login">
        <Form.Label>
          Username
          <Form.Control
            type="text"
            name="username"
            autoComplete="username"
            required
          />
        </Form.Label>
        <Form.Label>
          Password
          <Form.Control
            type="password"
            name="password"
            autoComplete="current-password"
            required
          />
        </Form.Label>
        <Button variant="primary" type="submit">
          Log in
        </Button>
      </Form>
    </div>
  );
}

LoginPage.propTypes = {};
