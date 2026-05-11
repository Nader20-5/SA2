import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { login as loginService } from "../../services/authService";
import { ROLES } from "../../utils/constants";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);

    try {
      const data = await loginService({ email, password });
      login(data.token, data.user);

      switch (data.user.role) {
        case ROLES.ADMIN:
          navigate("/admin/dashboard", { replace: true });
          break;
        case ROLES.LANDLORD:
          navigate("/landlord/dashboard", { replace: true });
          break;
        case ROLES.TENANT:
          navigate("/", { replace: true });
          break;
        default:
          navigate("/", { replace: true });
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        err.response?.data ||
        "Invalid email or password. Please try again.";
      setError(typeof message === "string" ? message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* ═══════ LEFT BRANDED PANEL ═══════ */}
      <div className="login-brand-panel">
        <div className="brand-content">
          <div className="brand-logo-large">SmartRent</div>
          <p className="brand-tagline">
            The smarter way to manage your rental properties and find your perfect home.
          </p>

          <div className="brand-features">
            <div className="brand-feature">
              <div className="brand-feature-icon">🏠</div>
              <span>Browse thousands of verified properties</span>
            </div>
            <div className="brand-feature">
              <div className="brand-feature-icon">🔒</div>
              <span>Secure and verified landlords</span>
            </div>
            <div className="brand-feature">
              <div className="brand-feature-icon">⚡</div>
              <span>Instant booking and visit scheduling</span>
            </div>
          </div>

          <div className="brand-stats">
            <div className="brand-stat">
              <div className="brand-stat-number">12K+</div>
              <div className="brand-stat-label">Users</div>
            </div>
            <div className="brand-stat">
              <div className="brand-stat-number">3K+</div>
              <div className="brand-stat-label">Properties</div>
            </div>
            <div className="brand-stat">
              <div className="brand-stat-number">98%</div>
              <div className="brand-stat-label">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ RIGHT FORM PANEL ═══════ */}
      <div className="login-form-panel">
        <div className="login-form-wrapper">
          <div className="login-mobile-logo">SMARTRENT</div>

          <h1 className="login-heading">Welcome Back</h1>
          <p className="login-subheading">Please enter your details to sign in.</p>

          {error && (
            <div className="login-error">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="8" fill="#dc2626" />
                <path d="M8 4.5v4M8 10.5v.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon-left">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 6L2 7" />
                  </svg>
                </span>
                <input id="login-email" type="email" className="form-input" placeholder="name@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
              </div>
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label" htmlFor="login-password">Password</label>
                <span className="forgot-link">Forgot Password?</span>
              </div>
              <div className="input-wrapper">
                <span className="input-icon-left">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </span>
                <input id="login-password" type={showPassword ? "text" : "password"}
                  className="form-input input-with-right-icon" placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
                <button type="button" className="input-icon-right"
                  onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={isLoading} id="login-submit-btn">
              {isLoading ? <span className="spinner"></span> : "Sign In"}
            </button>
          </form>

          <div className="divider">
            <span className="divider-line"></span>
            <span className="divider-text">OR</span>
            <span className="divider-line"></span>
          </div>

          <div className="register-link-row">
            Don't have an account?{" "}
            <Link to="/register">Create Account →</Link>
          </div>

          <div className="login-footer">
            <p className="login-footer-copy">© 2026 SmartRent. All rights reserved.</p>
            <div className="login-footer-links">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
