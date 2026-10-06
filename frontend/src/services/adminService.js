import api from '../utils/api';

const adminService = {
  getDashboard: async () => {
    const res = await api.get('/admin/dashboard');
    return res.data.data;
  },

  // Cars
  getAllCars: async () => {
    const res = await api.get('/admin/cars');
    return res.data.data || [];
  },

  addCar: async (payload) => {
    const res = await api.post('/admin/cars', payload);
    return res.data;
  },

  updateCar: async (id, payload) => {
    const res = await api.put(`/admin/cars/${id}`, payload);
    return res.data;
  },

  deleteCar: async (id) => {
    const res = await api.delete(`/admin/cars/${id}`);
    return res.data;
  },

  // Users
  getAllUsers: async () => {
    const res = await api.get('/admin/users');
    return res.data.data || [];
  },

  updateUserStatus: async (id, status) => {
    const res = await api.put(`/admin/users/${id}/status`, { status });
    return res.data;
  },

  // Bookings
  getAllBookings: async (params = {}) => {
    const cleanParams = {};
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'ALL') {
        cleanParams[k] = v;
      }
    });
    const res = await api.get('/admin/bookings', { params: cleanParams });
    return res.data.data || [];
  },

  updateBookingStatus: async (id, status) => {
    const res = await api.put(`/admin/bookings/${id}/status`, { status });
    return res.data;
  },

  // Payments
  getAllPayments: async (status) => {
    const params = status && status !== 'ALL' ? { status } : {};
    const res = await api.get('/admin/payments', { params });
    return res.data.data || [];
  },

  // Coupons
  getAllCoupons: async () => {
    const res = await api.get('/admin/coupons');
    return res.data.data || [];
  },

  createCoupon: async (payload) => {
    const res = await api.post('/admin/coupons', payload);
    return res.data;
  },

  updateCoupon: async (id, payload) => {
    const res = await api.put(`/admin/coupons/${id}`, payload);
    return res.data;
  },

  deleteCoupon: async (id) => {
    const res = await api.delete(`/admin/coupons/${id}`);
    return res.data;
  },

  // Maintenance
  getAllMaintenance: async () => {
    const res = await api.get('/admin/maintenance');
    return res.data.data || [];
  },

  scheduleMaintenance: async (payload) => {
    const res = await api.post('/admin/maintenance', payload);
    return res.data;
  },

  updateMaintenance: async (id, payload) => {
    const res = await api.put(`/admin/maintenance/${id}`, payload);
    return res.data;
  },

  updateMaintenanceStatus: async (id, status) => {
    const res = await api.patch(`/admin/maintenance/${id}/status`, { status });
    return res.data;
  },

  // Reviews
  getAllReviews: async () => {
    const res = await api.get('/admin/reviews');
    return res.data.data || [];
  },

  deleteReview: async (id) => {
    const res = await api.delete(`/admin/reviews/${id}`);
    return res.data;
  },
};

export default adminService;
