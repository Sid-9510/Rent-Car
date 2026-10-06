package com.rentcar.service;

import com.rentcar.dto.BookingDTO;
import com.rentcar.dto.BookingRequest;
import com.rentcar.dto.PriceBreakdownDTO;
import com.rentcar.entity.*;
import com.rentcar.exception.BadRequestException;
import com.rentcar.exception.BookingNotAvailableException;
import com.rentcar.exception.ResourceNotFoundException;
import com.rentcar.exception.UnauthorizedException;
import com.rentcar.repository.*;
import com.rentcar.util.ReferenceGenerator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final CarService carService;
    private final UserService userService;
    private final CouponService couponService;
    private final PaymentRepository paymentRepository;
    private final ReviewRepository reviewRepository;
    private final NotificationService notificationService;

    @Value("${app.tax-rate:0.18}")
    private BigDecimal taxRate;

    public BookingService(BookingRepository bookingRepository,
                          CarService carService,
                          UserService userService,
                          CouponService couponService,
                          PaymentRepository paymentRepository,
                          ReviewRepository reviewRepository,
                          NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.carService = carService;
        this.userService = userService;
        this.couponService = couponService;
        this.paymentRepository = paymentRepository;
        this.reviewRepository = reviewRepository;
        this.notificationService = notificationService;
    }

    public PriceBreakdownDTO calculatePrice(
            Long carId,
            LocalDate pickupDate,
            LocalDate returnDate,
            List<String> selectedExtras,
            String couponCode
    ) {
        if (pickupDate == null || returnDate == null) {
            throw new BadRequestException("Pickup date and return date are required.");
        }
        if (!returnDate.isAfter(pickupDate)) {
            throw new BadRequestException("Return date must be after pickup date.");
        }

        Car car = carService.getCarEntityById(carId);
        int days = (int) ChronoUnit.DAYS.between(pickupDate, returnDate);

        BigDecimal baseAmount = car.getPricePerDay()
                .multiply(BigDecimal.valueOf(days))
                .setScale(2, RoundingMode.HALF_UP);

        List<String> normalizedExtras = new ArrayList<>();
        Map<String, BigDecimal> extrasBreakdown = new LinkedHashMap<>();
        BigDecimal extraAmount = BigDecimal.ZERO;

        if (selectedExtras != null) {
            for (String rawExtra : selectedExtras) {
                if (rawExtra == null || rawExtra.isBlank()) continue;
                String key = rawExtra.trim().toUpperCase();
                if (extrasBreakdown.containsKey(key)) continue;

                BigDecimal cost = switch (key) {
                    case "GPS" -> BigDecimal.valueOf(200L * days);
                    case "CHILD_SEAT" -> BigDecimal.valueOf(150L * days);
                    case "ADDITIONAL_DRIVER" -> BigDecimal.valueOf(300L * days);
                    case "INSURANCE" -> BigDecimal.valueOf(500L);
                    default -> BigDecimal.ZERO;
                };
                if (cost.compareTo(BigDecimal.ZERO) > 0) {
                    normalizedExtras.add(key);
                    extrasBreakdown.put(key, cost.setScale(2, RoundingMode.HALF_UP));
                    extraAmount = extraAmount.add(cost);
                }
            }
        }
        extraAmount = extraAmount.setScale(2, RoundingMode.HALF_UP);

        BigDecimal subtotalBeforeDiscount = baseAmount.add(extraAmount);
        BigDecimal discountAmount = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        String appliedCoupon = null;

        if (couponCode != null && !couponCode.isBlank()) {
            Coupon coupon = couponService.validateCoupon(couponCode.trim(), subtotalBeforeDiscount);
            discountAmount = couponService.calculateDiscount(coupon, subtotalBeforeDiscount);
            appliedCoupon = coupon.getCode();
        }

        BigDecimal taxableAmount = subtotalBeforeDiscount.subtract(discountAmount)
                .max(BigDecimal.ZERO);
        BigDecimal taxAmount = taxableAmount.multiply(taxRate)
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalAmount = taxableAmount.add(taxAmount)
                .setScale(2, RoundingMode.HALF_UP);

        boolean available = carService.isCarAvailableForDates(car, pickupDate, returnDate);
        String availabilityMsg;
        if (car.getStatus() == CarStatus.INACTIVE) {
            availabilityMsg = "This car is currently inactive and cannot be booked.";
        } else if (car.getStatus() == CarStatus.MAINTENANCE) {
            availabilityMsg = "This car is currently under maintenance and cannot be booked.";
        } else if (!available) {
            availabilityMsg = "Car is not available for the selected dates due to an existing booking.";
        } else {
            availabilityMsg = "Car is available for your selected dates!";
        }

        PriceBreakdownDTO dto = new PriceBreakdownDTO();
        dto.setCarId(carId);
        dto.setPricePerDay(car.getPricePerDay());
        dto.setNumberOfDays(days);
        dto.setBaseAmount(baseAmount);
        dto.setSelectedExtras(normalizedExtras);
        dto.setExtrasBreakdown(extrasBreakdown);
        dto.setExtraAmount(extraAmount);
        dto.setCouponCode(appliedCoupon);
        dto.setDiscountAmount(discountAmount);
        dto.setTaxRatePercentage(taxRate.multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP));
        dto.setTaxAmount(taxAmount);
        dto.setTotalAmount(totalAmount);
        dto.setAvailable(available);
        dto.setAvailabilityMessage(availabilityMsg);
        return dto;
    }

    @Transactional
    public BookingDTO createBooking(String userEmail, BookingRequest request) {
        User user = userService.getUserEntityByEmail(userEmail);

        // Rule 1: A blocked user cannot create a booking
        if (user.getStatus() == UserStatus.BLOCKED) {
            throw new UnauthorizedException("Your account is blocked and cannot create new bookings.");
        }

        // Section 5: Admin must NOT create customer bookings
        if (user.getRole() != Role.USER) {
            throw new UnauthorizedException("Administrator accounts cannot create customer bookings.");
        }

        // Rule 6: Pickup date must be before return date
        if (!request.getReturnDate().isAfter(request.getPickupDate())) {
            throw new BadRequestException("Return date must be after pickup date.");
        }

        if (request.getPickupDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Pickup date cannot be in the past.");
        }

        Car car = carService.getCarEntityById(request.getCarId());

        // Rule 2: An inactive car cannot be booked
        if (car.getStatus() == CarStatus.INACTIVE) {
            throw new BookingNotAvailableException("This car is inactive and cannot be booked.");
        }

        // Rule 3: A car under maintenance cannot be booked
        if (car.getStatus() == CarStatus.MAINTENANCE) {
            throw new BookingNotAvailableException("This car is currently under maintenance and cannot be booked.");
        }

        // Rule 4 & 5: Re-check availability on the backend before confirming/creating booking
        if (!carService.isCarAvailableForDates(car, request.getPickupDate(), request.getReturnDate())) {
            throw new BookingNotAvailableException("Car is not available for the selected dates.");
        }

        // Rule 10 & 11: Recalculate final booking price on the backend
        PriceBreakdownDTO price = calculatePrice(
                car.getId(),
                request.getPickupDate(),
                request.getReturnDate(),
                request.getSelectedExtras(),
                request.getCouponCode()
        );

        Booking booking = new Booking();
        long countHint = bookingRepository.count() + 1;
        String reference = ReferenceGenerator.generateBookingReference(countHint);
        while (bookingRepository.findByBookingReference(reference).isPresent()) {
            reference = ReferenceGenerator.generateBookingReference(0);
        }

        booking.setBookingReference(reference);
        booking.setUser(user);
        booking.setCar(car);
        booking.setPickupLocation(request.getPickupLocation().trim());
        booking.setDropLocation(request.getDropLocation().trim());
        booking.setPickupDate(request.getPickupDate());
        booking.setPickupTime(request.getPickupTime());
        booking.setReturnDate(request.getReturnDate());
        booking.setReturnTime(request.getReturnTime());
        booking.setNumberOfDays(price.getNumberOfDays());
        booking.setSelectedExtras(price.getSelectedExtras().isEmpty()
                ? null
                : String.join(",", price.getSelectedExtras()));
        booking.setCouponCode(price.getCouponCode());
        booking.setBaseAmount(price.getBaseAmount());
        booking.setExtraAmount(price.getExtraAmount());
        booking.setDiscountAmount(price.getDiscountAmount());
        booking.setTaxAmount(price.getTaxAmount());
        booking.setTotalAmount(price.getTotalAmount());
        booking.setStatus(BookingStatus.PENDING);

        Booking saved = bookingRepository.save(booking);

        if (price.getCouponCode() != null) {
            couponService.incrementUsage(price.getCouponCode());
        }

        notificationService.createNotification(
                user,
                "Booking " + saved.getBookingReference() + " created for " + car.getBrand() + " " + car.getModel()
                        + ". Complete payment to confirm your reservation.",
                NotificationType.BOOKING
        );

        return toDTO(saved);
    }

    public List<BookingDTO> getUserBookings(String userEmail) {
        User user = userService.getUserEntityByEmail(userEmail);
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public BookingDTO getBookingById(Long bookingId, String userEmail, boolean isAdmin) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        if (!isAdmin && !booking.getUser().getEmail().equalsIgnoreCase(userEmail)) {
            throw new UnauthorizedException("You are not authorized to view this booking.");
        }

        return toDTO(booking);
    }

    @Transactional
    public BookingDTO cancelBooking(Long bookingId, String userEmail, boolean isAdmin) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        if (!isAdmin && !booking.getUser().getEmail().equalsIgnoreCase(userEmail)) {
            throw new UnauthorizedException("You are not authorized to cancel this booking.");
        }

        // Rule 7: A user cannot cancel a completed booking
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Completed bookings cannot be cancelled.");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("This booking is already cancelled.");
        }

        // Section 36: Do not allow cancellation after rental has started (for normal users)
        if (!isAdmin && !booking.getPickupDate().isAfter(LocalDate.now())) {
            throw new BadRequestException("Cannot cancel a booking on or after the rental pickup date.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);

        // Section 36: If payment was successful, mark payment as REFUNDED
        paymentRepository.findByBookingId(booking.getId()).ifPresent(payment -> {
            if (payment.getPaymentStatus() == PaymentStatus.SUCCESS) {
                payment.setPaymentStatus(PaymentStatus.REFUNDED);
                paymentRepository.save(payment);
            }
        });

        notificationService.createNotification(
                booking.getUser(),
                "Booking cancelled (" + booking.getBookingReference() + "). Any completed payment has been marked for refund.",
                NotificationType.BOOKING
        );

        return toDTO(saved);
    }

    @Transactional
    public BookingDTO updateBookingStatusByAdmin(Long bookingId, BookingStatus newStatus) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        booking.setStatus(newStatus);
        Booking saved = bookingRepository.save(booking);

        if (newStatus == BookingStatus.COMPLETED) {
            notificationService.createNotification(
                    booking.getUser(),
                    "Your rental for " + booking.getCar().getBrand() + " " + booking.getCar().getModel()
                            + " (" + booking.getBookingReference() + ") is marked as COMPLETED. You can now leave a review!",
                    NotificationType.BOOKING
            );
        } else if (newStatus == BookingStatus.CANCELLED) {
            paymentRepository.findByBookingId(booking.getId()).ifPresent(payment -> {
                if (payment.getPaymentStatus() == PaymentStatus.SUCCESS) {
                    payment.setPaymentStatus(PaymentStatus.REFUNDED);
                    paymentRepository.save(payment);
                }
            });
        }

        return toDTO(saved);
    }

    public List<BookingDTO> getAllBookingsForAdmin(BookingStatus status, Long carId, String customerQuery) {
        return bookingRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(b -> status == null || b.getStatus() == status)
                .filter(b -> carId == null || b.getCar().getId().equals(carId))
                .filter(b -> {
                    if (customerQuery == null || customerQuery.isBlank()) return true;
                    String q = customerQuery.trim().toLowerCase();
                    return b.getUser().getName().toLowerCase().contains(q)
                            || b.getUser().getEmail().toLowerCase().contains(q)
                            || b.getBookingReference().toLowerCase().contains(q);
                })
                .map(this::toDTO)
                .toList();
    }

    public BookingDTO toDTO(Booking booking) {
        Payment payment = paymentRepository.findByBookingId(booking.getId()).orElse(null);
        boolean reviewed = reviewRepository.existsByBookingId(booking.getId());
        return BookingDTO.fromEntity(booking, payment, reviewed);
    }
}
