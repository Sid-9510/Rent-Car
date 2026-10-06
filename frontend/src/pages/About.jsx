import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill mb-2">
          About RentCar
        </span>
        <h1 className="fw-bold">Rent. Drive. Explore.</h1>
        <p className="lead text-muted mx-auto" style={{ maxWidth: '680px' }}>
          RentCar is a modern car rental platform designed to make renting a vehicle simple,
          transparent and convenient.
        </p>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-6">
          <div className="rc-card p-4 h-100">
            <h4 className="fw-bold mb-3">
              <i className="bi bi-bullseye text-primary me-2"></i>Our Mission
            </h4>
            <p className="text-secondary mb-0">
              Our mission at RentCar is to empower travelers, commuters, and families with
              self-drive freedom across India. Whether you need an agile electric hatchback for
              daily city errands, a spacious 7-seater SUV for a weekend getaway, or a luxury
              sedan for an executive event, RentCar delivers verified vehicles at upfront, honest
              rates.
            </p>
          </div>
        </div>
        <div className="col-md-6">
          <div className="rc-card p-4 h-100">
            <h4 className="fw-bold mb-3">
              <i className="bi bi-shield-check text-success me-2"></i>Safety &amp; Maintenance
            </h4>
            <p className="text-secondary mb-0">
              Every car in the RentCar fleet undergoes a strict multi-point mechanical inspection
              and interior sanitization before every booking. Vehicles scheduled for periodic
              maintenance are automatically locked from booking to guarantee customer safety.
            </p>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-5">
        {[
          {
            icon: 'bi-cash-coin',
            title: '100% Transparent Pricing',
            desc: 'No hidden charges. Every invoice clearly lists base daily rate, optional extras, coupon discounts, and 18% GST.',
          },
          {
            icon: 'bi-calendar2-check',
            title: 'Real-Time Availability',
            desc: 'Our smart overlap-detection engine ensures double bookings never happen and your reserved car is ready on time.',
          },
          {
            icon: 'bi-headset',
            title: '24/7 Customer Support',
            desc: 'Dedicated support specialists and nationwide roadside assistance are just a call away throughout your rental.',
          },
        ].map((card, i) => (
          <div className="col-md-4" key={i}>
            <div className="rc-card p-4 h-100 text-center">
              <i className={`bi ${card.icon} fs-1 text-primary mb-3 d-block`}></i>
              <h5 className="fw-bold">{card.title}</h5>
              <p className="text-muted small mb-0">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rc-card p-4 p-md-5 bg-dark text-white text-center">
        <h3 className="fw-bold mb-2">Start Your Next Trip with RentCar</h3>
        <p className="text-secondary mb-4">
          Browse our live inventory and book your preferred car in minutes.
        </p>
        <Link to="/cars" className="btn btn-rc-primary btn-lg px-5">
          Explore Fleet
        </Link>
      </div>
    </div>
  );
};

export default About;
