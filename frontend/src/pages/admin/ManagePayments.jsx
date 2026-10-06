import React, { useEffect, useState, useCallback } from 'react';
import adminService from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatCurrency, formatDateTime, getStatusBadgeClass } from '../../utils/formatters';

const ManagePayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllPayments(statusFilter);
      setPayments(data);
    } catch {
      // Handled gracefully
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Payment Transactions</h3>
          <p className="text-muted small mb-0">
            Track simulated payments, methods, and refund statuses
          </p>
        </div>

        <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
          <label className="small text-muted mb-0">Status:</label>
          <select
            className="form-select form-select-sm"
            style={{ width: '160px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Payments</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILED">FAILED</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading payment records..." />
      ) : (
        <div className="rc-card overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th>Transaction ID</th>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="font-monospace fw-bold">{p.transactionId}</td>
                    <td className="font-monospace text-primary">{p.bookingReference}</td>
                    <td>
                      <div className="fw-semibold">{p.customerName}</div>
                      <small className="text-muted">{p.customerEmail}</small>
                    </td>
                    <td className="fw-bold">{formatCurrency(p.amount)}</td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td>
                      <span className={`rc-badge ${getStatusBadgeClass(p.paymentStatus)}`}>
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td>{formatDateTime(p.paymentDate)}</td>
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

export default ManagePayments;
