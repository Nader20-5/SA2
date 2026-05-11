import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHeart,
  FaRegHeart,
  FaMapMarkerAlt,
  FaParking,
  FaSwimmingPool,
  FaCouch,
  FaStar,
  FaEdit,
  FaTrashAlt,
  FaBed,
  FaBath,
  FaRulerCombined,
} from "react-icons/fa";
import { MdElevator } from "react-icons/md";
import { getImageUrl } from "../../utils/constants";

const AMENITY_CONFIG = [
  { key: "hasParking", label: "Parking", icon: FaParking },
  { key: "hasElevator", label: "Elevator", icon: MdElevator },
  { key: "isFurnished", label: "Furnished", icon: FaCouch },
  { key: "hasPool", label: "Pool", icon: FaSwimmingPool },
];



const formatPrice = (price) => {
  return `$${price.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}/mo`;
};

const PropertyCard = ({
  property,
  variant = "tenant",
  onFavoriteToggle,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [isFav, setIsFav] = useState(property.isFavorite);

  const mainImage = property.mainImageUrl || property.imageUrls?.[0];

  // Map backend amenities (List of strings) to local config
  const activeAmenities = AMENITY_CONFIG.filter(
    (a) => property.amenities?.includes(a.key.toUpperCase()) || property.amenities?.includes(a.key)
  );

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFav((prev) => !prev);
    onFavoriteToggle?.(property.id, !isFav);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(property.id);
    } else {
      navigate(`/landlord/properties/edit/${property.id}`);
    }
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(property.id);
  };

  const [isAnimate, setIsAnimate] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsAnimate(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Link
      to={`/property/${property.id}`}
      className={`property-card ${isAnimate ? "animate-in" : ""}`}
      id={`property-card-${property.id}`}
    >
      {/* ── Image Section ── */}
      <div className="property-card-image-wrapper">
        {mainImage ? (
          <img
            src={getImageUrl(mainImage)}
            alt={property.title}
            className="property-card-image"
            loading="lazy"
          />
        ) : (
          <div className="property-card-image property-card-image-placeholder">
            <FaHeart style={{ fontSize: '2rem', opacity: 0.2 }} />
          </div>
        )}

        {/* Gradient overlay for text readability */}
        <div className="property-card-image-overlay" />

        {/* Premium Top Tags */}
        <div className="property-card-tags">
          {/* Rental Status */}
          <span
            className={`property-card-tag ${
              property.isAvailable ? "tag-success" : "tag-info"
            }`}
          >
            {property.isAvailable && <span className="status-dot"></span>}
            {property.isAvailable ? "Available" : "Unavailable"}
          </span>

          {/* Admin Approval Status */}
          {variant === "landlord" && (
            <span
              className={`property-card-tag ${
                property.status === "APPROVED"
                  ? "tag-success"
                  : property.status === "REJECTED"
                  ? "tag-error"
                  : "tag-warning"
              }`}
            >
              {property.status}
            </span>
          )}
        </div>

        {/* Tenant: heart button */}
        {variant === "tenant" && (
          <button
            className={`property-card-favorite ${isFav ? "is-active" : ""}`}
            onClick={handleFavoriteClick}
            aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
            id={`favorite-btn-${property.id}`}
          >
            {isFav ? <FaHeart /> : <FaRegHeart />}
          </button>
        )}

        {/* Rating overlay */}
        {property.averageRating > 0 && (
          <div className="property-card-rating">
            <FaStar className="property-card-star-icon" />
            <span>{property.averageRating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* ── Content Section ── */}
      <div className="property-card-content">
        <div className="property-card-header">
          <h3 className="property-card-title">{property.title}</h3>
          <span className="property-card-type">{property.type}</span>
        </div>

        <p className="property-card-price">{formatPrice(property.monthlyRent || 0)}</p>

        <p className="property-card-location">
          <FaMapMarkerAlt className="property-card-pin-icon" />
          <span>{property.city}{property.district ? `, ${property.district}` : ''}</span>
        </p>

        <div className="property-card-specs">
          <span className="property-card-spec">
            <FaBed className="property-card-spec-icon" />
            <span>{property.bedrooms || 0} Bed</span>
          </span>
          <span className="property-card-spec">
            <FaBath className="property-card-spec-icon" />
            <span>{property.bathrooms || 0} Bath</span>
          </span>
          <span className="property-card-spec">
            <FaRulerCombined className="property-card-spec-icon" />
            <span>{property.areaSqm || 0} m²</span>
          </span>
        </div>

        {/* Amenity row — only render amenities with value true */}
        {activeAmenities.length > 0 && (
          <div className="property-card-amenities">
            {activeAmenities.map(({ key, label, icon: Icon }) => (
              <span key={key} className="property-card-amenity">
                <Icon className="property-card-amenity-icon" />
                <span>{label}</span>
              </span>
            ))}
          </div>
        )}

        {/* Landlord variant: action buttons only. Status handled overhead. */}
        {variant === "landlord" && (
          <div className="property-card-actions">
            <div></div> {/* spacer to push buttons right */}
            <div className="property-card-action-buttons">
              <button
                className="property-card-action-btn action-edit"
                onClick={handleEdit}
                aria-label="Edit property"
                id={`edit-btn-${property.id}`}
              >
                <FaEdit />
              </button>
              <button
                className="property-card-action-btn action-delete"
                onClick={handleDelete}
                aria-label="Delete property"
                id={`delete-btn-${property.id}`}
              >
                <FaTrashAlt />
              </button>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

export default PropertyCard;
