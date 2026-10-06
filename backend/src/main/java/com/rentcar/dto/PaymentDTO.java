package com.rentcar.dto;

import com.rentcar.entity.Payment;
import com.rentcar.entity.PaymentMethod;
import com.rentcar.entity.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentDTO {
    private Long id;
    private Long bookingId;
    private String bookingReference;
    private String customerName;
    private String customerEmail;
    private String carName;
    private String transactionId;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private LocalDateTime paymentDate;

    public static PaymentDTO fromEntity(Payment p) {
        PaymentDTO dto = new PaymentDTO();
        dto.setId(p.getId());
        dto.setTransactionId(p.getTransactionId());
        dto.setAmount(p.getAmount());
        dto.setPaymentMethod(p.getPaymentMethod());
        dto.setPaymentStatus(p.getPaymentStatus());
        dto.setPaymentDate(p.getPaymentDate());
        if (p.getBooking() != null) {
            dto.setBookingId(p.getBooking().getId());
            dto.setBookingReference(p.getBooking().getBookingReference());
            if (p.getBooking().getUser() != null) {
                dto.setCustomerName(p.getBooking().getUser().getName());
                dto.setCustomerEmail(p.getBooking().getUser().getEmail());
            }
            if (p.getBooking().getCar() != null) {
                dto.setCarName(p.getBooking().getCar().getBrand() + " " + p.getBooking().getCar().getModel());
            }
        }
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public String getBookingReference() {
        return bookingReference;
    }

    public void setBookingReference(String bookingReference) {
        this.bookingReference = bookingReference;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public String getCarName() {
        return carName;
    }

    public void setCarName(String carName) {
        this.carName = carName;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }
}
