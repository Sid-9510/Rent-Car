package com.rentcar.repository;

import com.rentcar.entity.Payment;
import com.rentcar.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByBookingId(Long bookingId);
    Optional<Payment> findByTransactionId(String transactionId);
    List<Payment> findAllByOrderByPaymentDateDesc();
    List<Payment> findByPaymentStatusOrderByPaymentDateDesc(PaymentStatus status);
}
