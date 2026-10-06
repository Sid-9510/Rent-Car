import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register, showToast } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      return 'Full Name must be at least 2 characters.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      return 'Please enter a valid email address.';
    }
    const phoneRegex = /^[+]?[0-9\s-]{10,15}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      return 'Please enter a valid 10-digit phone number.';
    }
    if (!formData.password || formData.password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Password and Confirm Password do not match.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      showToast('Account created successfully! Welcome to RentCar.', 'success');
      navigate('/');
    } catch (err) {
      setError(err.friendlyMessage || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 my-auto">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-5">
          <div className="rc-card p-4 p-md-5">
            <div className="text-center mb-4">
              <span className="rc-brand-badge d-inline-block mb-2">
                <i className="bi bi-car-front-fill"></i>
              </span>
              <h3 className="fw-bold mb-1">Create RentCar Account</h3>
              <p className="text-muted small mb-0">Rent. Drive. Explore.</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold">Password *</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-control"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-rc-primary w-100 py-2 mt-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Creating Account...
                  </>
                ) : (
                  'REGISTER'
                )}
              </button>
            </form>

            <div className="text-center mt-4 pt-3 border-top">
              <span className="text-muted small">Already have an account? </span>
              <Link to="/login" className="small fw-bold text-decoration-none">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
