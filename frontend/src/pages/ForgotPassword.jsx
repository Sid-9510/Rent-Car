import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }
    try {
      setLoading(true);
      const res = await authService.forgotPassword(email.trim());
      setMessage(res.message || 'Password reset instructions have been sent.');
      setSubmitted(true);
    } catch (err) {
      setError(err.friendlyMessage || 'Could not process request.');
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
              <i className="bi bi-key-fill fs-1 text-primary"></i>
              <h3 className="fw-bold mt-2 mb-1">Forgot Password</h3>
              <p className="text-muted small">
                Enter your registered email to receive password recovery instructions.
              </p>
            </div>

            {submitted ? (
              <div className="text-center">
                <div className="alert alert-success small">{message}</div>
                <Link to="/login" className="btn btn-rc-primary w-100 mt-2">
                  Return to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && <div className="alert alert-danger py-2 small">{error}</div>}
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Registered Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-rc-primary w-100 py-2"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <div className="text-center mt-3">
                  <Link to="/login" className="small text-decoration-none">
                    <i className="bi bi-arrow-left me-1"></i>Back to Login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
