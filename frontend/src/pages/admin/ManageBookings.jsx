import React, { useEffect, useState, useCallback } from 'react';
import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../utils/formatters';

const ManageBookings = () => {
  const { showToast } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [customerSearch, setCustomerSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllBookings({
        status: statusFilter,
        customer: customerSearch,
      });
      setBookings(data);
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to load bookings.', 'danger');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, customerSearch, showToast]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      await adminService.updateBookingStatus(bookingId, status);
      showToast(`Booking status updated to ${status}.`, 'success');
      loadBookings();
      setSelectedBooking(null);
    } catch (err) {
      showToast(err.friendlyMessage || 'Could not update booking status.', 'danger');
    }
  };

  const displayedBookings = bookings.filter((b) => {
    if (!dateFilter) return true;
    return b.pickupDate === dateFilter || b.returnDate === dateFilter;
  });

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h3 className="fw-bold mb-1">Manage Bookings</h3>
        <p className="text-muted small mb-0">
          Monitor reservations, filter by status, customer, or date, and manage rental lifecycles
        </p>
      </div>

      {/* FILTERS */}
      <div className="rc-card p-3 mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label small fw-semibold">Status</label>
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PENDING">PENDING</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-semibold">Customer / Booking Ref / Car</label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search name, email, or RC-2026..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label small fw-semibold">Filter by Date</label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          <div className="col-md-2 d-grid">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                setStatusFilter('ALL');
                setCustomerSearch('');
                setDateFilter('');
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading bookings..." />
      ) : (
        <div className="rc-card overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Car</th>
                  <th>Pickup</th>
                  <th>Return</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedBookings.map((b) => (
                  <tr key={b.id}>
                    <td className="font-monospace fw-bold text-primary">
                      {b.bookingReference}
                    </td>
                    <td>
                      <div className="fw-semibold">{b.userName}</div>
                      <small className="text-muted">{b.userEmail}</small>
                    </td>
                    <td className="fw-medium">{b.carName}</td>
                    <td>
                      <div>{b.pickupLocation}</div>
                      <small className="text-muted">{formatDate(b.pickupDate)}</small>
                    </td>
                    <td>
                      <div>{b.dropLocation}</div>
                      <small className="text-muted">{formatDate(b.returnDate)}</small>
                    </td>
                    <td className="fw-bold">{formatCurrency(b.totalAmount)}</td>
                    <td>
                      <span className={`rc-badge ${getStatusBadgeClass(b.paymentStatus)}`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`rc-badge ${getStatusBadgeClass(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>{formatDate(b.createdAt)}</td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setSelectedBooking(b)}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BOOKING DETAILS MODAL */}
      {selectedBooking && (
        <div
          className="modal d-block"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  Booking {selectedBooking.bookingReference}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedBooking(null)}
                ></button>
              </div>
              <div className="modal-body small d-flex flex-column gap-2">
                <div><strong>Customer:</strong> {selectedBooking.userName} ({selectedBooking.userEmail})</div>
                <div><strong>Car:</strong> {selectedBooking.carName}</div>
                <div><strong>Pickup:</strong> {selectedBooking.pickupLocation} on {formatDate(selectedBooking.pickupDate)}</div>
                <div><strong>Return:</strong> {selectedBooking.dropLocation} on {formatDate(selectedBooking.returnDate)}</div>
                <div><strong>Base Amount:</strong> {formatCurrency(selectedBooking.baseAmount)}</div>
                <div><strong>Extras:</strong> {formatCurrency(selectedBooking.extraAmount)}</div>
                <div><strong>Discount:</strong> -{formatCurrency(selectedBooking.discountAmount)}</div>
                <div><strong>Tax:</strong> {formatCurrency(selectedBooking.taxAmount)}</div>
                <div className="fs-6"><strong>Total Amount:</strong> {formatCurrency(selectedBooking.totalAmount)}</div>
                <div><strong>Status:</strong> {selectedBooking.status}</div>
                <div><strong>Payment:</strong> {selectedBooking.paymentStatus} ({selectedBooking.transactionId || 'N/A'})</div>
              </div>
              <div className="modal-footer justify-content-between">
                <div className="d-flex gap-2">
                  {selectedBooking.status === 'CONFIRMED' && (
                    <button
                      type="button"
                      className="btn btn-success btn-sm"
                      onClick={() => handleStatusUpdate(selectedBooking.id, 'COMPLETED')}
                    >
                      Mark Completed
                    </button>
                  )}
                  {(selectedBooking.status === 'CONFIRMED' || selectedBooking.status === 'PENDING') && (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleStatusUpdate(selectedBooking.id, 'CANCELLED')}
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedBooking(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBookings;
