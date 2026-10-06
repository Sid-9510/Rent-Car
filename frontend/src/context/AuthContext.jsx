import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';
import {
  getToken,
  setToken,
  getStoredUser,
  setStoredUser,
  clearAuthStorage,
} from '../utils/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setTokenState] = useState(() => getToken());
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshUserExtras = useCallback(async () => {
    if (!getToken()) {
      setFavoriteIds([]);
      setUnreadNotifications(0);
      return;
    }
    try {
      const [favs, notes] = await Promise.all([
        userService.getFavorites(),
        userService.getNotifications(),
      ]);
      setFavoriteIds(favs.map((c) => c.id));
      setUnreadNotifications(notes.filter((n) => !n.read).length);
    } catch {
      // Ignore background sync errors
    }
  }, []);

  useEffect(() => {
    if (token && user) {
      refreshUserExtras();
    }
  }, [token, user, refreshUserExtras]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setTokenState(null);
      setFavoriteIds([]);
      setUnreadNotifications(0);
    };
    window.addEventListener('rentcar-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('rentcar-unauthorized', handleUnauthorized);
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    const jwt = data.token || data.data?.token;
    const loggedInUser = data.user || data.data?.user;
    setToken(jwt);
    setStoredUser(loggedInUser);
    setTokenState(jwt);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (payload) => {
    const data = await authService.register(payload);
    const jwt = data.token || data.data?.token;
    const registeredUser = data.user || data.data?.user;
    setToken(jwt);
    setStoredUser(registeredUser);
    setTokenState(jwt);
    setUser(registeredUser);
    return registeredUser;
  };

  const logout = () => {
    clearAuthStorage();
    setUser(null);
    setTokenState(null);
    setFavoriteIds([]);
    setUnreadNotifications(0);
    showToast('Logged out of RentCar successfully.', 'info');
  };

  const updateUserState = (updatedUser) => {
    setStoredUser(updatedUser);
    setUser(updatedUser);
  };

  const toggleFavoriteCar = async (carId) => {
    if (!token) {
      showToast('Please login to save cars to your favorites.', 'warning');
      return false;
    }
    try {
      if (favoriteIds.includes(carId)) {
        await userService.removeFavorite(carId);
        setFavoriteIds((prev) => prev.filter((id) => id !== carId));
        showToast('Removed from favorites.', 'info');
      } else {
        await userService.addFavorite(carId);
        setFavoriteIds((prev) => [...prev, carId]);
        showToast('Added to your favorites!', 'success');
      }
      return true;
    } catch (err) {
      showToast(err.friendlyMessage || 'Could not update favorites.', 'danger');
      return false;
    }
  };

  const isAuthenticated = Boolean(token && user);
  const isAdmin = Boolean(
    user && (user.role === 'ADMIN' || user.role === 'ROLE_ADMIN')
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        favoriteIds,
        unreadNotifications,
        login,
        register,
        logout,
        updateUserState,
        toggleFavoriteCar,
        refreshUserExtras,
        showToast,
      }}
    >
      {children}
      {/* Global Toast Notification Container */}
      <div className="rc-toast-container no-print">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`alert alert-${
              t.type === 'danger'
                ? 'danger'
                : t.type === 'warning'
                ? 'warning'
                : t.type === 'info'
                ? 'primary'
                : 'success'
            } shadow-sm d-flex align-items-center justify-content-between py-2 px-3 mb-0 border-0 rounded-3`}
            role="alert"
          >
            <div className="d-flex align-items-center gap-2 small fw-medium">
              <i
                className={`bi ${
                  t.type === 'danger'
                    ? 'bi-exclamation-octagon-fill'
                    : t.type === 'warning'
                    ? 'bi-exclamation-triangle-fill'
                    : 'bi-check-circle-fill'
                }`}
              ></i>
              <span>{t.message}</span>
            </div>
            <button
              type="button"
              className="btn-close ms-3"
              style={{ fontSize: '0.65rem' }}
              onClick={() => dismissToast(t.id)}
            ></button>
          </div>
        ))}
      </div>
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
