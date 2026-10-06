import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, showToast } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const loggedInUser = await login({ email: email.trim(), password });
      showToast(`Welcome back, ${loggedInUser.name}!`, 'success');

      if (loggedInUser.role === 'ADMIN' || loggedInUser.role === 'ROLE_ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        const redirectTo = location.state?.from?.pathname || '/';
        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      setError(err.friendlyMessage || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 my-auto">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="rc-card p-4 p-md-5">
            <div className="text-center mb-4">
              <span className="rc-brand-badge d-inline-block mb-2">
                <i className="bi bi-car-front-fill"></i>
              </span>
              <h3 className="fw-bold mb-1">Welcome to RentCar</h3>
              <p className="text-muted small mb-0">Sign in to manage your bookings and rentals</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <label className="form-label small fw-semibold mb-1">Password</label>
                  <Link to="/forgot-password" className="small text-decoration-none">
                    Forgot Password?
                  </Link>
                </div>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                    Signing in...
                  </>
                ) : (
                  'LOGIN'
                )}
              </button>
            </form>

            <div className="text-center mt-4 pt-3 border-top">
              <span className="text-muted small">Don&apos;t have an account? </span>
              <Link to="/register" className="small fw-bold text-decoration-none">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
