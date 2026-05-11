import React, { useState, useRef, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  FaSave,
  FaImage,
  FaChevronLeft,
  FaTrashAlt,
} from "react-icons/fa";
import { MdElevator } from "react-icons/md";
import { getPropertyById } from "../../services/propertyService";

const PROPERTY_TYPES = [
  { value: "Apartment", label: "Apartment", icon: FaBuilding },
  { value: "House", label: "House", icon: FaHome },
  { value: "Villa", label: "Villa", icon: FaHotel },
  { value: "Studio", label: "Studio", icon: FaDoorOpen },
];

const AMENITY_TOGGLES = [
  { key: "hasParking", label: "Parking", icon: FaParking },
  { key: "hasElevator", label: "Elevator", icon: MdElevator },
  { key: "isFurnished", label: "Furnished", icon: FaCouch },
  { key: "hasPool", label: "Pool", icon: FaSwimmingPool },
];

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [property, setProperty] = useState(null);
  const [formData, setFormData] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  
  React.useEffect(() => {
    const fetchProp = async () => {
      try {
        const data = await getPropertyById(id);
        setProperty(data);
        setFormData({
          title: data.title || "",
          description: data.description || "",
          propertyType: data.propertyType || "Apartment",
          price: String(data.price || 0),
          location: data.location || "",
          amenities: data.amenities || { hasParking: false, hasElevator: false, isFurnished: false, hasPool: false },
        });
        setExistingImages(data.images || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProp();
  }, [id]);

  // Newly uploaded images
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [isDragActive, setIsDragActive] = useState(false);

  if (!property || !formData) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="empty-state">
            <h3 className="empty-state-title">Property Not Found</h3>
            <p className="empty-state-text">
              The property you're trying to edit doesn't exist or has been
              removed.
            </p>
            <Link to="/landlord/properties" className="btn btn-primary btn-lg">
              <FaChevronLeft /> Back to My Properties
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

  const removeExistingImage = (imageId) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const processFiles = (files) => {
    const validFiles = Array.from(files).filter((f) =>
      f.type.startsWith("image/")
    );
    const newImages = validFiles.map((file) => ({
      file,
      id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      previewUrl: URL.createObjectURL(file),
    }));
    setNewImageFiles((prev) => [...prev, ...newImages]);
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

  const removeNewImage = (imageId) => {
    setNewImageFiles((prev) => {
      const target = prev.find((img) => img.id === imageId);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((img) => img.id !== imageId);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      id: property.id,
      ...formData,
      price: Number(formData.price),
      existingImageIds: existingImages.map((img) => img.id),
      newImages: newImageFiles.map((img) => img.file),
    };
    console.log("Updating property:", payload);
    // Future: PUT to API via Axios
    navigate("/landlord/properties");
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="add-property-page">
          {/* ── Back link ── */}
          <Link to="/landlord/properties" className="edit-property-back-link">
            <FaChevronLeft /> Back to My Properties
          </Link>

          <div className="add-property-header">
            <h1 className="add-property-title">Edit Property</h1>
            <p className="add-property-subtitle">
              Update the details for "{property.title}"
            </p>
          </div>

          <form
            className="add-property-form"
            onSubmit={handleSubmit}
            id="edit-property-form"
          >
            {/* ══════ Section: Basic Info ══════ */}
            <section className="form-section">
              <h2 className="form-section-title">Basic Information</h2>
              <div className="form-section-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-property-title">
                    Property Title
                  </label>
                  <input
                    type="text"
                    id="edit-property-title"
                    name="title"
                    className="form-input"
                    placeholder="e.g. The Glass House Residency"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label
                    className="form-label"
                    htmlFor="edit-property-description"
                  >
                    Description
                  </label>
                  <textarea
                    id="edit-property-description"
                    name="description"
                    className="form-textarea"
                    placeholder="Describe your property in detail…"
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
                <div className="type-selector-grid" id="edit-type-selector">
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
                    <label
                      className="form-label"
                      htmlFor="edit-property-price"
                    >
                      Monthly Price ($)
                    </label>
                    <input
                      type="number"
                      id="edit-property-price"
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
                    <label
                      className="form-label"
                      htmlFor="edit-property-location"
                    >
                      Location / Address
                    </label>
                    <input
                      type="text"
                      id="edit-property-location"
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
                <div
                  className="amenity-toggles-grid"
                  id="edit-amenity-toggles"
                >
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
                        id={`edit-toggle-${key}`}
                      >
                        <span className="amenity-switch-thumb" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ══════ Section: Image Management ══════ */}
            <section className="form-section">
              <h2 className="form-section-title">Property Images</h2>
              <div className="form-section-body">
                {/* Existing images */}
                {existingImages.length > 0 && (
                  <div className="edit-existing-images">
                    <label className="form-label">Current Images</label>
                    <div
                      className="image-preview-grid"
                      id="edit-existing-images"
                    >
                      {existingImages.map((img) => (
                        <div key={img.id} className="image-preview-item">
                          <img
                            src={img.imageUrl}
                            alt="Existing property"
                            className="image-preview-thumb"
                          />
                          <button
                            type="button"
                            className="image-preview-remove"
                            onClick={() => removeExistingImage(img.id)}
                            aria-label="Remove image"
                          >
                            <FaTrashAlt />
                          </button>
                          {img.isMain && (
                            <span className="image-preview-main-badge">
                              Main
                            </span>
                          )}
                          <div className="image-preview-overlay">
                            <FaImage className="image-preview-overlay-icon" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload new */}
                <div
                  className={`image-dropzone ${
                    isDragActive ? "is-drag-active" : ""
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  id="edit-image-dropzone"
                >
                  <FaCloudUploadAlt className="image-dropzone-icon" />
                  <p className="image-dropzone-text">
                    Drag & drop new images here, or{" "}
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
                    id="edit-image-file-input"
                  />
                </div>

                {newImageFiles.length > 0 && (
                  <div className="edit-new-images">
                    <label className="form-label">New Images</label>
                    <div
                      className="image-preview-grid"
                      id="edit-new-images"
                    >
                      {newImageFiles.map((img) => (
                        <div key={img.id} className="image-preview-item">
                          <img
                            src={img.previewUrl}
                            alt="New upload preview"
                            className="image-preview-thumb"
                          />
                          <button
                            type="button"
                            className="image-preview-remove"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNewImage(img.id);
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
                  </div>
                )}
              </div>
            </section>

            {/* ══════ Submit ══════ */}
            <div className="add-property-submit">
              <button
                type="submit"
                className="btn btn-primary btn-lg add-property-submit-btn"
                id="update-property-btn"
              >
                <FaSave /> Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProperty;
