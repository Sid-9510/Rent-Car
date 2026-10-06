import React, { useEffect, useState, useCallback } from 'react';
import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../utils/formatters';

const INITIAL_COUPON = {
  code: '',
  discountType: 'PERCENTAGE',
  discountValue: 10,
  minimumBookingAmount: 2000,
  expiryDate: '2027-03-31',
  usageLimit: 100,
  status: 'ACTIVE',
};

const ManageCoupons = () => {
  const { showToast } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_COUPON);

  const loadCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllCoupons();
      setCoupons(data);
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to load coupons.', 'danger');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(INITIAL_COUPON);
    setShowModal(true);
  };

  const handleOpenEdit = (c) => {
    setEditingId(c.id);
    setFormData({
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue,
      minimumBookingAmount: c.minimumBookingAmount,
      expiryDate: c.expiryDate,
      usageLimit: c.usageLimit,
      status: c.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        discountValue: Number(formData.discountValue),
        minimumBookingAmount: Number(formData.minimumBookingAmount),
        usageLimit: Number(formData.usageLimit),
      };
      if (editingId) {
        await adminService.updateCoupon(editingId, payload);
        showToast('Coupon updated successfully!', 'success');
      } else {
        await adminService.createCoupon(payload);
        showToast('Coupon created successfully!', 'success');
      }
      setShowModal(false);
      loadCoupons();
    } catch (err) {
      showToast(err.friendlyMessage || 'Could not save coupon.', 'danger');
    }
  };

  const handleDeleteOrDeactivate = async (id) => {
    try {
      const res = await adminService.deleteCoupon(id);
      showToast(res.message || 'Coupon updated.', 'info');
      loadCoupons();
    } catch (err) {
      showToast(err.friendlyMessage || 'Action failed.', 'danger');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Manage Coupons</h3>
          <p className="text-muted small mb-0">
            Create promotional discount codes and manage usage limits
          </p>
        </div>
        <button className="btn btn-rc-primary" onClick={handleOpenAdd}>
          <i className="bi bi-plus-lg me-1"></i> CREATE COUPON
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading coupons..." />
      ) : (
        <div className="rc-card overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th>Code</th>
                  <th>Discount Type</th>
                  <th>Discount Value</th>
                  <th>Minimum Amount</th>
                  <th>Expiry</th>
                  <th>Usage</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id}>
                    <td className="font-monospace fw-bold text-primary">{c.code}</td>
                    <td>{c.discountType}</td>
                    <td className="fw-bold">
                      {c.discountType === 'PERCENTAGE'
                        ? `${c.discountValue}%`
                        : formatCurrency(c.discountValue)}
                    </td>
                    <td>{formatCurrency(c.minimumBookingAmount)}</td>
                    <td>{formatDate(c.expiryDate)}</td>
                    <td>
                      {c.usedCount} / {c.usageLimit}
                    </td>
                    <td>
                      <span className={`rc-badge ${getStatusBadgeClass(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleOpenEdit(c)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteOrDeactivate(c.id)}
                        >
                          {c.usedCount > 0 ? 'Deactivate' : 'Delete'}
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

      {/* MODAL */}
      {showModal && (
        <div
          className="modal d-block"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {editingId ? 'Edit Coupon' : 'Create Coupon'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Coupon Code *</label>
                      <input
                        type="text"
                        className="form-control text-uppercase"
                        placeholder="e.g. WELCOME20"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Discount Type *</label>
                      <select
                        className="form-select"
                        value={formData.discountType}
                        onChange={(e) =>
                          setFormData({ ...formData, discountType: e.target.value })
                        }
                      >
                        <option value="PERCENTAGE">PERCENTAGE (%)</option>
                        <option value="FIXED">FIXED (₹)</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Discount Value *</label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        value={formData.discountValue}
                        onChange={(e) =>
                          setFormData({ ...formData, discountValue: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Minimum Booking Amount (₹) *</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        value={formData.minimumBookingAmount}
                        onChange={(e) =>
                          setFormData({ ...formData, minimumBookingAmount: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Expiry Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.expiryDate}
                        onChange={(e) =>
                          setFormData({ ...formData, expiryDate: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Usage Limit *</label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        value={formData.usageLimit}
                        onChange={(e) =>
                          setFormData({ ...formData, usageLimit: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Status</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-rc-primary">
                    Save Coupon
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCoupons;
