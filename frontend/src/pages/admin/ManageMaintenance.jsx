import React, { useEffect, useState, useCallback } from 'react';
import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../utils/formatters';

const ManageMaintenance = () => {
  const { showToast } = useAuth();
  const [records, setRecords] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    carId: '',
    description: '',
    maintenanceDate: new Date().toISOString().split('T')[0],
    cost: '',
    status: 'SCHEDULED',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [maintData, carsData] = await Promise.all([
        adminService.getAllMaintenance(),
        adminService.getAllCars(),
      ]);
      setRecords(maintData);
      setCars(carsData);
      if (carsData.length > 0 && !formData.carId) {
        setFormData((prev) => ({ ...prev, carId: carsData[0].id }));
      }
    } catch (err) {
      showToast(err.friendlyMessage || 'Could not load maintenance logs.', 'danger');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminService.scheduleMaintenance({
        carId: Number(formData.carId),
        description: formData.description.trim(),
        maintenanceDate: formData.maintenanceDate,
        cost: Number(formData.cost),
        status: formData.status,
      });
      showToast('Maintenance scheduled and car status synchronized!', 'success');
      setShowModal(false);
      setFormData((prev) => ({ ...prev, description: '', cost: '' }));
      loadData();
    } catch (err) {
      showToast(err.friendlyMessage || 'Could not schedule maintenance.', 'danger');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await adminService.updateMaintenanceStatus(id, status);
      showToast(`Maintenance status updated to ${status}.`, 'success');
      loadData();
    } catch (err) {
      showToast(err.friendlyMessage || 'Update failed.', 'danger');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Manage Vehicle Maintenance</h3>
          <p className="text-muted small mb-0">
            Schedule service tasks. Cars under active maintenance are automatically blocked from booking.
          </p>
        </div>
        <button className="btn btn-rc-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-tools me-1"></i> SCHEDULE MAINTENANCE
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading maintenance records..." />
      ) : (
        <div className="rc-card overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Car</th>
                  <th>Maintenance Description</th>
                  <th>Date</th>
                  <th>Cost</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((m) => (
                  <tr key={m.id}>
                    <td className="fw-bold">#{m.id}</td>
                    <td className="fw-semibold">{m.carName}</td>
                    <td>{m.description}</td>
                    <td>{formatDate(m.maintenanceDate)}</td>
                    <td className="fw-bold">{formatCurrency(m.cost)}</td>
                    <td>
                      <span className={`rc-badge ${getStatusBadgeClass(m.status)}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        {m.status === 'SCHEDULED' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => handleStatusChange(m.id, 'IN_PROGRESS')}
                          >
                            Start Service
                          </button>
                        )}
                        {m.status !== 'COMPLETED' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            onClick={() => handleStatusChange(m.id, 'COMPLETED')}
                          >
                            Complete Maintenance
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SCHEDULE MODAL */}
      {showModal && (
        <div
          className="modal d-block"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Schedule Vehicle Maintenance</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleScheduleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Select Car *</label>
                    <select
                      className="form-select"
                      value={formData.carId}
                      onChange={(e) => setFormData({ ...formData, carId: e.target.value })}
                      required
                    >
                      {cars.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.brand} {c.model} ({c.location})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Maintenance Description *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Oil Change, Brake Inspection"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.maintenanceDate}
                        onChange={(e) =>
                          setFormData({ ...formData, maintenanceDate: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Estimated Cost (₹) *</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        placeholder="4500"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Initial Status</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="SCHEDULED">SCHEDULED</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
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
                    Save Maintenance
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

export default ManageMaintenance;
