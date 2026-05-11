import React, { useState, useMemo, useEffect } from "react";
import {
  FaSearch,
  FaTimesCircle,
  FaSlidersH,
  FaHome,
  FaBuilding,
} from "react-icons/fa";
import { MdSearchOff } from "react-icons/md";
import PropertyCard from "../../components/common/PropertyCard";
import { getAllProperties } from "../../services/propertyService";
import { toggleFavorite } from "../../services/favoriteService";

const PROPERTY_TYPES = ["All Types", "Apartment", "House", "Villa", "Studio"];

function Home() {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Search state ──
  const [searchLocation, setSearchLocation] = useState("");
  const [searchType, setSearchType] = useState("All Types");

  // ── Filter state ──
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [filterType, setFilterType] = useState("All Types");
  const [showFilters, setShowFilters] = useState(false);

  // ── Active filters (applied on search click or filter change) ──
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedSearchType, setAppliedSearchType] = useState("All Types");

  useEffect(() => {
    console.log("Home component mounted, fetching properties...");
    const fetchProperties = async () => {
      try {
        const data = await getAllProperties();
        setProperties(data || []);
      } catch (err) {
        setError("Failed to load properties. Check backend connection.");
        console.error("Home fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, []);



  const handleSearch = (e) => {
    e.preventDefault();
    setAppliedSearch(searchLocation.trim());
    setAppliedSearchType(searchType);
  };

  const activeFilters = useMemo(() => {
    const tags = [];
    if (appliedSearch) tags.push({ key: "location", label: `Location: "${appliedSearch}"` });
    if (appliedSearchType !== "All Types") tags.push({ key: "searchType", label: `Type: ${appliedSearchType}` });
    if (filterType !== "All Types" && filterType !== appliedSearchType) tags.push({ key: "filterType", label: `Type: ${filterType}` });
    if (minPrice) tags.push({ key: "minPrice", label: `Min: $${Number(minPrice).toLocaleString()}` });
    if (maxPrice) tags.push({ key: "maxPrice", label: `Max: $${Number(maxPrice).toLocaleString()}` });
    return tags;
  }, [appliedSearch, appliedSearchType, filterType, minPrice, maxPrice]);

  const removeFilter = (key) => {
    switch (key) {
      case "location":
        setAppliedSearch("");
        setSearchLocation("");
        break;
      case "searchType":
        setAppliedSearchType("All Types");
        setSearchType("All Types");
        break;
      case "filterType":
        setFilterType("All Types");
        break;
      case "minPrice":
        setMinPrice("");
        break;
      case "maxPrice":
        setMaxPrice("");
        break;
      default:
        break;
    }
  };

  const clearAllFilters = () => {
    setSearchLocation("");
    setSearchType("All Types");
    setMinPrice("");
    setMaxPrice("");
    setFilterType("All Types");
    setAppliedSearch("");
    setAppliedSearchType("All Types");
  };

  const filteredProperties = useMemo(() => {
    if (!properties || !Array.isArray(properties)) return [];
    return properties.filter((p) => {
      // Backend uses 'city' and 'title'. We search in both.
      const searchStr = appliedSearch.toLowerCase();
      if (appliedSearch && 
          !p.city?.toLowerCase().includes(searchStr) && 
          !p.title?.toLowerCase().includes(searchStr) &&
          !p.address?.toLowerCase().includes(searchStr)) return false;

      // Backend uses 'type' (Enum like APARTMENT)
      if (appliedSearchType !== "All Types" && p.type !== appliedSearchType.toUpperCase()) return false;
      if (filterType !== "All Types" && p.type !== filterType.toUpperCase()) return false;

      // Backend uses 'monthlyRent'
      if (minPrice && p.monthlyRent < Number(minPrice)) return false;
      if (maxPrice && p.monthlyRent > Number(maxPrice)) return false;
      
      return true;
    });
  }, [properties, appliedSearch, appliedSearchType, filterType, minPrice, maxPrice]);

  // Intersection Observer for scroll animations
  useEffect(() => {
    if (isLoading || filteredProperties.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const cards = document.querySelectorAll('.property-card:not(.animate-in)');
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [isLoading, filteredProperties]);

  return (
    <div className="home-page">
      <section className="hero-section" id="hero-section">
        <div className="hero-backdrop" />
        <div className="hero-content">
          <span className="hero-tagline">Welcome to SmartRent</span>
          <h1 className="hero-title">Find Your Perfect Home</h1>
          <p className="hero-subtitle">
            Discover premium rental properties curated for modern living
          </p>

          <form className="hero-search-bar" onSubmit={handleSearch} id="search-bar">
            <div className="hero-search-input-group">
              <FaSearch className="hero-search-icon" />
              <input type="text" className="hero-search-input" placeholder="Enter a city, neighborhood, or address…" value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)} id="search-location-input" />
            </div>
            <select className="hero-search-select" value={searchType} onChange={(e) => setSearchType(e.target.value)} id="search-type-select">
              {PROPERTY_TYPES.map((type) => (<option key={type} value={type}>{type}</option>))}
            </select>
            <button type="submit" className="btn btn-primary hero-search-btn" id="search-btn"><FaSearch /> Search</button>
          </form>
        </div>
        <div className="hero-shape hero-shape-1" />
        <div className="hero-shape hero-shape-2" />
      </section>

      <main className="home-main container">
        <div className="filter-bar" id="filter-bar">
          <div className="filter-bar-left">
            <button className={`filter-toggle-btn ${showFilters ? "is-active" : ""}`} onClick={() => setShowFilters((v) => !v)} id="filter-toggle-btn">
              <FaSlidersH /> Filters
            </button>
            {activeFilters.length > 0 && (
              <div className="filter-tags">
                {activeFilters.map((tag) => (
                  <span key={tag.key} className="filter-tag">
                    {tag.label}
                    <button className="filter-tag-remove" onClick={() => removeFilter(tag.key)} aria-label={`Remove ${tag.label} filter`}><FaTimesCircle /></button>
                  </span>
                ))}
                <button className="filter-clear-all" onClick={clearAllFilters}>Clear All</button>
              </div>
            )}
          </div>
          <div className="filter-bar-right">
            <span className="filter-results-count">
              {filteredProperties.length} {filteredProperties.length === 1 ? "property" : "properties"} found
            </span>
          </div>
        </div>

        {showFilters && (
          <div className="filter-panel" id="filter-panel">
            <div className="filter-panel-group">
              <label className="filter-panel-label">Min Price</label>
              <input type="number" className="form-input filter-panel-input" placeholder="$0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} min="0" id="filter-min-price" />
            </div>
            <div className="filter-panel-group">
              <label className="filter-panel-label">Max Price</label>
              <input type="number" className="form-input filter-panel-input" placeholder="No limit" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} min="0" id="filter-max-price" />
            </div>
            <div className="filter-panel-group">
              <label className="filter-panel-label">Property Type</label>
              <select className="form-select filter-panel-select" value={filterType} onChange={(e) => setFilterType(e.target.value)} id="filter-type-select">
                {PROPERTY_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          </div>
        )}

        <div className="home-section-header">
          <h2 className="home-section-title"><FaBuilding className="home-section-icon" /> Featured Properties</h2>
        </div>

        {isLoading ? (
          <div className="loading-state" style={{ padding: "4rem", textAlign: "center" }}>
            <div className="spinner" style={{ width: 40, height: 40, margin: "0 auto 1rem" }} />
            <p style={{ color: "var(--color-text-muted)" }}>Loading properties from backend...</p>
          </div>
        ) : error ? (
          <div className="empty-state" id="error-state" style={{ color: "var(--color-error)" }}>
            <FaTimesCircle style={{ fontSize: "3rem", marginBottom: "1rem" }} />
            <h3>Connection Error</h3>
            <p>{error}</p>
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className="property-grid" id="property-grid">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                variant="tenant"
                onFavoriteToggle={(id, newState) => {
                  // Update local state so the heart persists across re-renders
                  setProperties(prev => prev.map(p =>
                    p.id === id ? { ...p, isFavorite: newState } : p
                  ));
                  toggleFavorite(id, newState).catch((err) =>
                    console.error("Failed to toggle favorite:", err)
                  );
                }}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state" id="empty-state">
            <div className="empty-state-icon-wrapper"><MdSearchOff className="empty-state-icon" /></div>
            <h3 className="empty-state-title">No Properties Found</h3>
            <p className="empty-state-text">We couldn't find any properties matching your current filters. Try adjusting your search criteria or clear all filters to browse all available listings.</p>
            <button className="btn btn-primary btn-lg" onClick={clearAllFilters} id="clear-filters-btn"><FaHome /> Clear All Filters</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;
