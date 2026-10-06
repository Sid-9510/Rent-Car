import api from '../utils/api';

const userService = {
  getProfile: async () => {
    const res = await api.get('/users/me');
    return res.data.data;
  },

  updateProfile: async (payload) => {
    const res = await api.put('/users/me', payload);
    return res.data.data;
  },

  changePassword: async (payload) => {
    const res = await api.put('/users/change-password', payload);
    return res.data;
  },

  getFavorites: async () => {
    const res = await api.get('/favorites');
    return res.data.data || [];
  },

  addFavorite: async (carId) => {
    const res = await api.post(`/favorites/${carId}`);
    return res.data.data;
  },

  removeFavorite: async (carId) => {
    const res = await api.delete(`/favorites/${carId}`);
    return res.data;
  },

  getNotifications: async () => {
    const res = await api.get('/notifications');
    return res.data.data || [];
  },

  markNotificationAsRead: async (id) => {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data.data;
  },

  markAllNotificationsAsRead: async () => {
    const res = await api.put('/notifications/read-all');
    return res.data;
  },
};

export default userService;
