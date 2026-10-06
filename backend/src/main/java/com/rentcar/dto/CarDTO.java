package com.rentcar.dto;

import com.rentcar.entity.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CarDTO {
    private Long id;
    private String brand;
    private String model;
    private Integer year;
    private CarCategory category;
    private FuelType fuelType;
    private TransmissionType transmission;
    private Integer seats;
    private Integer doors;
    private Integer luggageCapacity;
    private BigDecimal pricePerDay;
    private String location;
    private String description;
    private String imageUrl;
    private CarStatus status;
    private Double averageRating;
    private Long reviewCount;
    private boolean availableForDates = true;
    private LocalDateTime createdAt;

    public static CarDTO fromEntity(Car car, Double avgRating, Long reviewCount, boolean availableForDates) {
        CarDTO dto = new CarDTO();
        dto.setId(car.getId());
        dto.setBrand(car.getBrand());
        dto.setModel(car.getModel());
        dto.setYear(car.getYear());
        dto.setCategory(car.getCategory());
        dto.setFuelType(car.getFuelType());
        dto.setTransmission(car.getTransmission());
        dto.setSeats(car.getSeats());
        dto.setDoors(car.getDoors());
        dto.setLuggageCapacity(car.getLuggageCapacity());
        dto.setPricePerDay(car.getPricePerDay());
        dto.setLocation(car.getLocation());
        dto.setDescription(car.getDescription());
        dto.setImageUrl(car.getImageUrl());
        dto.setStatus(car.getStatus());
        dto.setAverageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0);
        dto.setReviewCount(reviewCount != null ? reviewCount : 0L);
        dto.setAvailableForDates(availableForDates && car.getStatus() == CarStatus.AVAILABLE);
        dto.setCreatedAt(car.getCreatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public CarCategory getCategory() {
        return category;
    }

    public void setCategory(CarCategory category) {
        this.category = category;
    }

    public FuelType getFuelType() {
        return fuelType;
    }

    public void setFuelType(FuelType fuelType) {
        this.fuelType = fuelType;
    }

    public TransmissionType getTransmission() {
        return transmission;
    }

    public void setTransmission(TransmissionType transmission) {
        this.transmission = transmission;
    }

    public Integer getSeats() {
        return seats;
    }

    public void setSeats(Integer seats) {
        this.seats = seats;
    }

    public Integer getDoors() {
        return doors;
    }

    public void setDoors(Integer doors) {
        this.doors = doors;
    }

    public Integer getLuggageCapacity() {
        return luggageCapacity;
    }

    public void setLuggageCapacity(Integer luggageCapacity) {
        this.luggageCapacity = luggageCapacity;
    }

    public BigDecimal getPricePerDay() {
        return pricePerDay;
    }

    public void setPricePerDay(BigDecimal pricePerDay) {
        this.pricePerDay = pricePerDay;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public CarStatus getStatus() {
        return status;
    }

    public void setStatus(CarStatus status) {
        this.status = status;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public Long getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(Long reviewCount) {
        this.reviewCount = reviewCount;
    }

    public boolean isAvailableForDates() {
        return availableForDates;
    }

    public void setAvailableForDates(boolean availableForDates) {
        this.availableForDates = availableForDates;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
