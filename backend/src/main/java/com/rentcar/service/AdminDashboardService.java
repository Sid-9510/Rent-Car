package com.rentcar.service;

import com.rentcar.dto.BookingDTO;
import com.rentcar.dto.DashboardStatsDTO;
import com.rentcar.entity.*;
import com.rentcar.repository.BookingRepository;
import com.rentcar.repository.CarRepository;
import com.rentcar.repository.PaymentRepository;
import com.rentcar.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;

@Service
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final CarRepository carRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final BookingService bookingService;

    public AdminDashboardService(UserRepository userRepository,
                                 CarRepository carRepository,
                                 BookingRepository bookingRepository,
                                 PaymentRepository paymentRepository,
                                 BookingService bookingService) {
        this.userRepository = userRepository;
        this.carRepository = carRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.bookingService = bookingService;
    }

    public DashboardStatsDTO getDashboardStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        stats.setTotalUsers(userRepository.count());
        stats.setTotalCars(carRepository.count());
        stats.setAvailableCars(carRepository.countByStatus(CarStatus.AVAILABLE));
        stats.setMaintenanceCars(carRepository.countByStatus(CarStatus.MAINTENANCE));
        stats.setInactiveCars(carRepository.countByStatus(CarStatus.INACTIVE));

        List<Booking> allBookings = bookingRepository.findAllByOrderByCreatedAtDesc();
        List<Payment> allPayments = paymentRepository.findAllByOrderByPaymentDateDesc();

        stats.setTotalBookings(allBookings.size());
        long activeCount = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.PENDING)
                .count();
        long completedCount = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .count();
        long cancelledCount = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CANCELLED)
                .count();

        stats.setActiveBookings(activeCount);
        stats.setCompletedBookings(completedCount);
        stats.setCancelledBookings(cancelledCount);

        BigDecimal totalRevenue = allPayments.stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.setTotalRevenue(totalRevenue);

        // Booking status distribution
        Map<String, Long> statusDist = new LinkedHashMap<>();
        statusDist.put("CONFIRMED", allBookings.stream().filter(b -> b.getStatus() == BookingStatus.CONFIRMED).count());
        statusDist.put("COMPLETED", completedCount);
        statusDist.put("PENDING", allBookings.stream().filter(b -> b.getStatus() == BookingStatus.PENDING).count());
        statusDist.put("CANCELLED", cancelledCount);
        stats.setBookingStatusDistribution(statusDist);

        // Monthly revenue & bookings for the last 6 months
        YearMonth currentMonth = YearMonth.now();
        List<Map<String, Object>> monthlyRevenueList = new ArrayList<>();
        List<Map<String, Object>> monthlyBookingsList = new ArrayList<>();

        for (int i = 5; i >= 0; i--) {
            YearMonth ym = currentMonth.minusMonths(i);
            String label = ym.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + ym.getYear();

            BigDecimal monthRev = allPayments.stream()
                    .filter(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS && p.getPaymentDate() != null)
                    .filter(p -> YearMonth.from(p.getPaymentDate()).equals(ym))
                    .map(Payment::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            long monthBookCount = allBookings.stream()
                    .filter(b -> b.getPickupDate() != null && YearMonth.from(b.getPickupDate()).equals(ym))
                    .count();

            Map<String, Object> revEntry = new LinkedHashMap<>();
            revEntry.put("month", label);
            revEntry.put("revenue", monthRev);
            monthlyRevenueList.add(revEntry);

            Map<String, Object> bookEntry = new LinkedHashMap<>();
            bookEntry.put("month", label);
            bookEntry.put("bookings", monthBookCount);
            monthlyBookingsList.add(bookEntry);
        }
        stats.setMonthlyRevenue(monthlyRevenueList);
        stats.setMonthlyBookings(monthlyBookingsList);

        // Most rented cars
        Map<String, Long> carRentalCounts = new LinkedHashMap<>();
        Map<String, BigDecimal> carRevenueMap = new LinkedHashMap<>();
        for (Booking b : allBookings) {
            if (b.getStatus() != BookingStatus.CANCELLED && b.getCar() != null) {
                String carName = b.getCar().getBrand() + " " + b.getCar().getModel();
                carRentalCounts.put(carName, carRentalCounts.getOrDefault(carName, 0L) + 1);
                carRevenueMap.put(carName, carRevenueMap.getOrDefault(carName, BigDecimal.ZERO).add(b.getTotalAmount()));
            }
        }

        List<Map<String, Object>> mostRented = carRentalCounts.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(5)
                .map(entry -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("carName", entry.getKey());
                    item.put("bookingsCount", entry.getValue());
                    item.put("revenue", carRevenueMap.getOrDefault(entry.getKey(), BigDecimal.ZERO));
                    return item;
                })
                .toList();
        stats.setMostRentedCars(mostRented);

        List<BookingDTO> recentBookings = allBookings.stream()
                .limit(6)
                .map(bookingService::toDTO)
                .toList();
        stats.setRecentBookings(recentBookings);

        return stats;
    }
}
