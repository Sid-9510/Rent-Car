import api from '../utils/api';

const paymentService = {
  processPayment: async (payload) => {
    const res = await api.post('/payments', payload);
    return res.data.data;
  },

  getPaymentById: async (id) => {
    const res = await api.get(`/payments/${id}`);
    return res.data.data;
  },

  getPaymentByBookingId: async (bookingId) => {
    const res = await api.get(`/payments/booking/${bookingId}`);
    return res.data.data;
  },
};

export default paymentService;
