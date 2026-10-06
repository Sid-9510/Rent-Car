import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';

const CarCard = ({ car, queryParams = '' }) => {
  const { favoriteIds, toggleFavoriteCar, isAdmin } = useAuth();
  const isFav = favoriteIds.includes(car.id);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavoriteCar(car.id);
  };

  return (
    <div className="rc-card h-100 d-flex flex-column">
      <div className="rc-car-img-wrapper">
        <img
          src={
            car.imageUrl ||
            'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80'
          }
          alt={`${car.brand} ${car.model}`}
          className="rc-car-img"
        />
        <span className="badge bg-dark bg-opacity-75 position-absolute top-0 start-0 m-3 px-2 py-1">
          {car.category}
        </span>

        {!isAdmin && (
          <button
            type="button"
            className="rc-fav-btn"
            onClick={handleFavoriteClick}
            title={isFav ? 'Remove from Favorites' : 'Add to Favorites'}
          >
            <i
              className={`bi ${
                isFav ? 'bi-heart-fill text-danger' : 'bi-heart text-dark'
              } fs-5`}
            ></i>
          </button>
        )}

        {!car.availableForDates && (
          <span className="badge bg-danger position-absolute bottom-0 start-0 m-3">
            Unavailable
          </span>
        )}
      </div>

      <div className="p-3 d-flex flex-column flex-grow-1">
        <div className="d-flex justify-content-between align-items-start mb-1">
          <div>
            <h5 className="fw-bold mb-0 text-dark">
              {car.brand} {car.model}
            </h5>
            <small className="text-muted">
              <i className="bi bi-geo-alt-fill text-primary me-1"></i>
              {car.location} &bull; {car.year}
            </small>
          </div>
          <div className="d-flex align-items-center gap-1 bg-warning-subtle text-dark px-2 py-1 rounded-2 small fw-semibold">
            <i className="bi bi-star-fill text-warning"></i>
            <span>{car.averageRating > 0 ? car.averageRating.toFixed(1) : '4.8'}</span>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 my-3 text-secondary small">
          <span className="bg-light border rounded px-2 py-1">
            <i className="bi bi-gear-fill me-1 text-primary"></i>
            {car.transmission}
          </span>
          <span className="bg-light border rounded px-2 py-1">
            <i className="bi bi-fuel-pump-fill me-1 text-primary"></i>
            {car.fuelType}
          </span>
          <span className="bg-light border rounded px-2 py-1">
            <i className="bi bi-people-fill me-1 text-primary"></i>
            {car.seats} Seats
          </span>
        </div>

        <div className="mt-auto pt-2 border-top d-flex align-items-center justify-content-between">
          <div>
            <span className="fs-5 fw-bold text-dark">{formatCurrency(car.pricePerDay)}</span>
            <span className="text-muted small"> / day</span>
          </div>
          <Link
            to={`/cars/${car.id}${queryParams}`}
            className="btn btn-rc-primary btn-sm px-3"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
