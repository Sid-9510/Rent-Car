import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import bookingService from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../utils/formatters';

const MyBookings = () => {
  const { showToast, refreshUserExtras } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('UPCOMING');

  // Cancel confirmation modal state
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await bookingService.getMyBookings();
      setBookings(data);
    } catch (err) {
      setError(err.friendlyMessage || 'Could not load your bookings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;
    try {
      setCancelling(true);
      await bookingService.cancelBooking(bookingToCancel.id);
      showToast(`Booking ${bookingToCancel.bookingReference} cancelled successfully.`, 'info');
      setBookingToCancel(null);
      await loadBookings();
      await refreshUserExtras();
    } catch (err) {
      showToast(err.friendlyMessage || 'Could not cancel booking.', 'danger');
    } finally {
      setCancelling(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'UPCOMING') {
      return b.status === 'CONFIRMED' || b.status === 'PENDING';
    }
    if (activeTab === 'COMPLETED') {
      return b.status === 'COMPLETED';
    }
    if (activeTab === 'CANCELLED') {
      return b.status === 'CANCELLED';
    }
    return true;
  });

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">My Bookings</h3>
          <p className="text-muted small mb-0">
            Track your upcoming reservations, invoices, and rental history
          </p>
        </div>
        <Link to="/cars" className="btn btn-rc-primary btn-sm mt-2 mt-sm-0">
          <i className="bi bi-plus-lg me-1"></i> Book Another Car
        </Link>
      </div>

      {/* TABS: Upcoming | Completed | Cancelled */}
      <ul className="nav nav-pills gap-2 mb-4 bg-white p-2 rounded-3 border d-inline-flex">
        {[
          { key: 'UPCOMING', label: 'Upcoming' },
          { key: 'COMPLETED', label: 'Completed' },
          { key: 'CANCELLED', label: 'Cancelled' },
        ].map((tab) => (
          <li className="nav-item" key={tab.key}>
            <button
              type="button"
              className={`nav-link btn-sm px-3 fw-semibold ${
                activeTab === tab.key ? 'active bg-primary text-white' : 'text-secondary'
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      <ErrorMessage message={error} onRetry={loadBookings} />

      {loading ? (
        <LoadingSpinner message="Loading your bookings..." />
      ) : filteredBookings.length === 0 ? (
        /* EMPTY STATE (SECTION 55) */
        <div className="rc-card p-5 text-center">
          <i className="bi bi-calendar-x fs-1 text-muted"></i>
          <h5 className="fw-bold mt-3">No bookings found.</h5>
          <p className="text-muted small mb-4">
            You haven&apos;t rented a car in this category yet.
          </p>
          <Link to="/cars" className="btn btn-rc-primary px-4">
            Browse Cars
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {filteredBookings.map((b) => (
            <div className="col-md-6" key={b.id}>
              <div className="rc-card p-4 h-100 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={b.carImageUrl}
                      alt={b.carName}
                      className="rounded-3"
                      style={{ width: '88px', height: '62px', objectFit: 'cover' }}
                    />
                    <div>
                      <h5 className="fw-bold mb-0">{b.carName}</h5>
                      <span className="small font-monospace text-primary fw-semibold">
                        {b.bookingReference}
                      </span>
                    </div>
                  </div>
                  <span className={`rc-badge ${getStatusBadgeClass(b.status)}`}>
                    {b.status}
                  </span>
                </div>

                <div className="bg-light rounded-3 p-3 small mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Dates:</span>
                    <span className="fw-semibold">
                      {formatDate(b.pickupDate)} &rarr; {formatDate(b.returnDate)} ({b.numberOfDays}d)
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Route:</span>
                    <span>
                      {b.pickupLocation} &rarr; {b.dropLocation}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Payment Status:</span>
                    <span className={`badge ${getStatusBadgeClass(b.paymentStatus)}`}>
                      {b.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="mt-auto pt-2 border-top d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-muted d-block">Total Amount</small>
                    <span className="fs-5 fw-bold text-dark">
                      {formatCurrency(b.totalAmount)}
                    </span>
                  </div>

                  <div className="d-flex gap-2">
                    <Link
                      to={`/bookings/${b.id}`}
                      className="btn btn-outline-primary btn-sm px-3"
                    >
                      VIEW DETAILS
                    </Link>
                    {b.cancellable && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm px-3"
                        onClick={() => setBookingToCancel(b)}
                      >
                        CANCEL
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CANCELLATION CONFIRMATION MODAL (SECTION 36) */}
      {bookingToCancel && (
        <div
          className="modal d-block"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Are you sure you want to cancel?</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setBookingToCancel(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p className="text-secondary small mb-3">
                  This will cancel your reservation and mark any completed payment as{' '}
                  <strong>REFUNDED</strong>.
                </p>
                <div className="bg-light p-3 rounded-3 border small">
                  <div>
                    <strong>Booking:</strong> {bookingToCancel.bookingReference}
                  </div>
                  <div>
                    <strong>Car:</strong> {bookingToCancel.carName}
                  </div>
                  <div>
                    <strong>Dates:</strong> {formatDate(bookingToCancel.pickupDate)} &rarr;{' '}
                    {formatDate(bookingToCancel.returnDate)}
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top-0">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setBookingToCancel(null)}
                  disabled={cancelling}
                >
                  KEEP BOOKING
                </button>
                <button
                  type="button"
                  className="btn btn-danger fw-semibold"
                  onClick={handleConfirmCancel}
                  disabled={cancelling}
                >
                  {cancelling ? 'Cancelling...' : 'YES, CANCEL'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
