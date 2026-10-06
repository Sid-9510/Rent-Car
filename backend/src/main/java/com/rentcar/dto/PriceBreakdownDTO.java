package com.rentcar.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class PriceBreakdownDTO {
    private Long carId;
    private BigDecimal pricePerDay;
    private int numberOfDays;
    private BigDecimal baseAmount;
    private List<String> selectedExtras;
    private Map<String, BigDecimal> extrasBreakdown;
    private BigDecimal extraAmount;
    private String couponCode;
    private BigDecimal discountAmount;
    private BigDecimal taxRatePercentage;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private boolean available;
    private String availabilityMessage;

    public Long getCarId() {
        return carId;
    }

    public void setCarId(Long carId) {
        this.carId = carId;
    }

    public BigDecimal getPricePerDay() {
        return pricePerDay;
    }

    public void setPricePerDay(BigDecimal pricePerDay) {
        this.pricePerDay = pricePerDay;
    }

    public int getNumberOfDays() {
        return numberOfDays;
    }

    public void setNumberOfDays(int numberOfDays) {
        this.numberOfDays = numberOfDays;
    }

    public BigDecimal getBaseAmount() {
        return baseAmount;
    }

    public void setBaseAmount(BigDecimal baseAmount) {
        this.baseAmount = baseAmount;
    }

    public List<String> getSelectedExtras() {
        return selectedExtras;
    }

    public void setSelectedExtras(List<String> selectedExtras) {
        this.selectedExtras = selectedExtras;
    }

    public Map<String, BigDecimal> getExtrasBreakdown() {
        return extrasBreakdown;
    }

    public void setExtrasBreakdown(Map<String, BigDecimal> extrasBreakdown) {
        this.extrasBreakdown = extrasBreakdown;
    }

    public BigDecimal getExtraAmount() {
        return extraAmount;
    }

    public void setExtraAmount(BigDecimal extraAmount) {
        this.extraAmount = extraAmount;
    }

    public String getCouponCode() {
        return couponCode;
    }

    public void setCouponCode(String couponCode) {
        this.couponCode = couponCode;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }

    public BigDecimal getTaxRatePercentage() {
        return taxRatePercentage;
    }

    public void setTaxRatePercentage(BigDecimal taxRatePercentage) {
        this.taxRatePercentage = taxRatePercentage;
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

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public String getAvailabilityMessage() {
        return availabilityMessage;
    }

    public void setAvailabilityMessage(String availabilityMessage) {
        this.availabilityMessage = availabilityMessage;
    }
}
