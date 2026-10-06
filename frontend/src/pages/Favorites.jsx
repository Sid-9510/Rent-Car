import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';
import CarCard from '../components/CarCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Favorites = () => {
  const { favoriteIds } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userService.getFavorites();
      setFavorites(data);
    } catch {
      // Handled gracefully
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites, favoriteIds.length]);

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h3 className="fw-bold mb-1">My Favorite Cars</h3>
        <p className="text-muted small mb-0">
          Quickly access and book the vehicles you love most
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading your favorite cars..." />
      ) : favorites.length === 0 ? (
        <div className="rc-card p-5 text-center">
          <i className="bi bi-heart fs-1 text-danger"></i>
          <h5 className="fw-bold mt-3">No favorite cars yet.</h5>
          <p className="text-muted small mb-4">
            Click the heart icon on any vehicle card to save it here for quick comparison.
          </p>
          <Link to="/cars" className="btn btn-rc-primary px-4">
            Explore Cars
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {favorites.map((car) => (
            <div className="col-md-6 col-lg-4" key={car.id}>
              <CarCard car={car} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
