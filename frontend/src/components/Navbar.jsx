import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, unreadNotifications, logout } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    setExpanded(false);
    logout();
    navigate('/login');
  };

  const closeMenu = () => setExpanded(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark rc-navbar sticky-top py-3 no-print">
      <div className="container">
        <Link className="navbar-brand rc-brand" to={isAdmin ? '/admin/dashboard' : '/'} onClick={closeMenu}>
          <span className="rc-brand-badge">
            <i className="bi bi-car-front-fill"></i>
          </span>
          <span>{isAdmin ? 'RentCar Admin' : 'RentCar'}</span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${expanded ? 'show' : ''}`}>
          {isAdmin ? (
            /* ADMIN NAVBAR */
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3 gap-lg-1">
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin/dashboard" onClick={closeMenu}>
                  Dashboard
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin/cars" onClick={closeMenu}>
                  Cars
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin/users" onClick={closeMenu}>
                  Users
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin/bookings" onClick={closeMenu}>
                  Bookings
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin/payments" onClick={closeMenu}>
                  Payments
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin/coupons" onClick={closeMenu}>
                  Coupons
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin/maintenance" onClick={closeMenu}>
                  Maintenance
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin/reviews" onClick={closeMenu}>
                  Reviews
                </NavLink>
              </li>
            </ul>
          ) : (
            /* CUSTOMER & PUBLIC NAVBAR */
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-lg-2">
              <li className="nav-item">
                <NavLink className="nav-link" to="/" end onClick={closeMenu}>
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/cars" onClick={closeMenu}>
                  Cars
                </NavLink>
              </li>
              {isAuthenticated && (
                <>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/my-bookings" onClick={closeMenu}>
                      My Bookings
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/favorites" onClick={closeMenu}>
                      Favorites
                    </NavLink>
                  </li>
                </>
              )}
              <li className="nav-item">
                <NavLink className="nav-link" to="/about" onClick={closeMenu}>
                  About
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/contact" onClick={closeMenu}>
                  Contact
                </NavLink>
              </li>
            </ul>
          )}

          {/* RIGHT SIDE ACTIONS */}
          <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0">
            {isAuthenticated ? (
              <>
                <Link
                  to="/notifications"
                  className="btn btn-outline-light btn-sm position-relative border-0 px-2"
                  onClick={closeMenu}
                  title="Notifications"
                >
                  <i className="bi bi-bell-fill fs-5"></i>
                  {unreadNotifications > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {unreadNotifications}
                    </span>
                  )}
                </Link>

                <Link
                  to="/profile"
                  className="btn btn-outline-light btn-sm d-flex align-items-center gap-2 rounded-pill px-3"
                  onClick={closeMenu}
                >
                  <i className="bi bi-person-circle"></i>
                  <span className="fw-medium">{user?.name?.split(' ')[0] || 'Profile'}</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-danger btn-sm rounded-pill px-3 fw-semibold"
                >
                  <i className="bi bi-box-arrow-right me-1"></i> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn btn-outline-light btn-sm px-3 rounded-pill fw-semibold"
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-rc-primary btn-sm px-3 rounded-pill fw-semibold"
                  onClick={closeMenu}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
