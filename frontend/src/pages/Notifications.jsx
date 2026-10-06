import React, { useEffect, useState, useCallback } from 'react';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDateTime } from '../utils/formatters';

const Notifications = () => {
  const { refreshUserExtras, showToast } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userService.getNotifications();
      setNotifications(data);
    } catch {
      // Handled gracefully
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await userService.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      refreshUserExtras();
    } catch {
      showToast('Could not update notification.', 'danger');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await userService.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      refreshUserExtras();
      showToast('All notifications marked as read.', 'success');
    } catch {
      showToast('Could not mark notifications as read.', 'danger');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'BOOKING':
        return 'bi-calendar2-check-fill text-primary';
      case 'PAYMENT':
        return 'bi-credit-card-fill text-success';
      case 'REVIEW':
        return 'bi-star-fill text-warning';
      default:
        return 'bi-bell-fill text-info';
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: '800px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Notifications</h3>
          <p className="text-muted small mb-0">
            Stay updated on your RentCar bookings, payments, and alerts
          </p>
        </div>
        {notifications.some((n) => !n.read) && (
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={handleMarkAllRead}
          >
            <i className="bi bi-check2-all me-1"></i> Mark All as Read
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner message="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <div className="rc-card p-5 text-center">
          <i className="bi bi-bell-slash fs-1 text-muted"></i>
          <h5 className="fw-bold mt-3">No notifications yet</h5>
          <p className="text-muted small mb-0">
            We&apos;ll notify you here when your bookings or payments are updated.
          </p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`rc-card p-3 d-flex align-items-start justify-content-between gap-3 ${
                !n.read ? 'border-primary bg-primary-subtle bg-opacity-10' : ''
              }`}
            >
              <div className="d-flex align-items-start gap-3">
                <div className="fs-4 mt-1">
                  <i className={`bi ${getIcon(n.type)}`}></i>
                </div>
                <div>
                  <div className={`${!n.read ? 'fw-bold text-dark' : 'text-secondary'}`}>
                    {n.message}
                  </div>
                  <small className="text-muted">{formatDateTime(n.createdAt)}</small>
                </div>
              </div>

              {!n.read && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary text-nowrap"
                  onClick={() => handleMarkAsRead(n.id)}
                >
                  Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
