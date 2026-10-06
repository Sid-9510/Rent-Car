import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import bookingService from '../services/bookingService';
import carService from '../services/carService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
  formatCurrency,
  formatDate,
  formatTime,
  getStatusBadgeClass,
} from '../utils/formatters';

const BookingDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { showToast, refreshUserExtras } = useAuth();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await bookingService.getBookingById(id);
      setBooking(data);
    } catch (err) {
      setError(err.friendlyMessage || 'Could not load booking details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  useEffect(() => {
    if (booking && searchParams.get('print') === 'true') {
      const timer = setTimeout(() => window.print(), 400);
      return () => clearTimeout(timer);
    }
  }, [booking, searchParams]);

  const handleCancelBooking = async () => {
    try {
      setCancelling(true);
      await bookingService.cancelBooking(booking.id);
      showToast('Booking cancelled successfully.', 'info');
      setShowCancelModal(false);
      await loadDetails();
      await refreshUserExtras();
    } catch (err) {
      showToast(err.friendlyMessage || 'Cancellation failed.', 'danger');
    } finally {
      setCancelling(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingReview(true);
      await carService.addCarReview(booking.carId, {
        bookingId: booking.id,
        rating: Number(rating),
        comment: comment.trim(),
      });
      showToast('Review submitted! Thank you for choosing RentCar.', 'success');
      setComment('');
      loadDetails();
    } catch (err) {
      showToast(err.friendlyMessage || 'Could not submit review.', 'danger');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading invoice & booking details..." />;
  if (error || !booking) return <div className="container py-5"><ErrorMessage message={error || 'Booking not found'} /></div>;

  return (
    <div className="container py-4">
      {/* TOP ACTION BAR (Hidden when printing) */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 no-print gap-2">
        <Link to="/my-bookings" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left me-1"></i> Back to My Bookings
        </Link>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-rc-primary btn-sm"
            onClick={() => window.print()}
          >
            <i className="bi bi-printer me-1"></i> Print / Download Invoice
          </button>
          {booking.cancellable && (
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => setShowCancelModal(true)}
            >
              <i className="bi bi-x-circle me-1"></i> Cancel Booking
            </button>
          )}
        </div>
      </div>

      {/* INVOICE VIEW (SECTION 37) */}
      <div className="rc-card rc-invoice-box p-4 p-md-5 mx-auto" style={{ maxWidth: '850px' }}>
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-start border-bottom pb-4 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="rc-brand-badge">
                <i className="bi bi-car-front-fill"></i>
              </span>
              <h3 className="fw-bold mb-0">RentCar</h3>
            </div>
            <p className="text-muted small mb-0 fst-italic">“Rent. Drive. Explore.”</p>
            <small className="text-muted">support@rentcar.com &bull; +91 98765 43210</small>
          </div>

          <div className="text-sm-end mt-3 mt-sm-0">
            <h4 className="fw-bold text-uppercase mb-1">INVOICE</h4>
            <div className="font-monospace fw-bold text-primary">
              {booking.bookingReference}
            </div>
            <div className="small text-muted">
              Date: {formatDate(booking.createdAt)}
            </div>
            <span className={`rc-badge mt-1 d-inline-block ${getStatusBadgeClass(booking.status)}`}>
              {booking.status}
            </span>
          </div>
        </div>

        {/* CUSTOMER & RENTAL DETAILS */}
        <div className="row g-4 mb-4">
          <div className="col-sm-6">
            <h6 className="text-uppercase small fw-bold text-secondary mb-2">Customer</h6>
            <div className="fw-bold">{booking.userName}</div>
            <div className="small text-muted">{booking.userEmail}</div>
            <div className="small text-muted">{booking.userPhone}</div>
          </div>

          <div className="col-sm-6 text-sm-end">
            <h6 className="text-uppercase small fw-bold text-secondary mb-2">Vehicle Rented</h6>
            <div className="fw-bold">{booking.carName}</div>
            <div className="small text-muted">Category: {booking.carCategory}</div>
            <div className="small text-muted">
              Daily Rate: {formatCurrency(booking.carPricePerDay)}/day
            </div>
          </div>
        </div>

        {/* SCHEDULE BOX */}
        <div className="row g-3 bg-light p-3 rounded-3 border mb-4 small">
          <div className="col-sm-6">
            <div className="text-muted">Pickup</div>
            <div className="fw-bold">{booking.pickupLocation}</div>
            <div>
              {formatDate(booking.pickupDate)} at {formatTime(booking.pickupTime)}
            </div>
          </div>
          <div className="col-sm-6">
            <div className="text-muted">Return</div>
            <div className="fw-bold">{booking.dropLocation}</div>
            <div>
              {formatDate(booking.returnDate)} at {formatTime(booking.returnTime)}
            </div>
          </div>
        </div>

        {/* ITEMIZED BREAKDOWN */}
        <div className="table-responsive mb-4">
          <table className="table table-bordered align-middle mb-0">
            <thead className="table-light small text-uppercase">
              <tr>
                <th>Description</th>
                <th className="text-end">Amount</th>
              </tr>
            </thead>
            <tbody className="small">
              <tr>
                <td>
                  Base Rental Charge ({booking.carName} &times; {booking.numberOfDays}{' '}
                  {booking.numberOfDays === 1 ? 'day' : 'days'})
                </td>
                <td className="text-end fw-semibold">{formatCurrency(booking.baseAmount)}</td>
              </tr>
              <tr>
                <td>
                  Optional Extras{' '}
                  {booking.selectedExtras?.length > 0
                    ? `(${booking.selectedExtras.join(', ')})`
                    : '(None)'}
                </td>
                <td className="text-end">{formatCurrency(booking.extraAmount)}</td>
              </tr>
              {booking.discountAmount > 0 && (
                <tr className="text-success">
                  <td>
                    Promotional Discount{' '}
                    {booking.couponCode ? `(Coupon: ${booking.couponCode})` : ''}
                  </td>
                  <td className="text-end fw-semibold">
                    -{formatCurrency(booking.discountAmount)}
                  </td>
                </tr>
              )}
              <tr>
                <td>Taxes &amp; GST (18%)</td>
                <td className="text-end">{formatCurrency(booking.taxAmount)}</td>
              </tr>
              <tr className="table-light fs-6 fw-bold">
                <td>TOTAL</td>
                <td className="text-end text-primary">
                  {formatCurrency(booking.totalAmount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* PAYMENT INFO */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center pt-3 border-top small">
          <div>
            <div>
              <strong>Payment Status:</strong>{' '}
              <span className={`badge ${getStatusBadgeClass(booking.paymentStatus)}`}>
                {booking.paymentStatus}
              </span>
            </div>
            {booking.transactionId && (
              <div className="mt-1">
                <strong>Transaction ID:</strong>{' '}
                <span className="font-monospace">{booking.transactionId}</span> (
                {booking.paymentMethod})
              </div>
            )}
          </div>
          <div className="mt-3 mt-sm-0 text-sm-end text-muted fst-italic">
            Thank you for choosing RentCar.
          </div>
        </div>
      </div>

      {/* REVIEW SECTION FOR COMPLETED UNREVIEWED BOOKING (SECTION 39) */}
      {booking.status === 'COMPLETED' && !booking.reviewed && (
        <div
          className="rc-card p-4 mt-4 mx-auto no-print"
          style={{ maxWidth: '850px' }}
        >
          <h5 className="fw-bold mb-3">
            <i className="bi bi-star-fill text-warning me-2"></i>
            Rate your experience with {booking.carName}
          </h5>
          <form onSubmit={handleReviewSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Rating (1–5)</label>
                <select
                  className="form-select"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                >
                  <option value="5">★★★★★ (5 - Excellent)</option>
                  <option value="4">★★★★☆ (4 - Very Good)</option>
                  <option value="3">★★★☆☆ (3 - Good)</option>
                  <option value="2">★★☆☆☆ (2 - Fair)</option>
                  <option value="1">★☆☆☆☆ (1 - Poor)</option>
                </select>
              </div>
              <div className="col-md-8">
                <label className="form-label small fw-semibold">Write your review</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="How was the car condition, comfort, and pickup experience?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </div>
              <div className="col-12 text-end">
                <button
                  type="submit"
                  className="btn btn-rc-primary"
                  disabled={submittingReview}
                >
                  {submittingReview ? 'Submitting...' : 'SUBMIT REVIEW'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* CANCEL MODAL */}
      {showCancelModal && (
        <div
          className="modal d-block no-print"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Are you sure you want to cancel?</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCancelModal(false)}
                ></button>
              </div>
              <div className="modal-body small">
                Booking: <strong>{booking.bookingReference}</strong> ({booking.carName})
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCancelModal(false)}
                >
                  KEEP BOOKING
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleCancelBooking}
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

export default BookingDetails;
