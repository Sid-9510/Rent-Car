import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatCurrency, getStatusBadgeClass } from '../../utils/formatters';

const INITIAL_FORM = {
  brand: '',
  model: '',
  year: 2025,
  category: 'SUV',
  fuelType: 'PETROL',
  transmission: 'AUTOMATIC',
  seats: 5,
  doors: 5,
  luggageCapacity: 4,
  pricePerDay: '',
  location: 'Ahmedabad',
  description: '',
  imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80',
  status: 'AVAILABLE',
};

const ManageCars = () => {
  const { showToast } = useAuth();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  const loadCars = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllCars();
      setCars(data);
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to load cars.', 'danger');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadCars();
  }, [loadCars]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setShowModal(true);
  };

  const handleOpenEdit = (car) => {
    setEditingId(car.id);
    setFormData({
      brand: car.brand,
      model: car.model,
      year: car.year,
      category: car.category,
      fuelType: car.fuelType,
      transmission: car.transmission,
      seats: car.seats,
      doors: car.doors,
      luggageCapacity: car.luggageCapacity,
      pricePerDay: car.pricePerDay,
      location: car.location,
      description: car.description || '',
      imageUrl: car.imageUrl || '',
      status: car.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...formData,
        year: Number(formData.year),
        seats: Number(formData.seats),
        doors: Number(formData.doors),
        luggageCapacity: Number(formData.luggageCapacity),
        pricePerDay: Number(formData.pricePerDay),
      };
      if (editingId) {
        await adminService.updateCar(editingId, payload);
        showToast('Car updated successfully!', 'success');
      } else {
        await adminService.addCar(payload);
        showToast('New car added to RentCar inventory!', 'success');
      }
      setShowModal(false);
      loadCars();
    } catch (err) {
      showToast(err.friendlyMessage || 'Could not save car.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOrDeactivate = async (car) => {
    try {
      const res = await adminService.deleteCar(car.id);
      showToast(res.message || 'Car updated.', 'info');
      loadCars();
    } catch (err) {
      showToast(err.friendlyMessage || 'Could not delete/deactivate car.', 'danger');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Manage Cars</h3>
          <p className="text-muted small mb-0">
            Add, edit, or deactivate vehicles in the RentCar fleet
          </p>
        </div>
        <button className="btn btn-rc-primary" onClick={handleOpenAdd}>
          <i className="bi bi-plus-lg me-1"></i> ADD CAR
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading fleet inventory..." />
      ) : (
        <div className="rc-card overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Image</th>
                  <th>Brand</th>
                  <th>Model</th>
                  <th>Category</th>
                  <th>Price / Day</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car) => (
                  <tr key={car.id}>
                    <td className="fw-bold">#{car.id}</td>
                    <td>
                      <img
                        src={car.imageUrl}
                        alt={car.model}
                        className="rounded"
                        style={{ width: '64px', height: '42px', objectFit: 'cover' }}
                      />
                    </td>
                    <td className="fw-semibold">{car.brand}</td>
                    <td>
                      {car.model} <span className="text-muted">({car.year})</span>
                    </td>
                    <td>
                      <span className="badge bg-secondary-subtle text-secondary">
                        {car.category}
                      </span>
                    </td>
                    <td className="fw-bold">{formatCurrency(car.pricePerDay)}</td>
                    <td>{car.location}</td>
                    <td>
                      <span className={`rc-badge ${getStatusBadgeClass(car.status)}`}>
                        {car.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        <Link
                          to={`/cars/${car.id}`}
                          className="btn btn-sm btn-outline-secondary"
                          title="View Details"
                        >
                          VIEW
                        </Link>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleOpenEdit(car)}
                        >
                          EDIT
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteOrDeactivate(car)}
                        >
                          DELETE/DEACTIVATE
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

      {/* ADD / EDIT CAR MODAL */}
      {showModal && (
        <div
          className="modal d-block"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {editingId ? `Edit Car #${editingId}` : 'Add New Car'}
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
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Brand *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Model *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Year *</label>
                      <input
                        type="number"
                        className="form-control"
                        min="2005"
                        max="2027"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Category *</label>
                      <select
                        className="form-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        {['HATCHBACK', 'SEDAN', 'SUV', 'LUXURY', 'SPORTS'].map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Fuel Type *</label>
                      <select
                        className="form-select"
                        value={formData.fuelType}
                        onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                      >
                        {['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID'].map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Transmission *</label>
                      <select
                        className="form-select"
                        value={formData.transmission}
                        onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                      >
                        {['AUTOMATIC', 'MANUAL'].map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-semibold">Seats *</label>
                      <input
                        type="number"
                        className="form-control"
                        min="2"
                        max="12"
                        value={formData.seats}
                        onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small fw-semibold">Doors *</label>
                      <input
                        type="number"
                        className="form-control"
                        min="2"
                        max="6"
                        value={formData.doors}
                        onChange={(e) => setFormData({ ...formData, doors: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small fw-semibold">Luggage (Bags) *</label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        max="10"
                        value={formData.luggageCapacity}
                        onChange={(e) =>
                          setFormData({ ...formData, luggageCapacity: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small fw-semibold">Price / Day (₹) *</label>
                      <input
                        type="number"
                        className="form-control"
                        min="100"
                        step="50"
                        value={formData.pricePerDay}
                        onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Location *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Status *</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        {['AVAILABLE', 'MAINTENANCE', 'INACTIVE'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Image URL</label>
                      <input
                        type="url"
                        className="form-control"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Description</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      ></textarea>
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
                  <button type="submit" className="btn btn-rc-primary" disabled={saving}>
                    {saving ? 'Saving...' : editingId ? 'Update Car' : 'Add Car'}
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

export default ManageCars;
