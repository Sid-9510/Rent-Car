package com.rentcar.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class BookingRequest {

    @NotNull(message = "Car ID is required")
    private Long carId;

    @NotBlank(message = "Pickup location is required")
    private String pickupLocation;

    @NotBlank(message = "Drop-off location is required")
    private String dropLocation;

    @NotNull(message = "Pickup date is required")
    private LocalDate pickupDate;

    @NotNull(message = "Pickup time is required")
    private LocalTime pickupTime;

    @NotNull(message = "Return date is required")
    private LocalDate returnDate;

    @NotNull(message = "Return time is required")
    private LocalTime returnTime;

    private List<String> selectedExtras;
    private String couponCode;

    public Long getCarId() {
        return carId;
    }

    public void setCarId(Long carId) {
        this.carId = carId;
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
}
