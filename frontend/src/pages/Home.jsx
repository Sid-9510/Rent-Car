import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import carService from '../services/carService';
import CarCard from '../components/CarCard';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../utils/formatters';

const Home = () => {
  const navigate = useNavigate();
  const [popularCars, setPopularCars] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [carsData, reviewsData] = await Promise.all([
          carService.getCars({ sortBy: 'rating' }),
          carService.getPublicReviews(),
        ]);
        setPopularCars(carsData.slice(0, 6));
        setReviews(reviewsData.slice(0, 3));
      } catch {
        // Fallback handled gracefully by empty states
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const handleSearch = ({ pickupLocation, dropLocation, pickupDate, returnDate }) => {
    const params = new URLSearchParams();
    if (pickupLocation) params.set('location', pickupLocation);
    if (dropLocation) params.set('dropLocation', dropLocation);
    if (pickupDate) params.set('pickupDate', pickupDate);
    if (returnDate) params.set('returnDate', returnDate);
    navigate(`/cars?${params.toString()}`);
  };

  return (
    <div>
      {/* HERO SECTION */}
      <section className="rc-hero">
        <div className="container">
          <div className="row align-items-center mb-4">
            <div className="col-lg-8">
              <span className="badge bg-primary bg-opacity-25 text-info border border-info-subtle px-3 py-2 rounded-pill mb-3 fw-semibold">
                RentCar &mdash; “Rent. Drive. Explore.”
              </span>
              <h1 className="display-4 fw-bold mb-3">
                Rent the perfect car.
                <br />
                <span className="text-info">Start your journey.</span>
              </h1>
              <p className="lead text-light opacity-75 mb-4" style={{ maxWidth: '580px' }}>
                Find a car that fits your journey, budget and style. Transparent pricing,
                verified vehicles, and instant online booking across major cities.
              </p>
              <div className="d-flex flex-wrap gap-3 mb-4">
                <Link to="/cars" className="btn btn-rc-primary btn-lg px-4">
                  <i className="bi bi-car-front me-2"></i>Search Cars
                </Link>
                <Link to="/about" className="btn btn-outline-light btn-lg px-4">
                  How It Works
                </Link>
              </div>
            </div>
          </div>

          {/* SEARCH BOX */}
          <div className="mt-2">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* POPULAR CARS */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">
            <div>
              <span className="text-primary fw-bold text-uppercase small">Featured Fleet</span>
              <h2 className="fw-bold mb-0">Popular Cars</h2>
            </div>
            <Link to="/cars" className="btn btn-outline-primary btn-sm mt-2 mt-md-0">
              View All Cars <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading popular cars..." />
          ) : (
            <div className="row g-4">
              {popularCars.map((car) => (
                <div className="col-md-6 col-lg-4" key={car.id}>
                  <CarCard car={car} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* WHY CHOOSE RENTCAR */}
      <section className="py-5 bg-white border-top border-bottom">
        <div className="container">
          <div className="text-center mb-5">
            <span className="text-primary fw-bold text-uppercase small">Why RentCar</span>
            <h2 className="fw-bold">Why Choose RentCar?</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
              Designed for reliability, comfort, and complete peace of mind on every trip.
            </p>
          </div>

          <div className="row g-4">
            {[
              {
                icon: 'bi-car-front-fill',
                title: 'Wide range of cars',
                desc: 'From fuel-efficient hatchbacks and sedans to 7-seater SUVs and luxury sedans.',
              },
              {
                icon: 'bi-calendar2-check-fill',
                title: 'Easy booking',
                desc: 'Real-time availability check and instant online reservation in under 2 minutes.',
              },
              {
                icon: 'bi-receipt-cutoff',
                title: 'Transparent pricing',
                desc: 'Clear breakdown of daily base rate, optional extras, coupon discounts, and GST.',
              },
              {
                icon: 'bi-shield-lock-fill',
                title: 'Secure payments',
                desc: 'Fast payment confirmation supporting UPI, Credit/Debit Cards, and Cash.',
              },
              {
                icon: 'bi-arrow-counterclockwise',
                title: 'Flexible cancellation',
                desc: 'Cancel eligible upcoming bookings easily from your dashboard with instant refund tracking.',
              },
              {
                icon: 'bi-headset',
                title: '24/7 support',
                desc: 'Dedicated roadside assistance and customer support team whenever you need help.',
              },
            ].map((item, idx) => (
              <div className="col-md-6 col-lg-4" key={idx}>
                <div className="p-4 rounded-4 border h-100 bg-light bg-opacity-50">
                  <div
                    className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-3 mb-3"
                    style={{ width: '48px', height: '48px' }}
                  >
                    <i className={`bi ${item.icon} fs-4`}></i>
                  </div>
                  <h5 className="fw-bold">✓ {item.title}</h5>
                  <p className="text-muted small mb-0">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <span className="text-primary fw-bold text-uppercase small">Simple 4-Step Process</span>
            <h2 className="fw-bold">How It Works</h2>
          </div>

          <div className="row g-4 text-center">
            {[
              {
                step: '1',
                icon: 'bi-search',
                title: 'Search',
                desc: 'Select your pickup location, drop-off city, and travel dates.',
              },
              {
                step: '2',
                icon: 'bi-hand-index-thumb',
                title: 'Choose',
                desc: 'Compare cars, specs, ratings, and select the ideal vehicle for your trip.',
              },
              {
                step: '3',
                icon: 'bi-credit-card-2-front',
                title: 'Book',
                desc: 'Add optional extras, apply discount coupons, and confirm payment.',
              },
              {
                step: '4',
                icon: 'bi-speedometer2',
                title: 'Drive',
                desc: 'Pick up your sanitized car and enjoy the open road with RentCar.',
              },
            ].map((s) => (
              <div className="col-sm-6 col-lg-3" key={s.step}>
                <div className="rc-card p-4 h-100">
                  <div className="badge bg-primary rounded-pill px-3 py-2 mb-3">
                    Step {s.step}
                  </div>
                  <div className="fs-1 text-dark mb-2">
                    <i className={`bi ${s.icon}`}></i>
                  </div>
                  <h5 className="fw-bold">{s.title}</h5>
                  <p className="text-muted small mb-0">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CUSTOMER REVIEWS */}
      <section className="py-5 bg-white border-top">
        <div className="container">
          <div className="text-center mb-5">
            <span className="text-primary fw-bold text-uppercase small">Testimonials</span>
            <h2 className="fw-bold">Customer Reviews</h2>
            <p className="text-muted">Verified reviews from completed RentCar rentals</p>
          </div>

          <div className="row g-4">
            {reviews.map((rev) => (
              <div className="col-md-4" key={rev.id}>
                <div className="rc-card p-4 h-100 d-flex flex-column">
                  <div className="mb-2 text-warning">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <i key={i} className="bi bi-star-fill me-1"></i>
                    ))}
                  </div>
                  <p className="text-dark fst-italic flex-grow-1">“{rev.comment}”</p>
                  <div className="pt-3 border-top d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="fw-bold mb-0">{rev.userName}</h6>
                      <small className="text-primary fw-medium">{rev.carName}</small>
                    </div>
                    <small className="text-muted">{formatDate(rev.createdAt)}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-5 text-white text-center" style={{ backgroundColor: '#0f172a' }}>
        <div className="container py-3">
          <h2 className="fw-bold mb-3">Ready to hit the road?</h2>
          <p className="text-secondary mb-4 mx-auto" style={{ maxWidth: '520px' }}>
            Explore our fleet of verified vehicles and unlock exclusive savings with coupon{' '}
            <span className="badge bg-primary">WELCOME20</span>.
          </p>
          <Link to="/cars" className="btn btn-rc-primary btn-lg px-5">
            Browse Cars
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
