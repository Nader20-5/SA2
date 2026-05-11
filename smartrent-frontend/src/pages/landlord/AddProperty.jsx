import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  FaImage,
  FaCheckCircle,
} from "react-icons/fa";
import { createProperty } from "../../services/propertyService";
import { MdElevator } from "react-icons/md";

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

const AddProperty = () => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState(null); // { type: 'success' | 'error', text: '...' }
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    propertyType: "",
    price: "",
    location: "",
    amenities: {
      hasParking: false,
      hasElevator: false,
      isFurnished: false,
      hasPool: false,
    },
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeSelect = (type) => {
    setFormData((prev) => ({ ...prev, propertyType: type }));
  };

  const handleAmenityToggle = (key) => {
    setFormData((prev) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [key]: !prev.amenities[key],
      },
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
    setImageFiles((prev) => [...prev, ...newImages]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files?.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files?.length > 0) {
      processFiles(e.target.files);
      e.target.value = "";
    }
  };

  const removeImage = (id) => {
    setImageFiles((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMsg(null);

    try {
      // 1. Map frontend state to backend CreatePropertyDto (JSON)
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
        city: formData.location.split(',')[0].trim(), // Simple split for city
        address: formData.location,
        amenities: amenitiesList,
        // Optional defaults for simplicity
        bedrooms: 0,
        bathrooms: 0,
        areaSqm: 0,
        floor: 1
      };

      // 2. Create the property
      const createdProperty = await createProperty(propertyData);
      const propertyId = createdProperty.id;

      // 3. Upload images if any
      if (imageFiles.length > 0) {
        const imageFd = new FormData();
        imageFiles.forEach((img) => {
          imageFd.append("files", img.file);
        });
        
        // We need a service for this
        await import("../../services/propertyService").then(m => 
          m.uploadPropertyImages(propertyId, imageFd)
        );
      }

      setSubmitMsg({ type: "success", text: "Property created successfully! Pending admin approval." });

      // Navigate to landlord dashboard after short delay
      setTimeout(() => navigate("/landlord/dashboard"), 1500);
    } catch (err) {
      console.error("Failed to create property:", err);
      const msg = err.response?.data?.message || "Failed to create property. Please check all fields and try again.";
      setSubmitMsg({ type: "error", text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="add-property-page">
          <div className="add-property-header">
            <h1 className="add-property-title">Add New Property</h1>
            <p className="add-property-subtitle">
              Fill out the details below to list your property on Prophoria
            </p>
          </div>

          <form
            className="add-property-form"
            onSubmit={handleSubmit}
            id="add-property-form"
          >
            {/* ══════ Section: Basic Info ══════ */}
            <section className="form-section">
              <h2 className="form-section-title">Basic Information</h2>
              <div className="form-section-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="property-title">
                    Property Title
                  </label>
                  <input
                    type="text"
                    id="property-title"
                    name="title"
                    className="form-input"
                    placeholder="e.g. The Glass House Residency"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="property-description">
                    Description
                  </label>
                  <textarea
                    id="property-description"
                    name="description"
                    className="form-textarea"
                    placeholder="Describe your property in detail — highlights, features, neighborhood…"
                    rows={5}
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </section>

            {/* ══════ Section: Property Type ══════ */}
            <section className="form-section">
              <h2 className="form-section-title">Property Type</h2>
              <div className="form-section-body">
                <div className="type-selector-grid" id="type-selector">
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
            </section>

            {/* ══════ Section: Price & Location ══════ */}
            <section className="form-section">
              <h2 className="form-section-title">Price & Location</h2>
              <div className="form-section-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="property-price">
                      Monthly Price ($)
                    </label>
                    <input
                      type="number"
                      id="property-price"
                      name="price"
                      className="form-input"
                      placeholder="e.g. 4500"
                      min="0"
                      step="50"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="property-location">
                      Location / Address
                    </label>
                    <input
                      type="text"
                      id="property-location"
                      name="location"
                      className="form-input"
                      placeholder="e.g. 88 Skyline Boulevard, West District"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ══════ Section: Amenities ══════ */}
            <section className="form-section">
              <h2 className="form-section-title">Amenities</h2>
              <div className="form-section-body">
                <div className="amenity-toggles-grid" id="amenity-toggles">
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
                        id={`toggle-${key}`}
                      >
                        <span className="amenity-switch-thumb" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ══════ Section: Image Upload ══════ */}
            <section className="form-section">
              <h2 className="form-section-title">Property Images</h2>
              <div className="form-section-body">
                <div
                  className={`image-dropzone ${isDragActive ? "is-drag-active" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  id="image-dropzone"
                >
                  <FaCloudUploadAlt className="image-dropzone-icon" />
                  <p className="image-dropzone-text">
                    Drag & drop images here, or{" "}
                    <span className="image-dropzone-browse">browse files</span>
                  </p>
                  <p className="image-dropzone-hint">
                    Supports JPG, PNG, WebP — up to 10 images
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="image-dropzone-input"
                    onChange={handleFileInputChange}
                    id="image-file-input"
                  />
                </div>

                {imageFiles.length > 0 && (
                  <div className="image-preview-grid" id="image-preview-grid">
                    {imageFiles.map((img) => (
                      <div key={img.id} className="image-preview-item">
                        <img
                          src={img.previewUrl}
                          alt="Property preview"
                          className="image-preview-thumb"
                        />
                        <button
                          type="button"
                          className="image-preview-remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(img.id);
                          }}
                          aria-label="Remove image"
                        >
                          <FaTimesCircle />
                        </button>
                        <div className="image-preview-overlay">
                          <FaImage className="image-preview-overlay-icon" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* ══════ Feedback ══════ */}
            {submitMsg && (
              <div className={`add-property-alert ${submitMsg.type}`} style={{
                padding: "12px 20px",
                borderRadius: "12px",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "14px",
                fontWeight: 500,
                background: submitMsg.type === "success" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                color: submitMsg.type === "success" ? "#059669" : "#dc2626",
                border: `1px solid ${submitMsg.type === "success" ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
              }}>
                {submitMsg.type === "success" ? <FaCheckCircle /> : <FaTimesCircle />}
                {submitMsg.text}
              </div>
            )}

            {/* ══════ Submit ══════ */}
            <div className="add-property-submit">
              <button
                type="submit"
                className="btn btn-primary btn-lg add-property-submit-btn"
                id="submit-property-btn"
                disabled={submitting}
              >
                {submitting ? (
                  <>Submitting…</>
                ) : (
                  <><FaPaperPlane /> Submit for Approval</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;
