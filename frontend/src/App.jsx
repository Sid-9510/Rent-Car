import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Cars from './pages/Cars';
import CarDetails from './pages/CarDetails';
import About from './pages/About';
import Contact from './pages/Contact';

// Authenticated User Pages
import Profile from './pages/Profile';
import Booking from './pages/Booking';
import BookingConfirmation from './pages/BookingConfirmation';
import MyBookings from './pages/MyBookings';
import BookingDetails from './pages/BookingDetails';
import Favorites from './pages/Favorites';
import Notifications from './pages/Notifications';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageCars from './pages/admin/ManageCars';
import ManageUsers from './pages/admin/ManageUsers';
import ManageBookings from './pages/admin/ManageBookings';
import ManagePayments from './pages/admin/ManagePayments';
import ManageCoupons from './pages/admin/ManageCoupons';
import ManageReviews from './pages/admin/ManageReviews';
import ManageMaintenance from './pages/admin/ManageMaintenance';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Navbar />
          <main className="flex-grow-1 d-flex flex-column">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/cars" element={<Cars />} />
              <Route path="/cars/:id" element={<CarDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />

              {/* Authenticated Customer Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/booking/:carId"
                element={
                  <ProtectedRoute>
                    <Booking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/booking-confirmation/:id"
                element={
                  <ProtectedRoute>
                    <BookingConfirmation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <MyBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings/:id"
                element={
                  <ProtectedRoute>
                    <BookingDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/favorites"
                element={
                  <ProtectedRoute>
                    <Favorites />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/cars"
                element={
                  <AdminRoute>
                    <ManageCars />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <ManageUsers />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/bookings"
                element={
                  <AdminRoute>
                    <ManageBookings />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/payments"
                element={
                  <AdminRoute>
                    <ManagePayments />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/coupons"
                element={
                  <AdminRoute>
                    <ManageCoupons />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/reviews"
                element={
                  <AdminRoute>
                    <ManageReviews />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/maintenance"
                element={
                  <AdminRoute>
                    <ManageMaintenance />
                  </AdminRoute>
                }
              />

              {/* Catch-all Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
