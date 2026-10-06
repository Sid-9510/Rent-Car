import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import bookingService from '../services/bookingService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatCurrency, formatDate, formatTime } from '../utils/formatters';

const BookingConfirmation = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBooking = async () => {
      try {
        setLoading(true);
        const data = await bookingService.getBookingById(id);
        setBooking(data);
      } catch (err) {
        setError(err.friendlyMessage || 'Could not load booking confirmation.');
      } finally {
        setLoading(false);
      }
    };
    loadBooking();
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading booking confirmation..." />;
  if (error || !booking) return <div className="container py-5"><ErrorMessage message={error || 'Booking not found'} /></div>;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="rc-card p-4 p-md-5 text-center">
            <div
              className="rounded-circle bg-success text-white d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: '72px', height: '72px' }}
            >
              <i className="bi bi-check-lg fs-1"></i>
            </div>
            <h3 className="fw-bold text-success mb-1">BOOKING CONFIRMED</h3>
            <p className="text-muted small mb-4">
              Thank you for choosing RentCar! Your reservation is confirmed and ready.
            </p>

            <div className="bg-light rounded-4 p-4 text-start border mb-4">
              <div className="d-flex justify-content-between py-2 border-bottom">
                <span className="text-muted small">Booking ID:</span>
                <strong className="text-primary">{booking.bookingReference}</strong>
              </div>
              <div className="d-flex justify-content-between py-2 border-bottom">
                <span className="text-muted small">Car:</span>
                <strong>{booking.carName}</strong>
              </div>
              <div className="d-flex justify-content-between py-2 border-bottom">
                <span className="text-muted small">Pickup:</span>
                <div className="text-end">
                  <div className="fw-semibold">{booking.pickupLocation}</div>
                  <small className="text-muted">
                    {formatDate(booking.pickupDate)} &bull; {formatTime(booking.pickupTime)}
                  </small>
                </div>
              </div>
              <div className="d-flex justify-content-between py-2 border-bottom">
                <span className="text-muted small">Return:</span>
                <div className="text-end">
                  <div className="fw-semibold">{booking.dropLocation}</div>
                  <small className="text-muted">
                    {formatDate(booking.returnDate)} &bull; {formatTime(booking.returnTime)}
                  </small>
                </div>
              </div>
              <div className="d-flex justify-content-between py-2 border-bottom">
                <span className="text-muted small">Total:</span>
                <strong className="fs-5">{formatCurrency(booking.totalAmount)}</strong>
              </div>
              <div className="d-flex justify-content-between pt-2">
                <span className="text-muted small">Payment:</span>
                <span className="badge bg-success">{booking.paymentStatus || 'SUCCESS'}</span>
              </div>
              {booking.transactionId && (
                <div className="d-flex justify-content-between pt-2">
                  <span className="text-muted small">Transaction ID:</span>
                  <span className="small font-monospace">{booking.transactionId}</span>
                </div>
              )}
            </div>

            <div className="d-flex flex-wrap justify-content-center gap-2">
              <Link to={`/bookings/${booking.id}`} className="btn btn-rc-primary">
                <i className="bi bi-file-earmark-text me-1"></i> VIEW BOOKING
              </Link>
              <Link
                to={`/bookings/${booking.id}?print=true`}
                className="btn btn-outline-dark"
              >
                <i className="bi bi-printer me-1"></i> DOWNLOAD INVOICE
              </Link>
              <Link to="/my-bookings" className="btn btn-outline-secondary">
                MY BOOKINGS
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
