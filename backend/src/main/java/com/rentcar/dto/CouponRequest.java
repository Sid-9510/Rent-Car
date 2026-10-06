package com.rentcar.dto;

import com.rentcar.entity.CouponStatus;
import com.rentcar.entity.DiscountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CouponRequest {

    @NotBlank(message = "Coupon code is required")
    private String code;

    @NotNull(message = "Discount type is required")
    private DiscountType discountType;

    @NotNull(message = "Discount value is required")
    @DecimalMin(value = "1.0", message = "Discount value must be greater than 0")
    private BigDecimal discountValue;

    @NotNull(message = "Minimum booking amount is required")
    @DecimalMin(value = "0.0", message = "Minimum booking amount cannot be negative")
    private BigDecimal minimumBookingAmount;

    @NotNull(message = "Expiry date is required")
    private LocalDate expiryDate;

    @NotNull(message = "Usage limit is required")
    @Min(value = 1, message = "Usage limit must be at least 1")
    private Integer usageLimit;

    private CouponStatus status = CouponStatus.ACTIVE;

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public DiscountType getDiscountType() {
        return discountType;
    }

    public void setDiscountType(DiscountType discountType) {
        this.discountType = discountType;
    }

    public BigDecimal getDiscountValue() {
        return discountValue;
    }

    public void setDiscountValue(BigDecimal discountValue) {
        this.discountValue = discountValue;
    }

    public BigDecimal getMinimumBookingAmount() {
        return minimumBookingAmount;
    }

    public void setMinimumBookingAmount(BigDecimal minimumBookingAmount) {
        this.minimumBookingAmount = minimumBookingAmount;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public Integer getUsageLimit() {
        return usageLimit;
    }

    public void setUsageLimit(Integer usageLimit) {
        this.usageLimit = usageLimit;
    }

    public CouponStatus getStatus() {
        return status;
    }

    public void setStatus(CouponStatus status) {
        this.status = status;
    }
}
