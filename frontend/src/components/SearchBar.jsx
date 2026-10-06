import React, { useState } from 'react';
import { getDefaultDateRange } from '../utils/formatters';

const LOCATIONS = ['Ahmedabad', 'Mumbai', 'Delhi', 'Bengaluru', 'Pune'];

const SearchBar = ({ initialValues = {}, onSearch }) => {
  const defaults = getDefaultDateRange();
  const [pickupLocation, setPickupLocation] = useState(initialValues.pickupLocation || '');
  const [dropLocation, setDropLocation] = useState(initialValues.dropLocation || '');
  const [pickupDate, setPickupDate] = useState(initialValues.pickupDate || defaults.pickupDate);
  const [returnDate, setReturnDate] = useState(initialValues.returnDate || defaults.returnDate);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (pickupDate && returnDate && new Date(returnDate) <= new Date(pickupDate)) {
      setError('Return date must be after the pickup date.');
      return;
    }

    onSearch({
      pickupLocation,
      dropLocation: dropLocation || pickupLocation,
      pickupDate,
      returnDate,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white text-dark p-4 rounded-4 shadow border">
      {error && (
        <div className="alert alert-danger py-2 small mb-3">
          <i className="bi bi-exclamation-circle me-1"></i> {error}
        </div>
      )}
      <div className="row g-3 align-items-end">
        <div className="col-md-3">
          <label className="form-label small fw-semibold text-secondary mb-1">
            <i className="bi bi-geo-alt-fill text-primary me-1"></i> Pickup Location
          </label>
          <select
            className="form-select"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
          >
            <option value="">All Cities</option>
            {LOCATIONS.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <label className="form-label small fw-semibold text-secondary mb-1">
            <i className="bi bi-pin-map-fill text-primary me-1"></i> Drop-off Location
          </label>
          <select
            className="form-select"
            value={dropLocation}
            onChange={(e) => setDropLocation(e.target.value)}
          >
            <option value="">Same as Pickup</option>
            {LOCATIONS.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-2">
          <label className="form-label small fw-semibold text-secondary mb-1">
            <i className="bi bi-calendar-event text-primary me-1"></i> Pickup Date
          </label>
          <input
            type="date"
            className="form-control"
            min={today}
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
            required
          />
        </div>

        <div className="col-md-2">
          <label className="form-label small fw-semibold text-secondary mb-1">
            <i className="bi bi-calendar-check text-primary me-1"></i> Return Date
          </label>
          <input
            type="date"
            className="form-control"
            min={pickupDate || today}
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            required
          />
        </div>

        <div className="col-md-2 d-grid">
          <button type="submit" className="btn btn-rc-primary py-2">
            <i className="bi bi-search me-1"></i> SEARCH
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;
