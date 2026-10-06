package com.rentcar.service;

import com.rentcar.dto.PaymentDTO;
import com.rentcar.dto.PaymentRequest;
import com.rentcar.entity.*;
import com.rentcar.exception.BadRequestException;
import com.rentcar.exception.BookingNotAvailableException;
import com.rentcar.exception.ResourceNotFoundException;
import com.rentcar.exception.UnauthorizedException;
import com.rentcar.repository.BookingRepository;
import com.rentcar.repository.PaymentRepository;
import com.rentcar.util.ReferenceGenerator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;

    public PaymentService(PaymentRepository paymentRepository,
                          BookingRepository bookingRepository,
                          NotificationService notificationService) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public PaymentDTO processSimulatedPayment(String userEmail, PaymentRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + request.getBookingId()));

        if (!booking.getUser().getEmail().equalsIgnoreCase(userEmail)) {
            throw new UnauthorizedException("You are not authorized to pay for this booking.");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Cannot process payment for a cancelled booking.");
        }

        Payment existingPayment = paymentRepository.findByBookingId(booking.getId()).orElse(null);
        if (existingPayment != null && existingPayment.getPaymentStatus() == PaymentStatus.SUCCESS) {
            return PaymentDTO.fromEntity(existingPayment);
        }

        // Rule 5: Backend must re-check availability before confirming booking
        List<Booking> conflicting = bookingRepository.findOverlappingBookings(
                booking.getCar().getId(),
                booking.getPickupDate(),
                booking.getReturnDate(),
                List.of(BookingStatus.CONFIRMED)
        ).stream().filter(b -> !b.getId().equals(booking.getId())).toList();

        if (!conflicting.isEmpty() || booking.getCar().getStatus() != CarStatus.AVAILABLE) {
            throw new BookingNotAvailableException("Car is no longer available for the selected dates.");
        }

        Payment payment = existingPayment != null ? existingPayment : new Payment();
        String txnId = ReferenceGenerator.generateTransactionId();
        while (paymentRepository.findByTransactionId(txnId).isPresent()) {
            txnId = ReferenceGenerator.generateTransactionId();
        }

        payment.setBooking(booking);
        payment.setTransactionId(txnId);
        payment.setAmount(booking.getTotalAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setPaymentStatus(PaymentStatus.SUCCESS);
        payment.setPaymentDate(LocalDateTime.now());

        Payment savedPayment = paymentRepository.save(payment);

        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        notificationService.createNotification(
                booking.getUser(),
                "Payment successful (₹" + booking.getTotalAmount() + ", Transaction ID: " + txnId + ").",
                NotificationType.PAYMENT
        );

        notificationService.createNotification(
                booking.getUser(),
                "Booking confirmed successfully! Reference: " + booking.getBookingReference()
                        + " for " + booking.getCar().getBrand() + " " + booking.getCar().getModel() + ".",
                NotificationType.BOOKING
        );

        return PaymentDTO.fromEntity(savedPayment);
    }

    public PaymentDTO getPaymentById(Long id, String userEmail, boolean isAdmin) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + id));

        if (!isAdmin && !payment.getBooking().getUser().getEmail().equalsIgnoreCase(userEmail)) {
            throw new UnauthorizedException("You are not authorized to view this payment.");
        }

        return PaymentDTO.fromEntity(payment);
    }

    public PaymentDTO getPaymentByBookingId(Long bookingId, String userEmail, boolean isAdmin) {
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for booking ID: " + bookingId));

        if (!isAdmin && !payment.getBooking().getUser().getEmail().equalsIgnoreCase(userEmail)) {
            throw new UnauthorizedException("You are not authorized to view this payment.");
        }

        return PaymentDTO.fromEntity(payment);
    }

    public List<PaymentDTO> getAllPayments(PaymentStatus status) {
        List<Payment> list = (status != null)
                ? paymentRepository.findByPaymentStatusOrderByPaymentDateDesc(status)
                : paymentRepository.findAllByOrderByPaymentDateDesc();
        return list.stream().map(PaymentDTO::fromEntity).toList();
    }
}
