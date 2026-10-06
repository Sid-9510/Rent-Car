import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../utils/formatters';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getDashboard();
      setStats(data);
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to load admin dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) return <LoadingSpinner message="Loading RentCar analytics..." />;
  if (error || !stats) return <div className="container py-5"><ErrorMessage message={error} onRetry={loadDashboard} /></div>;

  const maxMonthlyRevenue = Math.max(
    ...(stats.monthlyRevenue?.map((m) => Number(m.revenue || 0)) || [1]),
    1
  );
  const maxMonthlyBookings = Math.max(
    ...(stats.monthlyBookings?.map((m) => Number(m.bookings || 0)) || [1]),
    1
  );

  const summaryCards = [
    { label: 'Total Users', val: stats.totalUsers, icon: 'bi-people-fill', color: 'primary' },
    { label: 'Total Cars', val: stats.totalCars, icon: 'bi-car-front-fill', color: 'dark' },
    { label: 'Available Cars', val: stats.availableCars, icon: 'bi-check-circle-fill', color: 'success' },
    { label: 'Maintenance Cars', val: stats.maintenanceCars, icon: 'bi-tools', color: 'warning' },
    { label: 'Total Bookings', val: stats.totalBookings, icon: 'bi-calendar2-range-fill', color: 'info' },
    { label: 'Active Bookings', val: stats.activeBookings, icon: 'bi-clock-history', color: 'primary' },
    { label: 'Completed Bookings', val: stats.completedBookings, icon: 'bi-patch-check-fill', color: 'success' },
    { label: 'Total Revenue', val: formatCurrency(stats.totalRevenue), icon: 'bi-currency-rupee', color: 'success' },
  ];

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <span className="text-primary fw-bold text-uppercase small">Admin Control Center</span>
          <h3 className="fw-bold mb-0">RentCar Dashboard &amp; Analytics</h3>
        </div>
        <div className="d-flex flex-wrap gap-2 mt-2 mt-md-0">
          <Link to="/admin/cars" className="btn btn-rc-primary btn-sm">
            <i className="bi bi-plus-circle me-1"></i> Manage Cars
          </Link>
          <Link to="/admin/bookings" className="btn btn-outline-dark btn-sm">
            Manage Bookings
          </Link>
        </div>
      </div>

      {/* 8 SUMMARY CARDS */}
      <div className="row g-3 mb-4">
        {summaryCards.map((c, idx) => (
          <div className="col-6 col-md-4 col-lg-3" key={idx}>
            <div className="rc-card p-3 h-100 d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small fw-medium">{c.label}</div>
                <div className="fs-4 fw-bold text-dark mt-1">{c.val}</div>
              </div>
              <div
                className={`bg-${c.color}-subtle text-${c.color} rounded-3 d-flex align-items-center justify-content-center`}
                style={{ width: '46px', height: '46px' }}
              >
                <i className={`bi ${c.icon} fs-4`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS ROW 1: MONTHLY REVENUE & MONTHLY BOOKINGS */}
      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="rc-card p-4 h-100">
            <h6 className="fw-bold mb-3">
              <i className="bi bi-bar-chart-fill text-primary me-2"></i>Monthly Revenue (Last 6 Months)
            </h6>
            <div className="d-flex align-items-end justify-content-between gap-2 pt-3" style={{ height: '210px' }}>
              {stats.monthlyRevenue?.map((item, idx) => {
                const heightPct = Math.max(
                  Math.round((Number(item.revenue) / maxMonthlyRevenue) * 100),
                  6
                );
                return (
                  <div
                    key={idx}
                    className="d-flex flex-column align-items-center flex-fill h-100 justify-content-end"
                  >
                    <small className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>
                      {Number(item.revenue) > 0 ? formatCurrency(item.revenue) : '₹0'}
                    </small>
                    <div
                      className="w-75 rounded-top bg-primary"
                      style={{ height: `${heightPct}%`, minHeight: '8px', transition: 'height 0.3s' }}
                      title={`${item.month}: ${formatCurrency(item.revenue)}`}
                    ></div>
                    <small className="text-secondary mt-2 fw-medium" style={{ fontSize: '0.72rem' }}>
                      {item.month}
                    </small>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="rc-card p-4 h-100">
            <h6 className="fw-bold mb-3">
              <i className="bi bi-graph-up-arrow text-success me-2"></i>Monthly Bookings
            </h6>
            <div className="d-flex align-items-end justify-content-between gap-2 pt-3" style={{ height: '210px' }}>
              {stats.monthlyBookings?.map((item, idx) => {
                const heightPct = Math.max(
                  Math.round((Number(item.bookings) / maxMonthlyBookings) * 100),
                  8
                );
                return (
                  <div
                    key={idx}
                    className="d-flex flex-column align-items-center flex-fill h-100 justify-content-end"
                  >
                    <small className="fw-bold text-dark mb-1" style={{ fontSize: '0.75rem' }}>
                      {item.bookings}
                    </small>
                    <div
                      className="w-75 rounded-top bg-success"
                      style={{ height: `${heightPct}%`, minHeight: '8px' }}
                    ></div>
                    <small className="text-secondary mt-2 fw-medium" style={{ fontSize: '0.72rem' }}>
                      {item.month}
                    </small>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS ROW 2: BOOKING STATUS & MOST RENTED CARS */}
      <div className="row g-4 mb-4">
        <div className="col-lg-5">
          <div className="rc-card p-4 h-100">
            <h6 className="fw-bold mb-3">
              <i className="bi bi-pie-chart-fill text-info me-2"></i>Booking Status Breakdown
            </h6>
            <div className="d-flex flex-column gap-3 mt-3">
              {stats.bookingStatusDistribution &&
                Object.entries(stats.bookingStatusDistribution).map(([status, count]) => {
                  const pct =
                    stats.totalBookings > 0
                      ? Math.round((Number(count) / stats.totalBookings) * 100)
                      : 0;
                  const barColor =
                    status === 'COMPLETED' || status === 'CONFIRMED'
                      ? 'bg-success'
                      : status === 'CANCELLED'
                      ? 'bg-danger'
                      : 'bg-warning';
                  return (
                    <div key={status}>
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="fw-semibold">{status}</span>
                        <span className="text-muted">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div
                          className={`progress-bar ${barColor}`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="rc-card p-4 h-100">
            <h6 className="fw-bold mb-3">
              <i className="bi bi-trophy-fill text-warning me-2"></i>Most Rented Cars
            </h6>
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead className="table-light small">
                  <tr>
                    <th>Car Model</th>
                    <th className="text-center">Total Bookings</th>
                    <th className="text-end">Revenue Generated</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {stats.mostRentedCars?.map((car, i) => (
                    <tr key={i}>
                      <td className="fw-semibold">{car.carName}</td>
                      <td className="text-center">
                        <span className="badge bg-primary-subtle text-primary">
                          {car.bookingsCount} rentals
                        </span>
                      </td>
                      <td className="text-end fw-bold">{formatCurrency(car.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT BOOKINGS */}
      <div className="rc-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold mb-0">Recent Bookings</h6>
          <Link to="/admin/bookings" className="btn btn-link btn-sm text-decoration-none p-0">
            View All &rarr;
          </Link>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 small">
            <thead className="table-light">
              <tr>
                <th>Booking Ref</th>
                <th>Customer</th>
                <th>Car</th>
                <th>Pickup Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentBookings?.map((b) => (
                <tr key={b.id}>
                  <td className="font-monospace fw-bold text-primary">{b.bookingReference}</td>
                  <td>{b.userName}</td>
                  <td className="fw-medium">{b.carName}</td>
                  <td>{formatDate(b.pickupDate)}</td>
                  <td className="fw-bold">{formatCurrency(b.totalAmount)}</td>
                  <td>
                    <span className={`rc-badge ${getStatusBadgeClass(b.status)}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
