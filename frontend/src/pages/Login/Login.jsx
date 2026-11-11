import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axios";

import "./Login.css";

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const registrationSuccess =
    location.state?.registrationSuccess === true;

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login",
        {
          email: email.trim(),
          password,
        }
      );

      const {
        token,
        userId,
        name,
        email: userEmail,
        role,
      } = response.data;

      const validRoles = ["STUDENT", "STAFF", "ADMIN"];

      if (!token || !validRoles.includes(role)) {
        setError(
          "Your account does not have valid login credentials."
        );
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("userId", String(userId ?? ""));
      localStorage.setItem("name", name ?? "");
      localStorage.setItem("email", userEmail ?? "");
      localStorage.setItem("role", role);

      if (onLoginSuccess) {
        onLoginSuccess();
      }

      if (role === "STUDENT") {
        navigate("/meals", { replace: true });
      } else {
        navigate("/staff-dashboard", { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error.response?.status === 401) {
        setError("Invalid email or password.");
      } else if (error.response?.status === 403) {
        setError("Your account is disabled.");
      } else {
        setError(
          "Unable to connect to the server. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-brand">
            🐻 BearsCafe
          </div>
          <h1>Welcome Back!</h1>
          <p>Sign in to access the cafeteria's menu.</p>
        </div>

        {registrationSuccess && (
          <p className="login-success" role="status">
            Your student account was created successfully!
            You can now log in.
          </p>
        )}

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >
          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              autoComplete="current-password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;