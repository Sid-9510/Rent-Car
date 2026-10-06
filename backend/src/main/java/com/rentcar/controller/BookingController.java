package com.rentcar.controller;

import com.rentcar.dto.ApiResponse;
import com.rentcar.dto.BookingDTO;
import com.rentcar.dto.BookingRequest;
import com.rentcar.dto.PriceBreakdownDTO;
import com.rentcar.entity.Coupon;
import com.rentcar.service.BookingService;
import com.rentcar.service.CouponService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class BookingController {

    private final BookingService bookingService;
    private final CouponService couponService;

    public BookingController(BookingService bookingService, CouponService couponService) {
        this.bookingService = bookingService;
        this.couponService = couponService;
    }

    @PostMapping("/bookings/calculate-price")
    public ResponseEntity<ApiResponse<PriceBreakdownDTO>> calculatePrice(@RequestBody Map<String, Object> body) {
        Long carId = Long.valueOf(body.get("carId").toString());
        LocalDate pickupDate = LocalDate.parse(body.get("pickupDate").toString());
        LocalDate returnDate = LocalDate.parse(body.get("returnDate").toString());
        @SuppressWarnings("unchecked")
        List<String> selectedExtras = (List<String>) body.get("selectedExtras");
        String couponCode = body.get("couponCode") != null ? body.get("couponCode").toString() : null;

        PriceBreakdownDTO breakdown = bookingService.calculatePrice(
                carId, pickupDate, returnDate, selectedExtras, couponCode
        );
        return ResponseEntity.ok(ApiResponse.success("Price calculated successfully", breakdown));
    }

    @GetMapping("/bookings/check-availability")
    public ResponseEntity<ApiResponse<PriceBreakdownDTO>> checkAvailability(
            @RequestParam Long carId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate pickupDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate returnDate
    ) {
        PriceBreakdownDTO breakdown = bookingService.calculatePrice(carId, pickupDate, returnDate, null, null);
        return ResponseEntity.ok(ApiResponse.success(breakdown.getAvailabilityMessage(), breakdown));
    }

    @PostMapping("/bookings")
    public ResponseEntity<ApiResponse<BookingDTO>> createBooking(
            Authentication authentication,
            @Valid @RequestBody BookingRequest request
    ) {
        BookingDTO created = bookingService.createBooking(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking created successfully. Please complete payment.", created));
    }

    @GetMapping("/bookings/my")
    public ResponseEntity<ApiResponse<List<BookingDTO>>> getMyBookings(Authentication authentication) {
        List<BookingDTO> bookings = bookingService.getUserBookings(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("User bookings retrieved successfully", bookings));
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<ApiResponse<BookingDTO>> getBookingById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        boolean isAdmin = isAdmin(authentication);
        BookingDTO booking = bookingService.getBookingById(id, authentication.getName(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Booking details retrieved successfully", booking));
    }

    @PutMapping("/bookings/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingDTO>> cancelBooking(
            @PathVariable Long id,
            Authentication authentication
    ) {
        boolean isAdmin = isAdmin(authentication);
        BookingDTO cancelled = bookingService.cancelBooking(id, authentication.getName(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully", cancelled));
    }

    @GetMapping("/coupons/active")
    public ResponseEntity<ApiResponse<List<Coupon>>> getActiveCoupons() {
        return ResponseEntity.ok(ApiResponse.success("Active coupons retrieved", couponService.getActiveCoupons()));
    }

    private boolean isAdmin(Authentication authentication) {
        if (authentication == null) return false;
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN") || a.equals("ADMIN"));
    }
}
