import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Contact = () => {
  const { showToast } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    showToast('Thank you! Your message has been sent to RentCar Support.', 'success');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="container py-5">
      <div className="row g-4 justify-content-center">
        <div className="col-lg-5">
          <span className="text-primary fw-bold text-uppercase small">Get in Touch</span>
          <h2 className="fw-bold mb-3">Contact RentCar Support</h2>
          <p className="text-muted mb-4">
            Have questions about bookings, corporate rentals, coupons, or vehicle availability?
            Our team is available 24/7 to help you.
          </p>

          <div className="d-flex flex-column gap-3">
            <div className="rc-card p-3 d-flex align-items-center gap-3">
              <div className="bg-primary text-white rounded-3 p-3">
                <i className="bi bi-envelope-fill fs-5"></i>
              </div>
              <div>
                <div className="small text-muted">Email Support</div>
                <div className="fw-bold">support@rentcar.com</div>
              </div>
            </div>

            <div className="rc-card p-3 d-flex align-items-center gap-3">
              <div className="bg-primary text-white rounded-3 p-3">
                <i className="bi bi-telephone-fill fs-5"></i>
              </div>
              <div>
                <div className="small text-muted">24/7 Helpline</div>
                <div className="fw-bold">+91 98765 43210</div>
              </div>
            </div>

            <div className="rc-card p-3 d-flex align-items-center gap-3">
              <div className="bg-primary text-white rounded-3 p-3">
                <i className="bi bi-geo-alt-fill fs-5"></i>
              </div>
              <div>
                <div className="small text-muted">Headquarters</div>
                <div className="fw-bold">SG Highway, Ahmedabad, Gujarat 380054</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="rc-card p-4 p-md-5">
            <h4 className="fw-bold mb-3">Send Us a Message</h4>
            {submitted && (
              <div className="alert alert-success small">
                <i className="bi bi-check-circle-fill me-2"></i>
                We have received your inquiry and will respond within 2 business hours.
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Email *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Subject *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Booking Inquiry / Feedback"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Message *</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="How can we help you?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-rc-primary w-100 py-2">
                <i className="bi bi-send-fill me-2"></i> SEND MESSAGE
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
