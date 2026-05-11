import React, { useState, useRef, useEffect } from "react";
import {
  FaBuilding,
  FaHome,
  FaHotel,
  FaDoorOpen,
  FaParking,
  FaSwimmingPool,
  FaCouch,
  FaCloudUploadAlt,
  FaTimesCircle,
  FaPaperPlane,
  FaSave,
  FaImage,
  FaTimes,
  FaTrashAlt,
  FaCheckCircle,
} from "react-icons/fa";
import { MdElevator } from "react-icons/md";
import { createProperty, updateProperty, uploadPropertyImages } from "../../services/propertyService";

const PROPERTY_TYPES = [
  { value: "Apartment", label: "Apartment", icon: FaBuilding },
  { value: "Office", label: "Office", icon: FaBuilding },
  { value: "Room", label: "Room", icon: FaHome },
  { value: "Villa", label: "Villa", icon: FaHotel },
  { value: "Studio", label: "Studio", icon: FaDoorOpen },
];

const AMENITY_TOGGLES = [
  { key: "hasParking", label: "Parking", icon: FaParking },
  { key: "hasElevator", label: "Elevator", icon: MdElevator },
  { key: "isFurnished", label: "Furnished", icon: FaCouch },
  { key: "hasPool", label: "Pool", icon: FaSwimmingPool },
];

const PropertyFormModal = ({ isOpen, onClose, property = null, onSuccess }) => {
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);
  const isEditMode = !!property;

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    propertyType: "",
    price: "",
    location: "",
    bedrooms: "1",
    bathrooms: "1",
    areaSqm: "",
    floor: "1",
    amenities: {
      hasParking: false,
      hasElevator: false,
      isFurnished: false,
      hasPool: false,
    },
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [errors, setErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title || "",
        description: property.description || "",
        propertyType: (property.type || "").charAt(0).toUpperCase() + (property.type || "").slice(1).toLowerCase(),
        price: String(property.monthlyRent || ""),
        location: property.address || property.city || "",
        bedrooms: String(property.bedrooms || "1"),
        bathrooms: String(property.bathrooms || "1"),
        areaSqm: String(property.areaSqm || ""),
        floor: String(property.floor || "1"),
        amenities: {
          hasParking: property.amenities?.includes("PARKING") || false,
          hasElevator: property.amenities?.includes("ELEVATOR") || false,
          isFurnished: property.amenities?.includes("FURNISHED") || false,
          hasPool: property.amenities?.includes("POOL") || false,
        },
      });
      setExistingImages(property.images || []);
    } else {
      setFormData({
        title: "",
        description: "",
        propertyType: "",
        price: "",
        location: "",
        bedrooms: "1",
        bathrooms: "1",
        areaSqm: "",
        floor: "1",
        amenities: {
          hasParking: false,
          hasElevator: false,
          isFurnished: false,
          hasPool: false,
        },
      });
      setExistingImages([]);
    }
    setNewImageFiles([]);
    setErrors({});
  }, [property, isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Click outside to close
  const handleBackdropClick = (e) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleTypeSelect = (type) => {
    setFormData((prev) => ({ ...prev, propertyType: type }));
    if (errors.propertyType) {
      setErrors((prev) => ({ ...prev, propertyType: "" }));
    }
  };

  const handleAmenityToggle = (key) => {
    setFormData((prev) => ({
      ...prev,
      amenities: { ...prev.amenities, [key]: !prev.amenities[key] },
    }));
  };

  const processFiles = (files) => {
    const validFiles = Array.from(files).filter((f) =>
      f.type.startsWith("image/")
    );
    const newImages = validFiles.map((file) => ({
      file,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      previewUrl: URL.createObjectURL(file),
    }));
    setNewImageFiles((prev) => [...prev, ...newImages]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files?.length > 0) processFiles(e.dataTransfer.files);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files?.length > 0) {
      processFiles(e.target.files);
      e.target.value = "";
    }
  };

  const removeExistingImage = (id) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
  };

  const removeNewImage = (id) => {
    setNewImageFiles((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((img) => img.id !== id);
    });
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = "Title is required";
    if (!formData.description.trim()) errs.description = "Description is required";
    if (!formData.propertyType) errs.propertyType = "Select a property type";
    if (!formData.price || Number(formData.price) <= 0)
      errs.price = "Enter a valid price";
    if (!formData.location.trim()) errs.location = "Location is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError("");
    setSuccessMsg("");

    try {
      const amenitiesList = [];
      if (formData.amenities.hasParking) amenitiesList.push("PARKING");
      if (formData.amenities.hasPool) amenitiesList.push("POOL");
      if (formData.amenities.hasElevator) amenitiesList.push("ELEVATOR");
      if (formData.amenities.isFurnished) amenitiesList.push("FURNISHED");

      const propertyData = {
        title: formData.title,
        description: formData.description,
        type: formData.propertyType.toUpperCase(),
        monthlyRent: Number(formData.price),
        city: formData.location.split(',')[0].trim(),
        address: formData.location,
        amenities: amenitiesList,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        areaSqm: Number(formData.areaSqm),
        floor: Number(formData.floor)
      };

      let propertyId;
      if (isEditMode) {
        const updated = await updateProperty(property.id, propertyData);
        propertyId = updated.id;
        setSuccessMsg("Property updated successfully!");
      } else {
        const created = await createProperty(propertyData);
        propertyId = created.id;
        setSuccessMsg("Property submitted successfully! Please wait for admin approval.");
      }

      if (newImageFiles.length > 0) {
        const imageFd = new FormData();
        newImageFiles.forEach((img) => {
          imageFd.append("files", img.file);
        });
        await uploadPropertyImages(propertyId, imageFd);
      }

      // Notify parent to refresh + close after delay
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        setSuccessMsg("");
      }, 2500);
    } catch (err) {
      console.error("Failed to save property:", err);
      setSubmitError(err.response?.data?.message || "Failed to save property. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      ref={modalRef}
      onClick={handleBackdropClick}
      id="property-form-modal"
    >
      <div
        className={`modal-container modal-lg ${isOpen ? "modal-enter" : ""}`}
      >
        {/* ── Modal Header ── */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">
              {isEditMode ? "Edit Property" : "Add New Property"}
            </h2>
            <p className="modal-subtitle">
              {isEditMode
                ? `Editing "${property.title}"`
                : "Fill out the details to list your property on Prophoria"}
            </p>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <FaTimes />
          </button>
        </div>

        {/* ── Modal Body ── */}
        <form className="modal-body" onSubmit={handleSubmit}>
          {/* Section: Basic Info */}
          <div className="modal-form-section">
            <h3 className="modal-form-section-title">Basic Information</h3>
            <div className="form-group">
              <label className="form-label">Property Title</label>
              <input
                type="text"
                name="title"
                className={`form-input ${errors.title ? "is-error" : ""}`}
                placeholder="e.g. The Glass House Residency"
                value={formData.title}
                onChange={handleInputChange}
              />
              {errors.title && (
                <span className="form-error-text">{errors.title}</span>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className={`form-textarea ${errors.description ? "is-error" : ""}`}
                placeholder="Describe your property…"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
              />
              {errors.description && (
                <span className="form-error-text">{errors.description}</span>
              )}
            </div>
          </div>

          {/* Section: Property Type */}
          <div className="modal-form-section">
            <h3 className="modal-form-section-title">Property Type</h3>
            {errors.propertyType && (
              <span className="form-error-text">{errors.propertyType}</span>
            )}
            <div className="type-selector-grid">
              {PROPERTY_TYPES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  className={`type-selector-card ${
                    formData.propertyType === value ? "is-selected" : ""
                  }`}
                  onClick={() => handleTypeSelect(value)}
                >
                  <Icon className="type-selector-icon" />
                  <span className="type-selector-label">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section: Price & Location */}
          <div className="modal-form-section">
            <h3 className="modal-form-section-title">Price & Location</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Monthly Price (EGP)</label>
                <input
                  type="number"
                  name="price"
                  className={`form-input ${errors.price ? "is-error" : ""}`}
                  placeholder="e.g. 4500"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                />
                {errors.price && (
                  <span className="form-error-text">{errors.price}</span>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Location / Address</label>
                <input
                  type="text"
                  name="location"
                  className={`form-input ${errors.location ? "is-error" : ""}`}
                  placeholder="e.g. 88 Skyline Boulevard"
                  value={formData.location}
                  onChange={handleInputChange}
                />
                {errors.location && (
                  <span className="form-error-text">{errors.location}</span>
                )}
              </div>
            </div>
          </div>

          {/* Section: Property Details (Beds, Baths, Area, Floor) */}
          <div className="modal-form-section">
            <h3 className="modal-form-section-title">Property Details</h3>
            <div className="form-row" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: "15px" }}>
              <div className="form-group">
                <label className="form-label">Bedrooms</label>
                <input
                  type="number"
                  name="bedrooms"
                  className="form-input"
                  min="0"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Bathrooms</label>
                <input
                  type="number"
                  name="bathrooms"
                  className="form-input"
                  min="0"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Area (m²)</label>
                <input
                  type="number"
                  name="areaSqm"
                  className="form-input"
                  placeholder="e.g. 120"
                  min="0"
                  value={formData.areaSqm}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Floor</label>
                <input
                  type="number"
                  name="floor"
                  className="form-input"
                  placeholder="e.g. 1"
                  value={formData.floor}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Section: Amenities */}
          <div className="modal-form-section">
            <h3 className="modal-form-section-title">Amenities</h3>
            <div className="amenity-toggles-grid">
              {AMENITY_TOGGLES.map(({ key, label, icon: Icon }) => (
                <div key={key} className="amenity-toggle">
                  <div className="amenity-toggle-info">
                    <Icon className="amenity-toggle-icon" />
                    <span className="amenity-toggle-label">{label}</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={formData.amenities[key]}
                    className={`amenity-switch ${
                      formData.amenities[key] ? "is-on" : ""
                    }`}
                    onClick={() => handleAmenityToggle(key)}
                  >
                    <span className="amenity-switch-thumb" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Images */}
          <div className="modal-form-section">
            <h3 className="modal-form-section-title">Property Images</h3>

            {isEditMode && existingImages.length > 0 && (
              <div className="edit-existing-images">
                <label className="form-label">Current Images</label>
                <div className="image-preview-grid">
                  {existingImages.map((img) => (
                    <div key={img.id} className="image-preview-item">
                      <img
                        src={img.imageUrl}
                        alt="Existing"
                        className="image-preview-thumb"
                      />
                      <button
                        type="button"
                        className="image-preview-remove"
                        onClick={() => removeExistingImage(img.id)}
                      >
                        <FaTrashAlt />
                      </button>
                      {img.isMain && (
                        <span className="image-preview-main-badge">Main</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div
              className={`image-dropzone ${isDragActive ? "is-drag-active" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <FaCloudUploadAlt className="image-dropzone-icon" />
              <p className="image-dropzone-text">
                Drag & drop images here, or{" "}
                <span className="image-dropzone-browse">browse files</span>
              </p>
              <p className="image-dropzone-hint">JPG, PNG, WebP — up to 10</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="image-dropzone-input"
                onChange={handleFileInputChange}
              />
            </div>

            {newImageFiles.length > 0 && (
              <div className="image-preview-grid">
                {newImageFiles.map((img) => (
                  <div key={img.id} className="image-preview-item">
                    <img
                      src={img.previewUrl}
                      alt="Preview"
                      className="image-preview-thumb"
                    />
                    <button
                      type="button"
                      className="image-preview-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNewImage(img.id);
                      }}
                    >
                      <FaTimesCircle />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Feedback Messages ── */}
          {successMsg && (
            <div style={{
              padding: "14px 20px", borderRadius: "12px", margin: "0 24px 8px",
              display: "flex", alignItems: "center", gap: "10px",
              background: "rgba(16,185,129,0.15)", color: "#10b981",
              border: "1px solid rgba(16,185,129,0.3)", fontSize: "14px", fontWeight: 600,
            }}>
              <FaCheckCircle style={{ fontSize: "18px", flexShrink: 0 }} />
              {successMsg}
            </div>
          )}
          {submitError && (
            <div style={{
              padding: "14px 20px", borderRadius: "12px", margin: "0 24px 8px",
              display: "flex", alignItems: "center", gap: "10px",
              background: "rgba(239,68,68,0.15)", color: "#ef4444",
              border: "1px solid rgba(239,68,68,0.3)", fontSize: "14px", fontWeight: 600,
            }}>
              <FaTimesCircle style={{ fontSize: "18px", flexShrink: 0 }} />
              {submitError}
            </div>
          )}

          {/* ── Modal Footer ── */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
              {submitting ? (
                <>Submitting…</>
              ) : isEditMode ? (
                <><FaSave /> Save Changes</>
              ) : (
                <><FaPaperPlane /> Submit for Approval</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyFormModal;
