import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaHeart,
  FaRegHeart,
  FaTrashAlt,
  FaHome,
} from "react-icons/fa";
import PropertyCard from "../../components/common/PropertyCard";
import { getFavorites, removeFavorite } from "../../services/favoriteService";

const Favorites = () => {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const data = await getFavorites();
      setProperties((data || []).map(f => ({
        ...f,
        id: f.propertyId,
        title: f.propertyTitle,
        monthlyRent: f.monthlyRent,
        city: f.city,
        mainImageUrl: f.mainImageUrl,
        isAvailable: f.isAvailable,
        bedrooms: f.bedrooms,
        bathrooms: f.bathrooms,
        areaSqm: f.areaSqm,
        type: f.type
      })));
    } catch (err) {
      console.error("Failed to load favorites:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleFavoriteToggle = async (id, newState) => {
    if (!newState) {
      try {
        await removeFavorite(id);
        setProperties((prev) => prev.filter((p) => p.id !== id));
      } catch (err) {
        console.error("Failed to remove favorite:", err);
      }
    }
  };

  const clearAllFavorites = async () => {
    try {
      await Promise.all(properties.map((p) => removeFavorite(p.id)));
      setProperties([]);
    } catch (err) {
      console.error("Failed to clear favorites:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="loading-state" style={{ padding: "8rem 0", textAlign: "center" }}>
            <div className="spinner" style={{ width: 40, height: 40, margin: "0 auto 1rem" }} />
            <p style={{ color: "var(--color-text-muted)" }}>Loading your favorites...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* ── Header ── */}
        <div className="favorites-header">
          <div className="favorites-header-top">
            <div>
              <h1 className="favorites-title">
                <FaHeart className="favorites-title-icon" /> My Favorites
              </h1>
              <p className="favorites-subtitle">
                Properties you've saved for later
              </p>
            </div>
            {properties.length > 0 && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={clearAllFavorites}
                id="clear-favorites-btn"
              >
                <FaTrashAlt /> Clear All
              </button>
            )}
          </div>
          <div className="favorites-count">
            <span className="favorites-count-number">
              {properties.length}
            </span>
            <span className="favorites-count-label">
              {properties.length === 1
                ? "saved property"
                : "saved properties"}
            </span>
          </div>
        </div>

        {/* ── Grid or Empty State ── */}
        {properties.length > 0 ? (
          <div className="property-grid" id="favorites-grid">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={{ ...property, isFavorite: true }}
                variant="tenant"
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state" id="favorites-empty-state">
            <div className="empty-state-icon-wrapper">
              <FaRegHeart className="empty-state-icon" />
            </div>
            <h3 className="empty-state-title">No Favorites Yet</h3>
            <p className="empty-state-text">
              You haven't saved any properties to your favorites yet. Browse our
              listings and tap the heart icon on any property you love.
            </p>
            <Link to="/" className="btn btn-primary btn-lg" id="browse-btn">
              <FaHome /> Browse Properties
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
