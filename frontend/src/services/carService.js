import api from '../utils/api';

const carService = {
  getCars: async (params = {}) => {
    const cleanParams = {};
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'ALL') {
        cleanParams[k] = v;
      }
    });
    const res = await api.get('/cars', { params: cleanParams });
    return res.data.data || [];
  },

  getCarById: async (id, params = {}) => {
    const res = await api.get(`/cars/${id}`, { params });
    return res.data.data;
  },

  getCarReviews: async (carId) => {
    const res = await api.get(`/cars/${carId}/reviews`);
    return res.data.data || [];
  },

  addCarReview: async (carId, payload) => {
    const res = await api.post(`/cars/${carId}/reviews`, payload);
    return res.data.data;
  },

  getPublicReviews: async () => {
    const res = await api.get('/reviews/public');
    return res.data.data || [];
  },
};

export default carService;
