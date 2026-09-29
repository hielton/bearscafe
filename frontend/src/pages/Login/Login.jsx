import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          email: email,
          password: password,
        }
      );

      const {
        token,
        userId,
        name,
        email: userEmail,
        role,
      } = response.data;

      // Save authentication information.
      localStorage.setItem(
        "token",
        token
      );

      localStorage.setItem(
        "userId",
        userId
      );

      localStorage.setItem(
        "name",
        name
      );

      localStorage.setItem(
        "email",
        userEmail
      );

      localStorage.setItem(
        "role",
        role
      );

      // Redirect based on role.
      if (role === "STUDENT") {
        navigate("/meals");
      } else if (
        role === "STAFF" ||
        role === "ADMIN"
      ) {
        navigate("/staff-dashboard");
      } else {
        setError(
          "Your account does not have a valid role."
        );
      }
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      if (
        error.response?.status === 401
      ) {
        setError(
          "Invalid email or password."
        );
      } else if (
        error.response?.status === 403
      ) {
        setError(
          "Your account is disabled."
        );
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
          <h1>Welcome Back!</h1>

          <p>
            Sign in to access the cafeteria's menu.
          </p>
        </div>

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >

          {error && (
            <p className="login-error">
              {error}
            </p>
          )}

          <div className="form-group">
            <label htmlFor="email">
              Email
            </label>

            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        <div className="login-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/register">
              Create an account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;