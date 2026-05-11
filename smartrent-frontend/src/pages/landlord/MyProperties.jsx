import React, { useState, useMemo } from "react";
import {
  FaPlus,
  FaSlidersH,
  FaSearch,
  FaTimesCircle,
  FaBuilding,
} from "react-icons/fa";
import { MdSearchOff } from "react-icons/md";
import Sidebar from "../../components/common/Sidebar";
import PropertyCard from "../../components/common/PropertyCard";
import PropertyFormModal from "../../components/forms/PropertyFormModal";
import { getMyProperties, deleteProperty } from "../../services/propertyService";

const STATUS_OPTIONS = [
  "All Statuses",
  "Available",
  "Pending Approval",
  "Approved",
  "Rejected",
];
const TYPE_OPTIONS = ["All Types", "Apartment", "House", "Villa", "Studio"];

const MyProperties = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [showFilters, setShowFilters] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [properties, setProperties] = useState([]);

  const fetchProperties = async () => {
    try {
      const data = await getMyProperties();
      setProperties(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    fetchProperties();
  }, []);

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const titleMatch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase());
      const cityMatch = !searchQuery || (p.city && p.city.toLowerCase().includes(searchQuery.toLowerCase()));
      const addressMatch = !searchQuery || (p.address && p.address.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (searchQuery && !titleMatch && !cityMatch && !addressMatch) {
        return false;
      }
      
      if (statusFilter !== "All Statuses") {
        const statusMap = {
          "Available": "APPROVED", // Assuming Available means Approved and isAvailable=true
          "Pending Approval": "PENDING",
          "Approved": "APPROVED",
          "Rejected": "REJECTED"
        };
        if (p.status !== statusMap[statusFilter]) return false;
      }
      
      if (typeFilter !== "All Types" && p.type?.toUpperCase() !== typeFilter.toUpperCase()) return false;
      
      return true;
    });
  }, [searchQuery, statusFilter, typeFilter, properties]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("All Statuses");
    setTypeFilter("All Types");
  };

  const activeFilterCount = [
    searchQuery,
    statusFilter !== "All Statuses" ? statusFilter : "",
    typeFilter !== "All Types" ? typeFilter : "",
  ].filter(Boolean).length;

  const handleAddProperty = () => {
    setEditingProperty(null);
    setIsModalOpen(true);
  };

  const handleEditProperty = (id) => {
    const prop = properties.find((p) => p.id === id);
    if (prop) {
      setEditingProperty(prop);
      setIsModalOpen(true);
    }
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteProperty(id);
      fetchProperties(); // Refresh list after deletion
    } catch (err) {
      console.error("Failed to delete property:", err);
      const msg = err.response?.data?.message || "Failed to delete property. Please try again.";
      alert(msg);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProperty(null);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">My Properties</h1>
            <p className="dashboard-subtitle">
              Manage and monitor all of your listed properties
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleAddProperty}
            id="add-property-btn"
          >
            <FaPlus /> Add Property
          </button>
        </div>

        {/* Search & Filter */}
        <div className="my-properties-toolbar" id="my-properties-toolbar">
          <div className="my-properties-search">
            <FaSearch className="my-properties-search-icon" />
            <input
              type="text"
              className="form-input my-properties-search-input"
              placeholder="Search by title or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="my-properties-search-input"
            />
            {searchQuery && (
              <button
                className="my-properties-search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <FaTimesCircle />
              </button>
            )}
          </div>
          <button
            className={`filter-toggle-btn ${showFilters ? "is-active" : ""}`}
            onClick={() => setShowFilters((v) => !v)}
            id="my-properties-filter-toggle"
          >
            <FaSlidersH /> Filters
            {activeFilterCount > 0 && (
              <span className="filter-count-badge">{activeFilterCount}</span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="filter-panel" id="my-properties-filter-panel">
            <div className="filter-panel-group">
              <label className="filter-panel-label">Status</label>
              <select
                className="form-select filter-panel-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="filter-panel-group">
              <label className="filter-panel-label">Type</label>
              <select
                className="form-select filter-panel-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            {activeFilterCount > 0 && (
              <button className="filter-clear-all" onClick={clearAllFilters}>
                Clear All
              </button>
            )}
          </div>
        )}

        <div className="my-properties-results">
          <span className="filter-results-count">
            <FaBuilding className="filter-results-icon" />
            {filteredProperties.length}{" "}
            {filteredProperties.length === 1 ? "property" : "properties"}
          </span>
        </div>

        {filteredProperties.length > 0 ? (
          <div className="property-grid" id="my-properties-grid">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                variant="landlord"
                onEdit={handleEditProperty}
                onDelete={handleDeleteProperty}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state" id="my-properties-empty-state">
            <div className="empty-state-icon-wrapper">
              <MdSearchOff className="empty-state-icon" />
            </div>
            <h3 className="empty-state-title">No Properties Found</h3>
            <p className="empty-state-text">
              {activeFilterCount > 0
                ? "No properties match your current filters."
                : "You haven't listed any properties yet."}
            </p>
            {activeFilterCount > 0 ? (
              <button className="btn btn-primary btn-lg" onClick={clearAllFilters}>
                Clear All Filters
              </button>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={handleAddProperty}>
                <FaPlus /> Add Your First Property
              </button>
            )}
          </div>
        )}
      </main>

      {/* Property Form Modal */}
      <PropertyFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        property={editingProperty}
        onSuccess={fetchProperties}
      />
    </div>
  );
};

export default MyProperties;
