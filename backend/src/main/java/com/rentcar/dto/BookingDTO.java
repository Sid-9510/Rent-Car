package com.rentcar.dto;

import com.rentcar.entity.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class BookingDTO {
    private Long id;
    private String bookingReference;
    private Long userId;
    private String userName;
    private String userEmail;
    private String userPhone;
    private Long carId;
    private String carBrand;
    private String carModel;
    private String carName;
    private CarCategory carCategory;
    private String carImageUrl;
    private BigDecimal carPricePerDay;
    private String pickupLocation;
    private String dropLocation;
    private LocalDate pickupDate;
    private LocalTime pickupTime;
    private LocalDate returnDate;
    private LocalTime returnTime;
    private Integer numberOfDays;
    private List<String> selectedExtras;
    private String couponCode;
    private BigDecimal baseAmount;
    private BigDecimal extraAmount;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private BookingStatus status;
    private Long paymentId;
    private String transactionId;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private LocalDateTime paymentDate;
    private boolean reviewed;
    private boolean cancellable;
    private LocalDateTime createdAt;

    public static BookingDTO fromEntity(Booking b, Payment payment, boolean reviewed) {
        BookingDTO dto = new BookingDTO();
        dto.setId(b.getId());
        dto.setBookingReference(b.getBookingReference());
        if (b.getUser() != null) {
            dto.setUserId(b.getUser().getId());
            dto.setUserName(b.getUser().getName());
            dto.setUserEmail(b.getUser().getEmail());
            dto.setUserPhone(b.getUser().getPhone());
        }
        if (b.getCar() != null) {
            dto.setCarId(b.getCar().getId());
            dto.setCarBrand(b.getCar().getBrand());
            dto.setCarModel(b.getCar().getModel());
            dto.setCarName(b.getCar().getBrand() + " " + b.getCar().getModel());
            dto.setCarCategory(b.getCar().getCategory());
            dto.setCarImageUrl(b.getCar().getImageUrl());
            dto.setCarPricePerDay(b.getCar().getPricePerDay());
        }
        dto.setPickupLocation(b.getPickupLocation());
        dto.setDropLocation(b.getDropLocation());
        dto.setPickupDate(b.getPickupDate());
        dto.setPickupTime(b.getPickupTime());
        dto.setReturnDate(b.getReturnDate());
        dto.setReturnTime(b.getReturnTime());
        dto.setNumberOfDays(b.getNumberOfDays());
        if (b.getSelectedExtras() != null && !b.getSelectedExtras().isBlank()) {
            dto.setSelectedExtras(Arrays.asList(b.getSelectedExtras().split(",")));
        } else {
            dto.setSelectedExtras(Collections.emptyList());
        }
        dto.setCouponCode(b.getCouponCode());
        dto.setBaseAmount(b.getBaseAmount());
        dto.setExtraAmount(b.getExtraAmount());
        dto.setDiscountAmount(b.getDiscountAmount());
        dto.setTaxAmount(b.getTaxAmount());
        dto.setTotalAmount(b.getTotalAmount());
        dto.setStatus(b.getStatus());

        if (payment != null) {
            dto.setPaymentId(payment.getId());
            dto.setTransactionId(payment.getTransactionId());
            dto.setPaymentMethod(payment.getPaymentMethod());
            dto.setPaymentStatus(payment.getPaymentStatus());
            dto.setPaymentDate(payment.getPaymentDate());
        } else {
            dto.setPaymentStatus(PaymentStatus.PENDING);
        }

        dto.setReviewed(reviewed);

        boolean canCancel = (b.getStatus() == BookingStatus.PENDING || b.getStatus() == BookingStatus.CONFIRMED)
                && (b.getPickupDate() != null && b.getPickupDate().isAfter(LocalDate.now()));
        dto.setCancellable(canCancel);
        dto.setCreatedAt(b.getCreatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBookingReference() {
        return bookingReference;
    }

    public void setBookingReference(String bookingReference) {
        this.bookingReference = bookingReference;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserPhone() {
        return userPhone;
    }

    public void setUserPhone(String userPhone) {
        this.userPhone = userPhone;
    }

    public Long getCarId() {
        return carId;
    }

    public void setCarId(Long carId) {
        this.carId = carId;
    }

    public String getCarBrand() {
        return carBrand;
    }

    public void setCarBrand(String carBrand) {
        this.carBrand = carBrand;
    }

    public String getCarModel() {
        return carModel;
    }

    public void setCarModel(String carModel) {
        this.carModel = carModel;
    }

    public String getCarName() {
        return carName;
    }

    public void setCarName(String carName) {
        this.carName = carName;
    }

    public CarCategory getCarCategory() {
        return carCategory;
    }

    public void setCarCategory(CarCategory carCategory) {
        this.carCategory = carCategory;
    }

    public String getCarImageUrl() {
        return carImageUrl;
    }

    public void setCarImageUrl(String carImageUrl) {
        this.carImageUrl = carImageUrl;
    }

    public BigDecimal getCarPricePerDay() {
        return carPricePerDay;
    }

    public void setCarPricePerDay(BigDecimal carPricePerDay) {
        this.carPricePerDay = carPricePerDay;
    }

    public String getPickupLocation() {
        return pickupLocation;
    }

    public void setPickupLocation(String pickupLocation) {
        this.pickupLocation = pickupLocation;
    }

    public String getDropLocation() {
        return dropLocation;
    }

    public void setDropLocation(String dropLocation) {
        this.dropLocation = dropLocation;
    }

    public LocalDate getPickupDate() {
        return pickupDate;
    }

    public void setPickupDate(LocalDate pickupDate) {
        this.pickupDate = pickupDate;
    }

    public LocalTime getPickupTime() {
        return pickupTime;
    }

    public void setPickupTime(LocalTime pickupTime) {
        this.pickupTime = pickupTime;
    }

    public LocalDate getReturnDate() {
        return returnDate;
    }

    public void setReturnDate(LocalDate returnDate) {
        this.returnDate = returnDate;
    }

    public LocalTime getReturnTime() {
        return returnTime;
    }

    public void setReturnTime(LocalTime returnTime) {
        this.returnTime = returnTime;
    }

    public Integer getNumberOfDays() {
        return numberOfDays;
    }

    public void setNumberOfDays(Integer numberOfDays) {
        this.numberOfDays = numberOfDays;
    }

    public List<String> getSelectedExtras() {
        return selectedExtras;
    }

    public void setSelectedExtras(List<String> selectedExtras) {
        this.selectedExtras = selectedExtras;
    }

    public String getCouponCode() {
        return couponCode;
    }

    public void setCouponCode(String couponCode) {
        this.couponCode = couponCode;
    }

    public BigDecimal getBaseAmount() {
        return baseAmount;
    }

    public void setBaseAmount(BigDecimal baseAmount) {
        this.baseAmount = baseAmount;
    }

    public BigDecimal getExtraAmount() {
        return extraAmount;
    }

    public void setExtraAmount(BigDecimal extraAmount) {
        this.extraAmount = extraAmount;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }

    public BigDecimal getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public Long getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
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

    public boolean isReviewed() {
        return reviewed;
    }

    public void setReviewed(boolean reviewed) {
        this.reviewed = reviewed;
    }

    public boolean isCancellable() {
        return cancellable;
    }

    public void setCancellable(boolean cancellable) {
        this.cancellable = cancellable;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
