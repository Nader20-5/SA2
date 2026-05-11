import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaBuilding,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaArrowUp,
} from "react-icons/fa";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="footer" id="footer">
      {/* Decorative top border */}
      <div className="footer-accent-line" />

      <div className="container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand">
            <div className="footer-brand-logo">
              <FaBuilding className="footer-brand-icon" />
              <span>Prophoria</span>
            </div>
            <p className="footer-text">
              The premier platform for discovering high-end real estate and
              modern living spaces tailored to your sophisticated lifestyle.
            </p>
            <div className="footer-socials">
              <a href="#" aria-label="Facebook" className="footer-social-link">
                <FaFacebook />
              </a>
              <a href="#" aria-label="Twitter" className="footer-social-link">
                <FaTwitter />
              </a>
              <a href="#" aria-label="Instagram" className="footer-social-link">
                <FaInstagram />
              </a>
              <a href="#" aria-label="LinkedIn" className="footer-social-link">
                <FaLinkedin />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-column">
            <h3 className="footer-title">Platform</h3>
            <ul className="footer-links">
              <li>
                <Link to="/">Browse Properties</Link>
              </li>
              <li>
                <Link to="/favorites">My Favorites</Link>
              </li>
              <li>
                <Link to="/login">Landlord Login</Link>
              </li>
              <li>
                <Link to="/register">Create Account</Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-column">
            <h3 className="footer-title">Company</h3>
            <ul className="footer-links">
              <li>
                <a href="#">About Us</a>
              </li>
              <li>
                <a href="#">Help Center</a>
              </li>
              <li>
                <a href="#">Terms of Service</a>
              </li>
              <li>
                <a href="#">Privacy Policy</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-column">
            <h3 className="footer-title">Contact</h3>
            <ul className="footer-contact-list">
              <li>
                <FaMapMarkerAlt className="footer-contact-icon" />
                <span>Cairo, Egypt</span>
              </li>
              <li>
                <FaEnvelope className="footer-contact-icon" />
                <a href="mailto:support@prophoria.com">support@prophoria.com</a>
              </li>
              <li>
                <FaPhoneAlt className="footer-contact-icon" />
                <a href="tel:+201000000000">+20 100 000 0000</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} Prophoria (SmartRent). All rights
            reserved.
          </p>
          <button
            className="footer-back-to-top"
            onClick={scrollToTop}
            aria-label="Back to top"
          >
            <FaArrowUp /> Back to Top
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
