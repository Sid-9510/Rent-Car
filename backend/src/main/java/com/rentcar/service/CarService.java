package com.rentcar.service;

import com.rentcar.dto.CarDTO;
import com.rentcar.dto.CarRequest;
import com.rentcar.entity.*;
import com.rentcar.exception.BadRequestException;
import com.rentcar.exception.ResourceNotFoundException;
import com.rentcar.repository.BookingRepository;
import com.rentcar.repository.CarRepository;
import com.rentcar.repository.MaintenanceRepository;
import com.rentcar.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

@Service
public class CarService {

    private final CarRepository carRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final MaintenanceRepository maintenanceRepository;

    public CarService(CarRepository carRepository,
                      BookingRepository bookingRepository,
                      ReviewRepository reviewRepository,
                      MaintenanceRepository maintenanceRepository) {
        this.carRepository = carRepository;
        this.bookingRepository = bookingRepository;
        this.reviewRepository = reviewRepository;
        this.maintenanceRepository = maintenanceRepository;
    }

    public boolean isCarAvailableForDates(Car car, LocalDate pickupDate, LocalDate returnDate) {
        if (car.getStatus() != CarStatus.AVAILABLE) {
            return false;
        }
        boolean hasActiveMaintenance = maintenanceRepository.existsByCarIdAndStatusIn(
                car.getId(),
                List.of(MaintenanceStatus.IN_PROGRESS)
        );
        if (hasActiveMaintenance) {
            return false;
        }
        if (pickupDate != null && returnDate != null) {
            if (!returnDate.isAfter(pickupDate)) {
                throw new BadRequestException("Return date must be after pickup date.");
            }
            List<Booking> overlapping = bookingRepository.findOverlappingBookings(
                    car.getId(),
                    pickupDate,
                    returnDate,
                    List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED)
            );
            return overlapping.isEmpty();
        }
        return true;
    }

    public CarDTO toDTO(Car car, LocalDate pickupDate, LocalDate returnDate) {
        Double avgRating = reviewRepository.getAverageRatingForCar(car.getId());
        long reviewCount = reviewRepository.countByCarId(car.getId());
        boolean available = isCarAvailableForDates(car, pickupDate, returnDate);
        return CarDTO.fromEntity(car, avgRating, reviewCount, available);
    }

    public List<CarDTO> searchAndFilterCars(
            String keyword,
            String location,
            CarCategory category,
            FuelType fuelType,
            TransmissionType transmission,
            Integer seats,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            LocalDate pickupDate,
            LocalDate returnDate,
            Boolean availableOnly,
            String sortBy,
            boolean includeAllStatuses
    ) {
        if (pickupDate != null && returnDate != null && !returnDate.isAfter(pickupDate)) {
            throw new BadRequestException("Return date must be after pickup date.");
        }

        List<Car> cars = includeAllStatuses
                ? carRepository.findAllByOrderByCreatedAtDesc()
                : carRepository.findByStatusNot(CarStatus.INACTIVE);

        Stream<CarDTO> stream = cars.stream()
                .filter(car -> {
                    if (keyword != null && !keyword.isBlank()) {
                        String q = keyword.trim().toLowerCase();
                        boolean match = car.getBrand().toLowerCase().contains(q)
                                || car.getModel().toLowerCase().contains(q)
                                || (car.getBrand() + " " + car.getModel()).toLowerCase().contains(q)
                                || car.getLocation().toLowerCase().contains(q)
                                || car.getCategory().name().toLowerCase().contains(q);
                        if (!match) return false;
                    }
                    if (location != null && !location.isBlank() && !location.equalsIgnoreCase("ALL")) {
                        if (!car.getLocation().toLowerCase().contains(location.trim().toLowerCase())) {
                            return false;
                        }
                    }
                    if (category != null && car.getCategory() != category) {
                        return false;
                    }
                    if (fuelType != null && car.getFuelType() != fuelType) {
                        return false;
                    }
                    if (transmission != null && car.getTransmission() != transmission) {
                        return false;
                    }
                    if (seats != null && car.getSeats() < seats) {
                        return false;
                    }
                    if (minPrice != null && car.getPricePerDay().compareTo(minPrice) < 0) {
                        return false;
                    }
                    if (maxPrice != null && car.getPricePerDay().compareTo(maxPrice) > 0) {
                        return false;
                    }
                    return true;
                })
                .map(car -> toDTO(car, pickupDate, returnDate))
                .filter(dto -> {
                    boolean filterUnavailable = (availableOnly != null && availableOnly)
                            || (pickupDate != null && returnDate != null);
                    return !filterUnavailable || dto.isAvailableForDates();
                });

        Comparator<CarDTO> comparator;
        if ("price_asc".equalsIgnoreCase(sortBy)) {
            comparator = Comparator.comparing(CarDTO::getPricePerDay);
        } else if ("price_desc".equalsIgnoreCase(sortBy)) {
            comparator = Comparator.comparing(CarDTO::getPricePerDay).reversed();
        } else if ("rating".equalsIgnoreCase(sortBy)) {
            comparator = Comparator.comparing(CarDTO::getAverageRating, Comparator.nullsLast(Comparator.reverseOrder()));
        } else {
            comparator = Comparator.comparing(CarDTO::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()));
        }

        return stream.sorted(comparator).toList();
    }

    public CarDTO getCarById(Long id, LocalDate pickupDate, LocalDate returnDate) {
        Car car = getCarEntityById(id);
        return toDTO(car, pickupDate, returnDate);
    }

    public Car getCarEntityById(Long id) {
        return carRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Car not found with ID: " + id));
    }

    @Transactional
    public CarDTO addCar(CarRequest request) {
        Car car = new Car();
        mapRequestToCar(request, car);
        return toDTO(carRepository.save(car), null, null);
    }

    @Transactional
    public CarDTO updateCar(Long id, CarRequest request) {
        Car car = getCarEntityById(id);
        mapRequestToCar(request, car);
        return toDTO(carRepository.save(car), null, null);
    }

    @Transactional
    public String deleteOrDeactivateCar(Long id) {
        Car car = getCarEntityById(id);
        // Rule in Section 42: Do not permanently delete a car if it has historical bookings. Prefer INACTIVE.
        if (bookingRepository.existsByCarId(id)) {
            car.setStatus(CarStatus.INACTIVE);
            carRepository.save(car);
            return "Car has historical bookings and was marked as INACTIVE.";
        } else {
            carRepository.delete(car);
            return "Car deleted permanently.";
        }
    }

    private void mapRequestToCar(CarRequest request, Car car) {
        car.setBrand(request.getBrand().trim());
        car.setModel(request.getModel().trim());
        car.setYear(request.getYear());
        car.setCategory(request.getCategory());
        car.setFuelType(request.getFuelType());
        car.setTransmission(request.getTransmission());
        car.setSeats(request.getSeats());
        car.setDoors(request.getDoors());
        car.setLuggageCapacity(request.getLuggageCapacity());
        car.setPricePerDay(request.getPricePerDay());
        car.setLocation(request.getLocation().trim());
        car.setDescription(request.getDescription());
        car.setImageUrl(request.getImageUrl());
        car.setStatus(request.getStatus() != null ? request.getStatus() : CarStatus.AVAILABLE);
    }
}
