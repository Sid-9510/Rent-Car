import api from '../utils/api';

const bookingService = {
  calculatePrice: async (payload) => {
    const res = await api.post('/bookings/calculate-price', payload);
    return res.data.data;
  },

  checkAvailability: async (carId, pickupDate, returnDate) => {
    const res = await api.get('/bookings/check-availability', {
      params: { carId, pickupDate, returnDate },
    });
    return res.data.data;
  },

  createBooking: async (payload) => {
    const res = await api.post('/bookings', payload);
    return res.data.data;
  },

  getMyBookings: async () => {
    const res = await api.get('/bookings/my');
    return res.data.data || [];
  },

  getBookingById: async (id) => {
    const res = await api.get(`/bookings/${id}`);
    return res.data.data;
  },

  cancelBooking: async (id) => {
    const res = await api.put(`/bookings/${id}/cancel`);
    return res.data.data;
  },

  getActiveCoupons: async () => {
    const res = await api.get('/coupons/active');
    return res.data.data || [];
  },
};

export default bookingService;
