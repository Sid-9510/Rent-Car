import React, { useEffect, useState, useCallback } from 'react';
import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate } from '../../utils/formatters';

const ManageReviews = () => {
  const { showToast } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllReviews();
      setReviews(data);
    } catch (err) {
      showToast(err.friendlyMessage || 'Could not load reviews.', 'danger');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleDeleteReview = async (id) => {
    try {
      await adminService.deleteReview(id);
      showToast('Review removed successfully.', 'info');
      loadReviews();
    } catch (err) {
      showToast(err.friendlyMessage || 'Could not delete review.', 'danger');
    }
  };

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h3 className="fw-bold mb-1">Manage Customer Reviews</h3>
        <p className="text-muted small mb-0">
          Moderate verified customer reviews and ratings across all vehicles
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading customer reviews..." />
      ) : (
        <div className="rc-card overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th>User</th>
                  <th>Car</th>
                  <th>Booking Ref</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r.id}>
                    <td className="fw-semibold">{r.userName}</td>
                    <td>{r.carName}</td>
                    <td className="font-monospace text-primary">{r.bookingReference}</td>
                    <td className="text-warning text-nowrap">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <i key={i} className="bi bi-star-fill me-1"></i>
                      ))}
                    </td>
                    <td style={{ maxWidth: '340px' }}>{r.comment}</td>
                    <td>{formatDate(r.createdAt)}</td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteReview(r.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageReviews;
