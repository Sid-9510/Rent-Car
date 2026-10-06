import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import carService from '../services/carService';
import bookingService from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatCurrency, formatDate } from '../utils/formatters';

const CarDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, favoriteIds, toggleFavoriteCar, showToast } = useAuth();

  const [car, setCar] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [eligibleBookings, setEligibleBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const pickupDate = searchParams.get('pickupDate') || '';
  const returnDate = searchParams.get('returnDate') || '';

  const loadCarDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [carData, reviewsData] = await Promise.all([
        carService.getCarById(id, {
          pickupDate: pickupDate || undefined,
          returnDate: returnDate || undefined,
        }),
        carService.getCarReviews(id),
      ]);
      setCar(carData);
      setReviews(reviewsData);

      if (isAuthenticated && !isAdmin) {
        try {
          const myBookings = await bookingService.getMyBookings();
          const completedUnreviewed = myBookings.filter(
            (b) =>
              Number(b.carId) === Number(id) &&
              b.status === 'COMPLETED' &&
              !b.reviewed
          );
          setEligibleBookings(completedUnreviewed);
          if (completedUnreviewed.length > 0) {
            setSelectedBookingId(completedUnreviewed[0].id);
          }
        } catch {
          // Ignore
        }
      }
    } catch (err) {
      setError(err.friendlyMessage || 'Could not load car details.');
    } finally {
      setLoading(false);
    }
  }, [id, pickupDate, returnDate, isAuthenticated, isAdmin]);

  useEffect(() => {
    loadCarDetails();
  }, [loadCarDetails]);

  const handleBookNow = () => {
    if (!isAuthenticated) {
      showToast('Please login to book this car.', 'info');
      navigate('/login', { state: { from: { pathname: `/booking/${id}` } } });
      return;
    }
    const query = searchParams.toString();
    navigate(`/booking/${id}${query ? `?${query}` : ''}`);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast('Please write a review comment.', 'warning');
      return;
    }
    try {
      setSubmittingReview(true);
      await carService.addCarReview(id, {
        bookingId: selectedBookingId || null,
        rating: Number(rating),
        comment: comment.trim(),
      });
      setComment('');
      showToast('Thank you! Your review has been published.', 'success');
      loadCarDetails();
    } catch (err) {
      showToast(err.friendlyMessage || 'Could not submit review.', 'danger');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading car specifications..." />;
  if (error || !car) return <div className="container py-5"><ErrorMessage message={error || 'Car not found'} /></div>;

  const isFav = favoriteIds.includes(car.id);

  return (
    <div className="container py-4">
      {/* BREADCRUMB */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/cars">Cars</Link></li>
          <li className="breadcrumb-item active">{car.brand} {car.model}</li>
        </ol>
      </nav>

      <div className="row g-4">
        {/* LEFT COLUMN: IMAGE GALLERY & SPECS */}
        <div className="col-lg-8">
          <div className="rc-card overflow-hidden mb-4">
            <div style={{ height: '400px', backgroundColor: '#0f172a' }}>
              <img
                src={car.imageUrl}
                alt={`${car.brand} ${car.model}`}
                className="w-100 h-100"
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className="p-4">
              <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
                <div>
                  <span className="badge bg-primary mb-2">{car.category}</span>
                  <h2 className="fw-bold mb-1">
                    {car.brand} {car.model} ({car.year})
                  </h2>
                  <p className="text-muted mb-0">
                    <i className="bi bi-geo-alt-fill text-primary me-1"></i>
                    Available in <strong>{car.location}</strong>
                  </p>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <div className="bg-warning-subtle px-3 py-2 rounded-3 fw-bold">
                    <i className="bi bi-star-fill text-warning me-1"></i>
                    {car.averageRating > 0 ? car.averageRating.toFixed(1) : '4.8'}{' '}
                    <span className="text-muted small fw-normal">
                      ({reviews.length} reviews)
                    </span>
                  </div>
                  {!isAdmin && (
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => toggleFavoriteCar(car.id)}
                    >
                      <i className={`bi ${isFav ? 'bi-heart-fill' : 'bi-heart'} me-1`}></i>
                      {isFav ? 'Saved' : 'Favorite'}
                    </button>
                  )}
                </div>
              </div>

              <h6 className="fw-bold text-uppercase small text-secondary mt-4">Description</h6>
              <p className="text-secondary">{car.description}</p>

              {/* SPECIFICATIONS */}
              <h6 className="fw-bold text-uppercase small text-secondary mt-4 mb-3">
                Specifications
              </h6>
              <div className="row g-3">
                {[
                  { icon: 'bi-fuel-pump-fill', label: 'Fuel Type', val: car.fuelType },
                  { icon: 'bi-gear-fill', label: 'Transmission', val: car.transmission },
                  { icon: 'bi-people-fill', label: 'Seats', val: `${car.seats} Passengers` },
                  { icon: 'bi-door-open-fill', label: 'Doors', val: `${car.doors} Doors` },
                  { icon: 'bi-suitcase-lg-fill', label: 'Luggage', val: `${car.luggageCapacity} Bags` },
                  { icon: 'bi-calendar3', label: 'Model Year', val: car.year },
                ].map((spec, idx) => (
                  <div className="col-6 col-md-4" key={idx}>
                    <div className="p-3 border rounded-3 bg-light d-flex align-items-center gap-3">
                      <i className={`bi ${spec.icon} fs-4 text-primary`}></i>
                      <div>
                        <div className="small text-muted">{spec.label}</div>
                        <div className="fw-bold small">{spec.val}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* FEATURES */}
              <h6 className="fw-bold text-uppercase small text-secondary mt-4 mb-3">
                Included Features
              </h6>
              <div className="row g-2 small">
                {[
                  'Automatic Climate Control (AC)',
                  'Bluetooth & Apple CarPlay / Android Auto',
                  'GPS Navigation Support',
                  'Fast USB-C Charging Ports',
                  'Dual Front & Side Airbags',
                  'ABS with EBD & Rear Parking Camera',
                  '24/7 Roadside Assistance',
                  'Sanitized Before Every Trip',
                ].map((feat, i) => (
                  <div className="col-sm-6" key={i}>
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    {feat}
                  </div>
                ))}
              </div>

              {/* RENTAL POLICIES */}
              <h6 className="fw-bold text-uppercase small text-secondary mt-4 mb-3">
                Rental Policies
              </h6>
              <ul className="small text-muted mb-0">
                <li>Valid original driving license and government ID required at pickup.</li>
                <li>Free cancellation at least 24 hours prior to scheduled pickup date.</li>
                <li>Fuel Policy: Same-to-Same (return with the same fuel level as pickup).</li>
                <li>Standard insurance and 24/7 roadside assistance included.</li>
              </ul>
            </div>
          </div>

          {/* CUSTOMER REVIEWS SECTION */}
          <div className="rc-card p-4">
            <h5 className="fw-bold mb-3">
              Customer Reviews ({reviews.length})
            </h5>

            {eligibleBookings.length > 0 && (
              <form
                onSubmit={handleReviewSubmit}
                className="bg-light p-3 rounded-3 border mb-4"
              >
                <h6 className="fw-bold mb-2">Rate Your Completed Rental</h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Completed Booking</label>
                    <select
                      className="form-select form-select-sm"
                      value={selectedBookingId}
                      onChange={(e) => setSelectedBookingId(e.target.value)}
                    >
                      {eligibleBookings.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.bookingReference} ({formatDate(b.pickupDate)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Rating</label>
                    <select
                      className="form-select form-select-sm"
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
                  <div className="col-12">
                    <textarea
                      className="form-control form-control-sm"
                      rows="2"
                      placeholder="Share your driving experience with this car..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <div className="col-12 text-end">
                    <button
                      type="submit"
                      className="btn btn-rc-primary btn-sm"
                      disabled={submittingReview}
                    >
                      {submittingReview ? 'Submitting...' : 'SUBMIT REVIEW'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {reviews.length === 0 ? (
              <p className="text-muted small mb-0">
                No reviews yet for this car. Complete a booking to be the first to review!
              </p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="border-bottom pb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-bold">{rev.userName}</span>
                      <small className="text-muted">{formatDate(rev.createdAt)}</small>
                    </div>
                    <div className="text-warning small mb-1">
                      {Array.from({ length: rev.rating }).map((_, idx) => (
                        <i key={idx} className="bi bi-star-fill me-1"></i>
                      ))}
                    </div>
                    <p className="small text-secondary mb-0">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: STICKY BOOKING SUMMARY CARD */}
        <div className="col-lg-4">
          <div className="rc-card p-4 position-sticky" style={{ top: '95px' }}>
            <div className="d-flex justify-content-between align-items-baseline mb-3 pb-3 border-bottom">
              <div>
                <span className="fs-3 fw-bold text-dark">
                  {formatCurrency(car.pricePerDay)}
                </span>
                <span className="text-muted"> / day</span>
              </div>
              <span
                className={`badge ${
                  car.status === 'AVAILABLE' && car.availableForDates
                    ? 'bg-success'
                    : 'bg-danger'
                }`}
              >
                {car.status === 'AVAILABLE' && car.availableForDates
                  ? 'AVAILABLE'
                  : car.status}
              </span>
            </div>

            <div className="small text-secondary mb-4 d-flex flex-column gap-2">
              <div className="d-flex justify-content-between">
                <span>Base Location:</span>
                <strong className="text-dark">{car.location}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Security Deposit:</span>
                <strong className="text-success">₹0 (Zero Deposit)</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Optional Extras:</span>
                <strong className="text-dark">GPS, Child Seat, Insurance</strong>
              </div>
            </div>

            {isAdmin ? (
              <Link to="/admin/cars" className="btn btn-outline-primary w-100">
                Manage in Admin Panel
              </Link>
            ) : (
              <button
                type="button"
                className="btn btn-rc-primary w-100 py-3 fs-6"
                disabled={car.status !== 'AVAILABLE' || !car.availableForDates}
                onClick={handleBookNow}
              >
                <i className="bi bi-calendar-check me-2"></i>
                {car.status === 'AVAILABLE' && car.availableForDates
                  ? 'BOOK NOW'
                  : 'CURRENTLY UNAVAILABLE'}
              </button>
            )}

            <div className="text-center mt-3 small text-muted">
              <i className="bi bi-shield-check text-success me-1"></i>
              Instant confirmation &bull; Free cancellation before pickup
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetails;
