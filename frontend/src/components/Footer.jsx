import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-light pt-5 pb-4 mt-auto no-print" style={{ backgroundColor: '#0f172a' }}>
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="rc-brand-badge">
                <i className="bi bi-car-front-fill"></i>
              </span>
              <h4 className="fw-bold mb-0 text-white">RentCar</h4>
            </div>
            <p className="text-secondary fw-medium fst-italic mb-2">“Rent. Drive. Explore.”</p>
            <p className="text-secondary small pe-lg-4">
              RentCar is a modern full-stack car rental platform offering well-maintained vehicles,
              transparent pricing, instant booking confirmation, and 24/7 roadside assistance.
            </p>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="text-uppercase fw-bold mb-3 text-white">Quick Links</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li>
                <Link to="/" className="text-secondary text-decoration-none">Home</Link>
              </li>
              <li>
                <Link to="/cars" className="text-secondary text-decoration-none">Cars</Link>
              </li>
              <li>
                <Link to="/about" className="text-secondary text-decoration-none">About</Link>
              </li>
              <li>
                <Link to="/contact" className="text-secondary text-decoration-none">Contact</Link>
              </li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="text-uppercase fw-bold mb-3 text-white">Support</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 text-secondary">
              <li><Link to="/about" className="text-secondary text-decoration-none">FAQ</Link></li>
              <li><Link to="/about" className="text-secondary text-decoration-none">Rental Policies</Link></li>
              <li><Link to="/about" className="text-secondary text-decoration-none">Terms &amp; Conditions</Link></li>
              <li><Link to="/about" className="text-secondary text-decoration-none">Privacy Policy</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="text-uppercase fw-bold mb-3 text-white">Contact</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 text-secondary">
              <li>
                <i className="bi bi-envelope-fill text-primary me-2"></i>
                support@rentcar.com
              </li>
              <li>
                <i className="bi bi-telephone-fill text-primary me-2"></i>
                +91 98765 43210
              </li>
              <li>
                <i className="bi bi-geo-alt-fill text-primary me-2"></i>
                SG Highway, Ahmedabad, India
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-secondary my-4" />

        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center small text-secondary">
          <p className="mb-0">&copy; 2026 RentCar. All Rights Reserved.</p>
          <p className="mb-0 mt-2 mt-sm-0">Rent. Drive. Explore.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
