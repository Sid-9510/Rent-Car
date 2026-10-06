import api from '../utils/api';

const authService = {
  register: async (payload) => {
    const res = await api.post('/auth/register', payload);
    return res.data;
  },

  login: async (payload) => {
    const res = await api.post('/auth/login', payload);
    return res.data;
  },

  forgotPassword: async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },
};

export default authService;
