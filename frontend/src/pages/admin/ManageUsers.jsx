import React, { useEffect, useState, useCallback } from 'react';
import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate, getStatusBadgeClass } from '../../utils/formatters';

const ManageUsers = () => {
  const { showToast } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to load users.', 'danger');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    try {
      await adminService.updateUserStatus(user.id, nextStatus);
      showToast(`User ${user.name} marked as ${nextStatus}.`, 'success');
      loadUsers();
    } catch (err) {
      showToast(err.friendlyMessage || 'Could not update user status.', 'danger');
    }
  };

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h3 className="fw-bold mb-1">Manage Users</h3>
        <p className="text-muted small mb-0">
          View registered customers and administrators, or block/unblock accounts
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading registered users..." />
      ) : (
        <div className="rc-card overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Registered Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="fw-bold">#{u.id}</td>
                    <td className="fw-semibold">{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone}</td>
                    <td>
                      <span
                        className={`badge ${
                          u.role === 'ADMIN'
                            ? 'bg-dark text-white'
                            : 'bg-primary-subtle text-primary'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`rc-badge ${getStatusBadgeClass(u.status)}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setSelectedUser(u)}
                        >
                          VIEW
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${
                            u.status === 'ACTIVE'
                              ? 'btn-outline-danger'
                              : 'btn-outline-success'
                          }`}
                          onClick={() => handleToggleStatus(u)}
                        >
                          {u.status === 'ACTIVE' ? 'BLOCK' : 'UNBLOCK'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW USER MODAL */}
      {selectedUser && (
        <div
          className="modal d-block"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">User Details (#{selectedUser.id})</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedUser(null)}
                ></button>
              </div>
              <div className="modal-body small d-flex flex-column gap-2">
                <div><strong>Name:</strong> {selectedUser.name}</div>
                <div><strong>Email:</strong> {selectedUser.email}</div>
                <div><strong>Phone:</strong> {selectedUser.phone}</div>
                <div><strong>Role:</strong> {selectedUser.role}</div>
                <div><strong>Status:</strong> {selectedUser.status}</div>
                <div><strong>Address:</strong> {selectedUser.address || '—'}</div>
                <div><strong>Driving License:</strong> {selectedUser.drivingLicenseNumber || '—'}</div>
                <div><strong>Registered:</strong> {formatDate(selectedUser.createdAt)}</div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedUser(null)}
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

export default ManageUsers;
