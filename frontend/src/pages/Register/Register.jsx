
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";

import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();

    if (!name || !email ||
        !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (name.length > 100) {
      setError("Name must not exceed 100 characters.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (new TextEncoder().encode(formData.password).length > 72) {
      setError("Password is too long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/signup",
        {
          name,
          email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }
      );

      navigate("/login", {
        replace: true,
        state: {
          registrationSuccess: true,
        },
      });
    } catch (err) {
      console.error("Registration error:", err);

      if (err.response?.status === 409) {
        setError("An account with this email already exists.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(
          "Unable to create your account. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <div className="register-brand">🐻 BearsCafe</div>
          <h1>Create Your Account</h1>
          <p>
            Join BearsCafe to explore today's menu
            and share your meal reviews.
          </p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          {error && (
            <p className="register-error" role="alert">
              {error}
            </p>
          )}

          <div className="register-form-group">
            <label htmlFor="register-name">Full Name</label>
            <input
              type="text"
              id="register-name"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              maxLength={100}
              required
              disabled={loading}
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="register-email">Email</label>
            <input
              type="email"
              id="register-email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              maxLength={254}
              required
              disabled={loading}
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="register-password">Password</label>
            <div className="register-password-field">
              <input
                type={showPassword ? "text" : "password"}
                id="register-password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={8}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="register-visibility-button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                disabled={loading}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <small>At least 8 characters.</small>
          </div>

          <div className="register-form-group">
            <label htmlFor="register-confirm-password">
              Confirm Password
            </label>
            <div className="register-password-field">
              <input
                type={
                  showConfirmPassword ? "text" : "password"
                }
                id="register-confirm-password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="register-visibility-button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide confirmation password"
                    : "Show confirmation password"
                }
                disabled={loading}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;