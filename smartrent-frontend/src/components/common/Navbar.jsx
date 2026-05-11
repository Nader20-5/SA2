import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { ROLES } from "../../utils/constants";

import {
  FaBuilding,
  FaHeart,
  FaSignInAlt,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUserCircle,
  FaChartLine,
  FaMoon,
  FaSun,
} from "react-icons/fa";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  // Destructure 'token' from useAuth here
  const { user, isAuthenticated, logout, token } = useAuth(); 
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const hiddenPaths = ["/login", "/register", "/admin/dashboard", "/landlord/dashboard"];
  const isDashboardPage = location.pathname.startsWith("/landlord") || location.pathname.startsWith("/admin");
  if (hiddenPaths.includes(location.pathname) || (isDashboardPage && isAuthenticated)) return null;

  const handleLogout = () => {
    logout();
  };

  return (
    <header
      className={`navbar ${isScrolled ? "navbar-scrolled" : ""}`}
      id="navbar"
    >
      <div className="navbar-inner container">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <FaBuilding className="navbar-brand-icon" />
          <span className="navbar-brand-text">SmartRent</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="navbar-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `navbar-link ${isActive ? "is-active" : ""}`
            }
          >
            Browse
          </NavLink>
          {isAuthenticated && (
            <NavLink
              to="/favorites"
              className={({ isActive }) =>
                `navbar-link ${isActive ? "is-active" : ""}`
              }
            >
              <FaHeart className="navbar-link-icon" /> Favorites
            </NavLink>
          )}
                    {isAuthenticated && user?.role === ROLES.TENANT && (
            <NavLink
              to="/my-journey"
              className={({ isActive }) =>
                `navbar-link ${isActive ? "is-active" : ""}`
              }
            >
              <FaChartLine className="navbar-link-icon" /> My Journey
            </NavLink>
          )}
          {isAuthenticated && user?.role === ROLES.LANDLORD && (

            <NavLink
              to="/landlord/dashboard"
              className={({ isActive }) =>
                `navbar-link ${isActive ? "is-active" : ""}`
              }
            >
              <FaChartLine className="navbar-link-icon" /> Dashboard
            </NavLink>
          )}
          {isAuthenticated && user?.role === ROLES.ADMIN && (
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `navbar-link ${isActive ? "is-active" : ""}`
              }
            >
              <FaChartLine className="navbar-link-icon" /> Admin Panel
            </NavLink>
          )}
        </nav>

        {/* Right actions */}
        <div className="navbar-actions">
          {/* Theme Toggle */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            id="theme-toggle"
          >
            <span className={`theme-toggle-track ${isDark ? "is-dark" : "is-light"}`}>
              <FaSun className="theme-toggle-sun" />
              <FaMoon className="theme-toggle-moon" />
              <span className="theme-toggle-thumb" />
            </span>
          </button>

          {isAuthenticated ? (
            <>

              <div className="navbar-user-info">
                <FaUserCircle className="navbar-user-avatar" />
                <Link to="/profile" className="navbar-user-name" style={{ textDecoration: 'none', color: 'inherit' }}>
                  {user?.fullName}
                </Link>
                <span className="navbar-user-role">{user?.role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm navbar-logout-btn"
                id="logout-btn"
              >
                <FaSignOutAlt /> Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm navbar-auth-btn">
              <FaSignInAlt /> Sign In
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="navbar-mobile-toggle"
          onClick={() => setIsMobileOpen((v) => !v)}
          aria-label="Toggle navigation"
          id="navbar-mobile-toggle"
        >
          {isMobileOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="navbar-mobile-menu" id="navbar-mobile-menu">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `navbar-mobile-link ${isActive ? "is-active" : ""}`
            }
          >
            Browse
          </NavLink>
          {isAuthenticated && (
            <NavLink
              to="/favorites"
              className={({ isActive }) =>
                `navbar-mobile-link ${isActive ? "is-active" : ""}`
              }
            >
              <FaHeart /> Favorites
            </NavLink>
          )}
          {isAuthenticated && user?.role === ROLES.TENANT && (
            <NavLink
              to="/my-journey"
              className={({ isActive }) =>
                `navbar-mobile-link ${isActive ? "is-active" : ""}`
              }
            >
              <FaChartLine /> My Journey
            </NavLink>
          )}
          {isAuthenticated && user?.role === ROLES.LANDLORD && (
            <NavLink
              to="/landlord/dashboard"
              className={({ isActive }) =>
                `navbar-mobile-link ${isActive ? "is-active" : ""}`
              }
            >
              <FaChartLine /> Dashboard
            </NavLink>
          )}
          {isAuthenticated && user?.role === ROLES.ADMIN && (
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `navbar-mobile-link ${isActive ? "is-active" : ""}`
              }
            >
              <FaChartLine /> Admin Panel
            </NavLink>
          )}

          <div className="navbar-mobile-bottom">
            <button className="navbar-mobile-link" onClick={toggleTheme}>
              {isDark ? <FaSun /> : <FaMoon />}
              {isDark ? "Light Mode" : "Dark Mode"}
            </button>
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="btn btn-secondary navbar-mobile-auth-btn"
              >
                <FaSignOutAlt /> Logout ({user?.fullName})
              </button>
            ) : (
              <Link to="/login" className="btn btn-primary navbar-mobile-auth-btn">
                <FaSignInAlt /> Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;