import React from 'react';

const CATEGORIES = ['ALL', 'SUV', 'SEDAN', 'HATCHBACK', 'LUXURY', 'SPORTS'];
const FUEL_TYPES = ['ALL', 'PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID'];
const TRANSMISSIONS = ['ALL', 'AUTOMATIC', 'MANUAL'];
const LOCATIONS = ['ALL', 'Ahmedabad', 'Mumbai', 'Delhi', 'Bengaluru', 'Pune'];

const FilterPanel = ({ filters, onFilterChange, onReset }) => {
  const handleChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  return (
    <div className="rc-card p-3">
      <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
        <h6 className="fw-bold mb-0">
          <i className="bi bi-funnel-fill text-primary me-2"></i>Filters
        </h6>
        <button
          type="button"
          className="btn btn-link btn-sm text-decoration-none p-0"
          onClick={onReset}
        >
          Reset All
        </button>
      </div>

      {/* Keyword Search */}
      <div className="mb-3">
        <label className="form-label small fw-semibold text-secondary">Search Brand / Model</label>
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="e.g. Creta, BMW, Swift..."
          value={filters.keyword || ''}
          onChange={(e) => handleChange('keyword', e.target.value)}
        />
      </div>

      {/* Location */}
      <div className="mb-3">
        <label className="form-label small fw-semibold text-secondary">Location</label>
        <select
          className="form-select form-select-sm"
          value={filters.location || 'ALL'}
          onChange={(e) => handleChange('location', e.target.value)}
        >
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>
              {loc === 'ALL' ? 'All Locations' : loc}
            </option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div className="mb-3">
        <label className="form-label small fw-semibold text-secondary">Category</label>
        <select
          className="form-select form-select-sm"
          value={filters.category || 'ALL'}
          onChange={(e) => handleChange('category', e.target.value)}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'ALL' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className="mb-3">
        <label className="form-label small fw-semibold text-secondary">
          Max Price / Day: {filters.maxPrice ? `₹${filters.maxPrice}` : 'Any'}
        </label>
        <input
          type="range"
          className="form-range"
          min="1000"
          max="15000"
          step="500"
          value={filters.maxPrice || 15000}
          onChange={(e) => handleChange('maxPrice', e.target.value)}
        />
        <div className="d-flex justify-content-between small text-muted">
          <span>₹1,000</span>
          <span>₹15,000</span>
        </div>
      </div>

      {/* Fuel Type */}
      <div className="mb-3">
        <label className="form-label small fw-semibold text-secondary">Fuel Type</label>
        <select
          className="form-select form-select-sm"
          value={filters.fuelType || 'ALL'}
          onChange={(e) => handleChange('fuelType', e.target.value)}
        >
          {FUEL_TYPES.map((f) => (
            <option key={f} value={f}>
              {f === 'ALL' ? 'All Fuel Types' : f}
            </option>
          ))}
        </select>
      </div>

      {/* Transmission */}
      <div className="mb-3">
        <label className="form-label small fw-semibold text-secondary">Transmission</label>
        <select
          className="form-select form-select-sm"
          value={filters.transmission || 'ALL'}
          onChange={(e) => handleChange('transmission', e.target.value)}
        >
          {TRANSMISSIONS.map((t) => (
            <option key={t} value={t}>
              {t === 'ALL' ? 'All Transmissions' : t}
            </option>
          ))}
        </select>
      </div>

      {/* Seats */}
      <div className="mb-3">
        <label className="form-label small fw-semibold text-secondary">Minimum Seats</label>
        <select
          className="form-select form-select-sm"
          value={filters.seats || ''}
          onChange={(e) => handleChange('seats', e.target.value)}
        >
          <option value="">Any Seats</option>
          <option value="4">4+ Seats</option>
          <option value="5">5+ Seats</option>
          <option value="7">7 Seats (SUV / MPV)</option>
        </select>
      </div>

      {/* Availability */}
      <div className="form-check">
        <input
          className="form-check-input"
          type="checkbox"
          id="availableOnlyCheck"
          checked={Boolean(filters.availableOnly)}
          onChange={(e) => handleChange('availableOnly', e.target.checked)}
        />
        <label className="form-check-label small fw-medium" htmlFor="availableOnlyCheck">
          Show Available Cars Only
        </label>
      </div>
    </div>
  );
};

export default FilterPanel;
