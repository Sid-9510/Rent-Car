import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import carService from '../services/carService';
import bookingService from '../services/bookingService';
import paymentService from '../services/paymentService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatCurrency, getDefaultDateRange } from '../utils/formatters';

const EXTRAS_OPTIONS = [
  { key: 'GPS', label: 'GPS Navigation System', priceLabel: '₹200 / day', icon: 'bi-compass' },
  { key: 'CHILD_SEAT', label: 'Child Safety Seat', priceLabel: '₹150 / day', icon: 'bi-person-heart' },
  { key: 'ADDITIONAL_DRIVER', label: 'Additional Driver', priceLabel: '₹300 / day', icon: 'bi-person-plus' },
  { key: 'INSURANCE', label: 'Zero-Deductible Insurance', priceLabel: '₹500 flat', icon: 'bi-shield-check' },
];

const Booking = () => {
  const { carId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast, refreshUserExtras } = useAuth();

  const defaults = getDefaultDateRange();

  const [car, setCar] = useState(null);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [loadingCar, setLoadingCar] = useState(true);

  const [pickupLocation, setPickupLocation] = useState(searchParams.get('pickupLocation') || '');
  const [dropLocation, setDropLocation] = useState(searchParams.get('dropLocation') || '');
  const [pickupDate, setPickupDate] = useState(searchParams.get('pickupDate') || defaults.pickupDate);
  const [pickupTime, setPickupTime] = useState('10:00');
  const [returnDate, setReturnDate] = useState(searchParams.get('returnDate') || defaults.returnDate);
  const [returnTime, setReturnTime] = useState('10:00');

  const [selectedExtras, setSelectedExtras] = useState([]);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponMessage, setCouponMessage] = useState(null);

  const [breakdown, setBreakdown] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcError, setCalcError] = useState('');

  // Step 2: Simulated Payment Modal / State
  const [createdBooking, setCreatedBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [processingBooking, setProcessingBooking] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const loadInitial = async () => {
      try {
        setLoadingCar(true);
        const [carData, couponsData] = await Promise.all([
          carService.getCarById(carId),
          bookingService.getActiveCoupons(),
        ]);
        setCar(carData);
        setActiveCoupons(couponsData);
        if (!pickupLocation) {
          setPickupLocation(carData.location);
        }
        if (!dropLocation) {
          setDropLocation(carData.location);
        }
      } catch (err) {
        setCalcError(err.friendlyMessage || 'Could not load car details.');
      } finally {
        setLoadingCar(false);
      }
    };
    loadInitial();
  }, [carId]);

  const recalculatePrice = useCallback(
    async (couponToUse = appliedCoupon) => {
      if (!pickupDate || !returnDate) return;
      if (new Date(returnDate) <= new Date(pickupDate)) {
        setCalcError('Return date must be after pickup date.');
        setBreakdown(null);
        return;
      }
      try {
        setCalcLoading(true);
        setCalcError('');
        const data = await bookingService.calculatePrice({
          carId: Number(carId),
          pickupDate,
          returnDate,
          selectedExtras,
          couponCode: couponToUse || null,
        });
        setBreakdown(data);
        if (couponToUse && data.discountAmount > 0) {
          setCouponMessage({
            type: 'success',
            text: `Coupon ${data.couponCode} applied! Saved ${formatCurrency(data.discountAmount)}.`,
          });
        }
      } catch (err) {
        const msg = err.friendlyMessage || 'Error calculating price.';
        if (couponToUse) {
          setCouponMessage({ type: 'danger', text: msg });
          setAppliedCoupon('');
          const fallback = await bookingService.calculatePrice({
            carId: Number(carId),
            pickupDate,
            returnDate,
            selectedExtras,
            couponCode: null,
          });
          setBreakdown(fallback);
        } else {
          setCalcError(msg);
        }
      } finally {
        setCalcLoading(false);
      }
    },
    [carId, pickupDate, returnDate, selectedExtras, appliedCoupon]
  );

  useEffect(() => {
    if (car) {
      recalculatePrice(appliedCoupon);
    }
  }, [car, pickupDate, returnDate, selectedExtras, appliedCoupon, recalculatePrice]);

  const handleExtraToggle = (extraKey) => {
    setSelectedExtras((prev) =>
      prev.includes(extraKey) ? prev.filter((k) => k !== extraKey) : [...prev, extraKey]
    );
  };

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) {
      setCouponMessage({ type: 'warning', text: 'Please enter a coupon code.' });
      return;
    }
    setAppliedCoupon(couponInput.trim().toUpperCase());
  };

  const handleRemoveCoupon = () => {
    setCouponInput('');
    setAppliedCoupon('');
    setCouponMessage(null);
  };

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    if (!breakdown?.available) {
      showToast('Car is not available for the selected dates.', 'danger');
      return;
    }
    try {
      setProcessingBooking(true);
      const booking = await bookingService.createBooking({
        carId: Number(carId),
        pickupLocation: pickupLocation.trim() || car.location,
        dropLocation: dropLocation.trim() || pickupLocation.trim() || car.location,
        pickupDate,
        pickupTime: `${pickupTime}:00`.slice(0, 8),
        returnDate,
        returnTime: `${returnTime}:00`.slice(0, 8),
        selectedExtras,
        couponCode: appliedCoupon || null,
      });
      setCreatedBooking(booking);
      showToast('Booking created! Complete simulated payment to confirm.', 'info');
    } catch (err) {
      showToast(err.friendlyMessage || 'Could not create booking.', 'danger');
    } finally {
      setProcessingBooking(false);
    }
  };

  const handleSimulatedPayment = async () => {
    if (!createdBooking) return;
    try {
      setProcessingPayment(true);
      // Simulate brief gateway processing delay
      await new Promise((r) => setTimeout(r, 900));
      const payment = await paymentService.processPayment({
        bookingId: createdBooking.id,
        paymentMethod,
      });
      await refreshUserExtras();
      showToast(`Payment successful! Transaction ID: ${payment.transactionId}`, 'success');
      navigate(`/booking-confirmation/${createdBooking.id}`);
    } catch (err) {
      showToast(err.friendlyMessage || 'Payment simulation failed.', 'danger');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loadingCar) return <LoadingSpinner message="Preparing your booking..." />;
  if (!car) return <div className="container py-5"><ErrorMessage message="Car not found" /></div>;

  return (
    <div className="container py-4">
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/cars">Cars</Link></li>
          <li className="breadcrumb-item"><Link to={`/cars/${car.id}`}>{car.brand} {car.model}</Link></li>
          <li className="breadcrumb-item active">Book Car</li>
        </ol>
      </nav>

      <div className="row g-4">
        {/* LEFT COLUMN: BOOKING FORM OR PAYMENT SIMULATION */}
        <div className="col-lg-8">
          {!createdBooking ? (
            <form onSubmit={handleProceedToPayment} className="rc-card p-4">
              <h4 className="fw-bold mb-4 pb-2 border-bottom">
                <i className="bi bi-calendar2-range text-primary me-2"></i>
                Complete Your Reservation
              </h4>

              {/* SELECTED CAR BANNER */}
              <div className="d-flex align-items-center gap-3 p-3 rounded-3 bg-light border mb-4">
                <img
                  src={car.imageUrl}
                  alt={car.model}
                  className="rounded-3"
                  style={{ width: '110px', height: '72px', objectFit: 'cover' }}
                />
                <div>
                  <span className="badge bg-primary mb-1">{car.category}</span>
                  <h5 className="fw-bold mb-0">
                    {car.brand} {car.model} ({car.year})
                  </h5>
                  <small className="text-muted">
                    {car.transmission} &bull; {car.fuelType} &bull; {car.seats} Seats &bull;{' '}
                    <strong>{formatCurrency(car.pricePerDay)}/day</strong>
                  </small>
                </div>
              </div>

              {/* LOCATIONS & DATES */}
              <h6 className="fw-bold text-uppercase small text-secondary mb-3">
                1. Rental Locations &amp; Schedule
              </h6>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Pickup Location *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="e.g. Ahmedabad Airport"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Drop-off Location *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={dropLocation}
                    onChange={(e) => setDropLocation(e.target.value)}
                    placeholder="e.g. Ahmedabad Airport"
                    required
                  />
                </div>
                <div className="col-md-3 col-6">
                  <label className="form-label small fw-semibold">Pickup Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    min={today}
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-3 col-6">
                  <label className="form-label small fw-semibold">Pickup Time *</label>
                  <input
                    type="time"
                    className="form-control"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-3 col-6">
                  <label className="form-label small fw-semibold">Return Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    min={pickupDate || today}
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-3 col-6">
                  <label className="form-label small fw-semibold">Return Time *</label>
                  <input
                    type="time"
                    className="form-control"
                    value={returnTime}
                    onChange={(e) => setReturnTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* AVAILABILITY STATUS BANNER */}
              {breakdown && (
                <div
                  className={`alert ${
                    breakdown.available ? 'alert-success' : 'alert-danger'
                  } py-2 small d-flex align-items-center gap-2 mb-4`}
                >
                  <i
                    className={`bi ${
                      breakdown.available
                        ? 'bi-check-circle-fill'
                        : 'bi-exclamation-octagon-fill'
                    }`}
                  ></i>
                  <span>{breakdown.availabilityMessage}</span>
                </div>
              )}

              {/* OPTIONAL EXTRAS */}
              <h6 className="fw-bold text-uppercase small text-secondary mb-3">
                2. Select Optional Extras
              </h6>
              <div className="row g-3 mb-4">
                {EXTRAS_OPTIONS.map((extra) => {
                  const checked = selectedExtras.includes(extra.key);
                  return (
                    <div className="col-md-6" key={extra.key}>
                      <div
                        className={`p-3 rounded-3 border d-flex align-items-center justify-content-between ${
                          checked ? 'border-primary bg-primary-subtle bg-opacity-25' : 'bg-white'
                        }`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleExtraToggle(extra.key)}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <input
                            type="checkbox"
                            className="form-check-input mt-0"
                            checked={checked}
                            onChange={() => {}}
                          />
                          <div>
                            <div className="fw-semibold small">
                              <i className={`bi ${extra.icon} text-primary me-1`}></i>
                              {extra.label}
                            </div>
                            <small className="text-muted">{extra.priceLabel}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* COUPON CODE */}
              <h6 className="fw-bold text-uppercase small text-secondary mb-2">
                3. Apply Promo Coupon
              </h6>
              <div className="input-group mb-2" style={{ maxWidth: '420px' }}>
                <input
                  type="text"
                  className="form-control text-uppercase"
                  placeholder="Enter Coupon Code (e.g. WELCOME20)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                />
                {appliedCoupon ? (
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={handleRemoveCoupon}
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-dark"
                    onClick={handleApplyCoupon}
                  >
                    APPLY
                  </button>
                )}
              </div>

              {couponMessage && (
                <div className={`small text-${couponMessage.type} mb-2`}>
                  {couponMessage.text}
                </div>
              )}

              {activeCoupons.length > 0 && (
                <div className="d-flex flex-wrap gap-2 mb-4 mt-2">
                  <small className="text-muted me-1">Available Coupons:</small>
                  {activeCoupons.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="badge bg-light text-dark border text-decoration-none"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setCouponInput(c.code);
                        setAppliedCoupon(c.code);
                      }}
                    >
                      <strong>{c.code}</strong> (
                      {c.discountType === 'PERCENTAGE'
                        ? `${c.discountValue}% OFF`
                        : `₹${c.discountValue} OFF`}{' '}
                      above ₹{c.minimumBookingAmount})
                    </button>
                  ))}
                </div>
              )}

              <ErrorMessage message={calcError} />

              <div className="text-end pt-3 border-top">
                <button
                  type="submit"
                  className="btn btn-rc-primary btn-lg px-5"
                  disabled={!breakdown?.available || processingBooking || calcLoading}
                >
                  {processingBooking ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Processing booking...
                    </>
                  ) : (
                    'Proceed to Payment'
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: SIMULATED PAYMENT GATEWAY (SECTION 34) */
            <div className="rc-card p-4 p-md-5">
              <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <div>
                  <span className="badge bg-primary mb-1">RentCar Secure Checkout</span>
                  <h4 className="fw-bold mb-0">Simulated Payment Gateway</h4>
                </div>
                <div className="text-end">
                  <div className="small text-muted">Booking Ref</div>
                  <div className="fw-bold text-primary">{createdBooking.bookingReference}</div>
                </div>
              </div>

              <div className="alert alert-info small mb-4">
                <i className="bi bi-info-circle-fill me-2"></i>
                This is a simulated payment environment for the RentCar demonstration. No real money is charged.
              </div>

              <h6 className="fw-bold mb-3">Select Payment Method</h6>
              <div className="d-flex flex-column gap-3 mb-4">
                {[
                  {
                    id: 'UPI',
                    label: 'UPI (GPay, PhonePe, Paytm, BHIM)',
                    icon: 'bi-phone-fill',
                    desc: 'Instant verification via Unified Payments Interface',
                  },
                  {
                    id: 'CARD',
                    label: 'Credit / Debit Card (Visa, MasterCard, RuPay)',
                    icon: 'bi-credit-card-2-front-fill',
                    desc: 'Pay securely with your bank card',
                  },
                  {
                    id: 'CASH',
                    label: 'Cash / Pay at Pickup Counter',
                    icon: 'bi-cash-stack',
                    desc: 'Confirm reservation now and settle at vehicle pickup',
                  },
                ].map((m) => (
                  <label
                    key={m.id}
                    className={`p-3 rounded-3 border d-flex align-items-center gap-3 ${
                      paymentMethod === m.id
                        ? 'border-primary bg-primary-subtle bg-opacity-25'
                        : 'bg-white'
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      className="form-check-input mt-0"
                      checked={paymentMethod === m.id}
                      onChange={() => setPaymentMethod(m.id)}
                    />
                    <i className={`bi ${m.icon} fs-4 text-primary`}></i>
                    <div>
                      <div className="fw-bold">{m.label}</div>
                      <small className="text-muted">{m.desc}</small>
                    </div>
                  </label>
                ))}
              </div>

              <div className="bg-light p-3 rounded-3 border d-flex justify-content-between align-items-center mb-4">
                <span className="fw-semibold">Amount Payable:</span>
                <span className="fs-4 fw-bold text-dark">
                  {formatCurrency(createdBooking.totalAmount)}
                </span>
              </div>

              <button
                type="button"
                className="btn btn-success btn-lg w-100 py-3 fw-bold"
                disabled={processingPayment}
                onClick={handleSimulatedPayment}
              >
                {processingPayment ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <i className="bi bi-lock-fill me-2"></i>
                    PAY NOW ({formatCurrency(createdBooking.totalAmount)})
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: DYNAMIC PRICE BREAKDOWN (SECTION 31) */}
        <div className="col-lg-4">
          <div className="rc-card p-4 position-sticky" style={{ top: '95px' }}>
            <h5 className="fw-bold mb-3 pb-2 border-bottom">Price Summary</h5>

            {calcLoading ? (
              <div className="py-4 text-center text-muted small">
                <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                Calculating price...
              </div>
            ) : breakdown ? (
              <div className="small d-flex flex-column gap-2">
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Car Rate:</span>
                  <span className="fw-medium">{formatCurrency(breakdown.pricePerDay)} / day</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Rental Duration:</span>
                  <span className="fw-medium">
                    {breakdown.numberOfDays} {breakdown.numberOfDays === 1 ? 'day' : 'days'}
                  </span>
                </div>
                <div className="d-flex justify-content-between pt-2 border-top">
                  <span className="text-muted">Base Amount:</span>
                  <span className="fw-semibold">{formatCurrency(breakdown.baseAmount)}</span>
                </div>

                {breakdown.extrasBreakdown &&
                  Object.entries(breakdown.extrasBreakdown).map(([k, val]) => (
                    <div className="d-flex justify-content-between" key={k}>
                      <span className="text-muted">{k.replace('_', ' ')}:</span>
                      <span className="fw-medium">+{formatCurrency(val)}</span>
                    </div>
                  ))}

                {breakdown.discountAmount > 0 && (
                  <div className="d-flex justify-content-between text-success fw-semibold">
                    <span>Discount ({breakdown.couponCode}):</span>
                    <span>-{formatCurrency(breakdown.discountAmount)}</span>
                  </div>
                )}

                <div className="d-flex justify-content-between">
                  <span className="text-muted">
                    Tax (GST {breakdown.taxRatePercentage || 18}%):
                  </span>
                  <span className="fw-medium">+{formatCurrency(breakdown.taxAmount)}</span>
                </div>

                <hr className="my-2" />

                <div className="d-flex justify-content-between align-items-center fs-5 fw-bold text-dark">
                  <span>TOTAL:</span>
                  <span className="text-primary">{formatCurrency(breakdown.totalAmount)}</span>
                </div>
              </div>
            ) : (
              <p className="text-muted small mb-0">Select valid pickup and return dates to see pricing.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
