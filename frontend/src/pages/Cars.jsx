import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import carService from '../services/carService';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import CarCard from '../components/CarCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const ITEMS_PER_PAGE = 6;

const Cars = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    location: searchParams.get('location') || 'ALL',
    dropLocation: searchParams.get('dropLocation') || '',
    category: searchParams.get('category') || 'ALL',
    fuelType: searchParams.get('fuelType') || 'ALL',
    transmission: searchParams.get('transmission') || 'ALL',
    seats: searchParams.get('seats') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    pickupDate: searchParams.get('pickupDate') || '',
    returnDate: searchParams.get('returnDate') || '',
    availableOnly: false,
    sortBy: 'newest',
  });

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchCars = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await carService.getCars(filters);
      setCars(data);
      setCurrentPage(1);
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to load cars.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const handleSearchBarSubmit = ({ pickupLocation, dropLocation, pickupDate, returnDate }) => {
    const updated = {
      ...filters,
      location: pickupLocation || 'ALL',
      dropLocation: dropLocation || pickupLocation || '',
      pickupDate,
      returnDate,
    };
    setFilters(updated);
    const params = new URLSearchParams();
    if (pickupLocation) params.set('location', pickupLocation);
    if (dropLocation) params.set('dropLocation', dropLocation);
    if (pickupDate) params.set('pickupDate', pickupDate);
    if (returnDate) params.set('returnDate', returnDate);
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setFilters({
      keyword: '',
      location: 'ALL',
      dropLocation: '',
      category: 'ALL',
      fuelType: 'ALL',
      transmission: 'ALL',
      seats: '',
      maxPrice: '',
      pickupDate: '',
      returnDate: '',
      availableOnly: false,
      sortBy: 'newest',
    });
    setSearchParams({});
  };

  const totalPages = Math.ceil(cars.length / ITEMS_PER_PAGE) || 1;
  const paginatedCars = cars.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const dateQueryString =
    filters.pickupDate && filters.returnDate
      ? `?pickupDate=${filters.pickupDate}&returnDate=${filters.returnDate}&pickupLocation=${encodeURIComponent(
          filters.location !== 'ALL' ? filters.location : ''
        )}&dropLocation=${encodeURIComponent(filters.dropLocation || '')}`
      : '';

  return (
    <div className="container py-4">
      {/* TOP SEARCH BAR */}
      <div className="mb-4">
        <SearchBar
          initialValues={{
            pickupLocation: filters.location !== 'ALL' ? filters.location : '',
            dropLocation: filters.dropLocation,
            pickupDate: filters.pickupDate,
            returnDate: filters.returnDate,
          }}
          onSearch={handleSearchBarSubmit}
        />
      </div>

      <div className="row g-4">
        {/* LEFT FILTER PANEL */}
        <div className="col-lg-3">
          <FilterPanel
            filters={filters}
            onFilterChange={setFilters}
            onReset={handleResetFilters}
          />
        </div>

        {/* RIGHT CAR LISTING */}
        <div className="col-lg-9">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-3 bg-white p-3 rounded-3 border">
            <div>
              <span className="fw-bold">{cars.length}</span>{' '}
              <span className="text-muted">
                {cars.length === 1 ? 'car available' : 'cars found'}
              </span>
              {filters.pickupDate && filters.returnDate && (
                <span className="badge bg-primary-subtle text-primary ms-2">
                  {filters.pickupDate} &rarr; {filters.returnDate}
                </span>
              )}
            </div>

            <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
              <label className="small text-muted text-nowrap mb-0">Sort by:</label>
              <select
                className="form-select form-select-sm"
                style={{ width: '180px' }}
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low &rarr; High</option>
                <option value="price_desc">Price: High &rarr; Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          <ErrorMessage message={error} onRetry={fetchCars} />

          {loading ? (
            <LoadingSpinner message="Loading cars..." />
          ) : cars.length === 0 ? (
            <div className="rc-card p-5 text-center">
              <i className="bi bi-car-front fs-1 text-muted"></i>
              <h5 className="fw-bold mt-3">No cars match your filters</h5>
              <p className="text-muted small mb-3">
                Try adjusting your price range, category, or selected rental dates.
              </p>
              <button className="btn btn-rc-primary btn-sm" onClick={handleResetFilters}>
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="row g-4">
                {paginatedCars.map((car) => (
                  <div className="col-md-6" key={car.id}>
                    <CarCard car={car} queryParams={dateQueryString} />
                  </div>
                ))}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <nav className="mt-4 d-flex justify-content-center">
                  <ul className="pagination">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      >
                        Previous
                      </button>
                    </li>
                    {Array.from({ length: totalPages }).map((_, idx) => (
                      <li
                        key={idx + 1}
                        className={`page-item ${currentPage === idx + 1 ? 'active' : ''}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(idx + 1)}
                        >
                          {idx + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cars;
