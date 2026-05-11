import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaCheckCircle,
  FaStar,
  FaArrowLeft,
  FaHeart,
  FaRegHeart,
  FaShare,
  FaCar,
  FaBuilding,
  FaCouch,
  FaSwimmingPool,
  FaStarHalfAlt,
  FaRegStar,
  FaParking,
  FaPhoneAlt,
  FaCalendarAlt,
  FaFileSignature,
  FaChevronLeft,
  FaEdit,
  FaTrashAlt,
} from "react-icons/fa";
import { MdElevator, MdVerified } from "react-icons/md";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { getPropertyById } from "../../services/propertyService";
import * as reviewService from "../../services/reviewService";
import * as favoriteService from "../../services/favoriteService";
import { getImageUrl } from "../../utils/constants";

const AMENITY_CONFIG = [
  { key: "PARKING", label: "Parking", icon: FaParking },
  { key: "ELEVATOR", label: "Elevator", icon: MdElevator },
  { key: "FURNISHED", label: "Furnished", icon: FaCouch },
  { key: "POOL", label: "Pool", icon: FaSwimmingPool },
  { key: "GYM", label: "Gym", icon: FaBuilding },
  { key: "SECURITY", label: "Security", icon: FaCheckCircle },
  { key: "GARDEN", label: "Garden", icon: FaCouch },
  { key: "BALCONY", label: "Balcony", icon: FaBuilding },
  { key: "AIR_CONDITIONING", label: "AC", icon: FaCouch },
  { key: "CENTRAL_HEATING", label: "Heating", icon: FaCouch },
];


const formatPrice = (price) =>
  `${(price || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} EGP`;

const renderStars = (score, onClick) => {
  const stars = [];
  const s = score || 0;
  const fullStars = Math.floor(s);
  const hasHalf = s - fullStars >= 0.25 && s - fullStars < 0.75;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  for (let i = 0; i < fullStars; i++) 
    stars.push(<FaStar key={`full-${i}`} className="star-icon star-filled" onClick={() => onClick?.(i + 1)} style={{ cursor: onClick ? "pointer" : "default" }} />);
  if (hasHalf) 
    stars.push(<FaStarHalfAlt key="half" className="star-icon star-filled" />);
  for (let i = 0; i < emptyStars; i++) 
    stars.push(<FaRegStar key={`empty-${i}`} className="star-icon star-empty" onClick={() => onClick?.(fullStars + (hasHalf ? 1 : 0) + i + 1)} style={{ cursor: onClick ? "pointer" : "default" }} />);
  return stars;
};

const PropertyDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Review form state
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [editingReviewId, setEditingReviewId] = useState(null);

  const fetchData = async () => {
    try {
      const [propertyData, reviewsData] = await Promise.all([
        getPropertyById(id),
        reviewService.getPropertyReviews(id)
      ]);
      console.log("Property Data:", propertyData);
      console.log("Reviews Data:", reviewsData);
      
      setProperty(propertyData);
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);

      if (user) {
        try {
          const favStatus = await favoriteService.isFavorited(id);
          console.log("Favorite Status:", favStatus);
          setIsFavorite(!!favStatus);
        } catch (e) {
          console.error("Failed to check favorite status:", e);
        }
      }
    } catch (err) {
      console.error("Error fetching property details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, user]);

  const handleFavoriteToggle = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      if (isFavorite) {
        await favoriteService.removeFavorite(id);
        setIsFavorite(false);
        toast.info("Removed from favorites");
      } else {
        await favoriteService.addFavorite(id);
        setIsFavorite(true);
        toast.success("Added to favorites!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update favorites");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }

    setIsSubmittingReview(true);
    try {
      if (editingReviewId) {
        await reviewService.updateReview(editingReviewId, { rating: reviewRating, comment: reviewComment });
        toast.success("Review updated!");
      } else {
        await reviewService.createReview(id, { rating: reviewRating, comment: reviewComment });
        toast.success("Review posted!");
      }
      setReviewComment("");
      setReviewRating(5);
      setEditingReviewId(null);
      // Refresh reviews and property (to get updated avg rating)
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReviewId(review.id);
    setReviewRating(review.rating);
    setReviewComment(review.comment);
    document.getElementById("review-form").scrollIntoView({ behavior: "smooth" });
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete your review?")) return;

    try {
      await reviewService.deleteReview(reviewId);
      toast.success("Review deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete review");
    }
  };

  if (isLoading) {
    return (
      <div className="page-wrapper container">
        <div className="loading-state" style={{ padding: "8rem 0", textAlign: "center" }}>
          <div className="spinner" style={{ width: 40, height: 40, margin: "0 auto 1rem" }} />
          <p style={{ color: "var(--color-text-muted)" }}>Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="page-wrapper container">
        <div className="empty-state">
          <h3 className="empty-state-title">Property Not Found</h3>
          <p className="empty-state-text">
            The property you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/" className="btn btn-primary btn-lg">
            <FaChevronLeft /> Back to Listings
          </Link>
        </div>
      </div>
    );
  }

  const imageUrls = (property.imageUrls || []).map(getImageUrl).filter(Boolean);
  const currentImage = imageUrls[activeImageIndex] || getImageUrl(property.mainImageUrl);
  const location = [property.city, property.district].filter(Boolean).join(", ");
  const amenities = property.amenities || [];
  const activeAmenities = AMENITY_CONFIG.filter((a) => amenities.includes(a.key));

  const userReview = Array.isArray(reviews) ? reviews.find(r => String(r.tenantId) === String(user?.id)) : null;

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* ── Breadcrumb ── */}
        <nav className="detail-breadcrumb" id="detail-breadcrumb">
          <Link to="/" className="detail-breadcrumb-link">Properties</Link>
          <span className="detail-breadcrumb-separator">/</span>
          <span className="detail-breadcrumb-current">{property.title}</span>
        </nav>

        {/* ══════════ Two-Column Layout ══════════ */}
        <div className="detail-layout">
          {/* ── LEFT COLUMN (70%) ── */}
          <div className="detail-main">
            {/* Image Gallery */}
            <section className="detail-gallery" id="detail-gallery">
              <div className="detail-gallery-main">
                {currentImage ? (
                  <img src={currentImage} alt={property.title} className="detail-gallery-main-image" />
                ) : (
                  <div className="detail-gallery-main-image" style={{
                    background: "var(--color-bg-secondary)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    minHeight: 300, borderRadius: "var(--radius-lg)", color: "var(--color-text-muted)"
                  }}>No images available</div>
                )}
                <div className="property-card-tags">
                  <span className={`property-card-tag ${property.isAvailable ? 'tag-success' : 'tag-info'}`}>
                    {property.isAvailable && <span className="status-dot"></span>}
                    {property.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                {/* Favorite button on image */}
                <button 
                  className={`detail-fav-btn ${isFavorite ? 'is-active' : ''}`}
                  onClick={handleFavoriteToggle}
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  {isFavorite ? <FaHeart /> : <FaRegHeart />}
                </button>
              </div>
              {imageUrls.length > 1 && (
                <div className="detail-gallery-thumbnails">
                  {imageUrls.map((url, index) => (
                    <button
                      key={index}
                      className={`detail-gallery-thumb ${activeImageIndex === index ? "is-active" : ""}`}
                      onClick={() => setActiveImageIndex(index)}
                    >
                      <img src={url} alt={`${property.title} thumbnail`} className="detail-gallery-thumb-image" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Title & Meta */}
            <section className="detail-header" id="detail-header">
              <div className="detail-header-top">
                <h1 className="detail-title">{property.title}</h1>
                <span className="detail-type-badge">{property.type}</span>
              </div>
              <p className="detail-location">
                <FaMapMarkerAlt className="detail-location-icon" /> {location || "Location not specified"}
              </p>
            </section>

            {/* Key Facts */}
            <section className="detail-key-facts" id="detail-key-facts" style={{
              display: "flex", gap: "1.5rem", flexWrap: "wrap", margin: "1.5rem 0",
              padding: "1.25rem", background: "var(--color-bg-secondary)", borderRadius: "var(--radius-lg)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-text-secondary)" }}>
                <FaBed /> <span>{property.bedrooms || 0} Bedrooms</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-text-secondary)" }}>
                <FaBath /> <span>{property.bathrooms || 0} Bathrooms</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-text-secondary)" }}>
                <FaRulerCombined /> <span>{property.areaSqm || 0} m²</span>
              </div>
              {property.floor != null && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-text-secondary)" }}>
                  <FaBuilding /> <span>Floor {property.floor}</span>
                </div>
              )}
            </section>

            {/* About Section */}
            <section className="detail-about" id="detail-about">
              <h2 className="detail-section-title">About This Property</h2>
              <p className="detail-description">{property.description || "No description provided."}</p>
            </section>

            {/* Amenities Grid */}
            {activeAmenities.length > 0 && (
              <section className="detail-amenities" id="detail-amenities">
                <h2 className="detail-section-title">Amenities</h2>
                <div className="detail-amenities-grid">
                  {activeAmenities.map(({ key, label, icon: Icon }) => (
                    <div key={key} className="detail-amenity-card is-available">
                      <Icon className="detail-amenity-card-icon" />
                      <span className="detail-amenity-card-label">{label}</span>
                      <MdVerified className="detail-amenity-check" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ══════ Reviews Section ══════ */}
            <section className="detail-reviews" id="detail-reviews">
              {/* Reviews Header Card */}
              <div className="reviews-hero">
                <div className="reviews-hero-left">
                  <h2 className="reviews-hero-title">Reviews</h2>
                  <p className="reviews-hero-subtitle">
                    {(property.reviewCount || 0) > 0
                      ? `See what ${property.reviewCount} ${property.reviewCount === 1 ? 'tenant' : 'tenants'} said about this property`
                      : 'Be the first to share your experience'}
                  </p>
                </div>
                <div className="reviews-hero-score">
                  <div className="reviews-score-big">{(property.averageRating || 0).toFixed(1)}</div>
                  <div className="reviews-score-stars">{renderStars(property.averageRating)}</div>
                  <div className="reviews-score-count">{property.reviewCount || 0} reviews</div>
                </div>
              </div>

              {/* Review Form */}
              {user?.role === "TENANT" && (!userReview || editingReviewId) && (
                <div className="review-form-card" id="review-form">
                  <div className="review-form-card-header">
                    <FaStar className="review-form-card-icon" />
                    <h3 className="review-form-card-title">
                      {editingReviewId ? "Edit Your Review" : "Share Your Experience"}
                    </h3>
                  </div>

                  <form onSubmit={handleReviewSubmit} className="review-form-body">
                    <div className="review-form-rating-section">
                      <label className="review-form-label">How would you rate this property?</label>
                      <div className="review-form-stars-row">
                        <div className="star-rating-input">
                          {renderStars(reviewRating, (score) => setReviewRating(score))}
                        </div>
                        <span className="review-form-rating-label">
                          {reviewRating === 1 ? 'Poor' : reviewRating === 2 ? 'Fair' : reviewRating === 3 ? 'Good' : reviewRating === 4 ? 'Very Good' : 'Excellent'}
                        </span>
                      </div>
                    </div>

                    <div className="review-form-text-section">
                      <label htmlFor="comment" className="review-form-label">Tell us more</label>
                      <textarea
                        id="comment"
                        className="review-textarea"
                        placeholder="Share details about the location, amenities, landlord responsiveness, and anything future tenants should know…"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        required
                        rows={4}
                      />
                    </div>

                    <div className="review-form-actions">
                      <button type="submit" className="btn btn-primary review-submit-btn" disabled={isSubmittingReview}>
                        {isSubmittingReview ? (
                          <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving...</>
                        ) : editingReviewId ? (
                          <><FaEdit /> Update Review</>
                        ) : (
                          <><FaStar /> Post Review</>
                        )}
                      </button>
                      {editingReviewId && (
                        <button type="button" className="btn btn-secondary" onClick={() => { setEditingReviewId(null); setReviewComment(""); setReviewRating(5); }}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {/* Reviews List */}
              <div className="detail-reviews-list">
                {Array.isArray(reviews) && reviews.length > 0 ? (
                  reviews.map((review) => {
                    const initials = (review.tenantFullName || 'A')
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);
                    const avatarHue = ((review.tenantId || 0) * 137) % 360;
                    return (
                      <article key={review.id} className="review-card-v2">
                        <div className="review-card-v2-header">
                          <div
                            className="review-avatar-circle"
                            style={{ background: `hsl(${avatarHue}, 55%, 55%)` }}
                          >
                            {initials}
                          </div>
                          <div className="review-card-v2-meta">
                            <span className="review-card-v2-author">{review.tenantFullName || 'Anonymous'}</span>
                            <span className="review-card-v2-date">
                              {review.createdAt
                                ? new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                                : "Recently"}
                            </span>
                          </div>
                          <div className="review-card-v2-rating">
                            <span className="review-card-v2-rating-number">{review.rating}.0</span>
                            <div className="review-card-v2-stars">{renderStars(review.rating)}</div>
                          </div>
                          {String(user?.id) === String(review.tenantId) && (
                            <div className="review-card-v2-actions">
                              <button className="review-action-btn review-action-edit" onClick={() => handleEditReview(review)} title="Edit review">
                                <FaEdit />
                              </button>
                              <button className="review-action-btn review-action-delete" onClick={() => handleDeleteReview(review.id)} title="Delete review">
                                <FaTrashAlt />
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="review-card-v2-body">
                          <p className="review-card-v2-comment">{review.comment}</p>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="reviews-empty-state">
                    <div className="reviews-empty-icon">
                      <FaRegStar />
                    </div>
                    <h4 className="reviews-empty-title">No Reviews Yet</h4>
                    <p className="reviews-empty-text">Be the first to review this property and help other tenants make informed decisions.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* ── RIGHT COLUMN (30%) — Sticky Booking Card ── */}
          <aside className="detail-sidebar">
            <div className="sticky-booking-card" id="sticky-booking-card">
              <div className="booking-card-price-section">
                <span className="booking-card-price">{formatPrice(property.monthlyRent)}</span>
                <span className="booking-card-period">/ month</span>
              </div>
              <hr className="booking-card-divider" />
              <div className="booking-card-landlord">
                <div className="booking-card-landlord-info">
                  <span className="booking-card-landlord-name">{property.landlordName || "Landlord"}</span>
                  <span className="booking-card-landlord-role"><MdVerified className="booking-card-verified-icon" /> Verified Landlord</span>
                </div>
              </div>
              <hr className="booking-card-divider" />
              <div className="booking-card-actions">
                <Link to={`/book-visit/${property.id}`} className="btn btn-primary btn-lg booking-card-btn" id="book-visit-btn"><FaCalendarAlt /> Book a Visit</Link>
                <Link to={`/apply-rental/${property.id}`} className="btn btn-secondary btn-lg booking-card-btn" id="apply-rental-btn"><FaFileSignature /> Apply for Rental</Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
