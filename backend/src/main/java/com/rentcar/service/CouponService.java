package com.rentcar.service;

import com.rentcar.dto.CouponRequest;
import com.rentcar.entity.Coupon;
import com.rentcar.entity.CouponStatus;
import com.rentcar.entity.DiscountType;
import com.rentcar.exception.BadRequestException;
import com.rentcar.exception.InvalidCouponException;
import com.rentcar.exception.ResourceNotFoundException;
import com.rentcar.repository.CouponRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class CouponService {

    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    public Coupon validateCoupon(String code, BigDecimal bookingSubtotal) {
        if (code == null || code.isBlank()) {
            throw new InvalidCouponException("Coupon code cannot be empty.");
        }
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> new InvalidCouponException("Invalid coupon code: " + code));

        if (coupon.getStatus() != CouponStatus.ACTIVE) {
            throw new InvalidCouponException("This coupon is currently inactive.");
        }

        if (coupon.getExpiryDate().isBefore(LocalDate.now())) {
            throw new InvalidCouponException("This coupon has expired.");
        }

        if (coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new InvalidCouponException("This coupon has reached its maximum usage limit.");
        }

        if (bookingSubtotal != null && bookingSubtotal.compareTo(coupon.getMinimumBookingAmount()) < 0) {
            throw new InvalidCouponException(String.format(
                    "Minimum booking amount of ₹%s is required for coupon %s.",
                    coupon.getMinimumBookingAmount().setScale(0, RoundingMode.HALF_UP),
                    coupon.getCode()
            ));
        }

        return coupon;
    }

    public BigDecimal calculateDiscount(Coupon coupon, BigDecimal subtotal) {
        if (coupon == null || subtotal == null || subtotal.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal discount;
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = subtotal.multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            discount = coupon.getDiscountValue();
        }
        return discount.min(subtotal).setScale(2, RoundingMode.HALF_UP);
    }

    @Transactional
    public void incrementUsage(String code) {
        if (code == null || code.isBlank()) return;
        couponRepository.findByCodeIgnoreCase(code.trim()).ifPresent(coupon -> {
            coupon.setUsedCount(coupon.getUsedCount() + 1);
            couponRepository.save(coupon);
        });
    }

    public List<Coupon> getAllCoupons() {
        return couponRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Coupon> getActiveCoupons() {
        return couponRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(c -> c.getStatus() == CouponStatus.ACTIVE
                        && !c.getExpiryDate().isBefore(LocalDate.now())
                        && c.getUsedCount() < c.getUsageLimit())
                .toList();
    }

    @Transactional
    public Coupon createCoupon(CouponRequest request) {
        String normalizedCode = request.getCode().trim().toUpperCase();
        if (couponRepository.existsByCodeIgnoreCase(normalizedCode)) {
            throw new BadRequestException("Coupon code '" + normalizedCode + "' already exists.");
        }
        Coupon coupon = new Coupon();
        mapRequestToCoupon(request, coupon);
        coupon.setCode(normalizedCode);
        return couponRepository.save(coupon);
    }

    @Transactional
    public Coupon updateCoupon(Long id, CouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with ID: " + id));
        String normalizedCode = request.getCode().trim().toUpperCase();
        couponRepository.findByCodeIgnoreCase(normalizedCode).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new BadRequestException("Coupon code '" + normalizedCode + "' is already used by another coupon.");
            }
        });
        mapRequestToCoupon(request, coupon);
        coupon.setCode(normalizedCode);
        return couponRepository.save(coupon);
    }

    @Transactional
    public String deleteOrDeactivateCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with ID: " + id));
        if (coupon.getUsedCount() > 0) {
            coupon.setStatus(CouponStatus.INACTIVE);
            couponRepository.save(coupon);
            return "Coupon has been used previously and was marked as INACTIVE.";
        } else {
            couponRepository.delete(coupon);
            return "Unused coupon deleted successfully.";
        }
    }

    private void mapRequestToCoupon(CouponRequest request, Coupon coupon) {
        coupon.setDiscountType(request.getDiscountType());
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMinimumBookingAmount(request.getMinimumBookingAmount());
        coupon.setExpiryDate(request.getExpiryDate());
        coupon.setUsageLimit(request.getUsageLimit());
        coupon.setStatus(request.getStatus() != null ? request.getStatus() : CouponStatus.ACTIVE);
    }
}
