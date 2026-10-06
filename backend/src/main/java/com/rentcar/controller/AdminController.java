package com.rentcar.controller;

import com.rentcar.dto.*;
import com.rentcar.entity.*;
import com.rentcar.service.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminDashboardService dashboardService;
    private final CarService carService;
    private final UserService userService;
    private final BookingService bookingService;
    private final PaymentService paymentService;
    private final CouponService couponService;
    private final MaintenanceService maintenanceService;
    private final ReviewService reviewService;

    public AdminController(AdminDashboardService dashboardService,
                           CarService carService,
                           UserService userService,
                           BookingService bookingService,
                           PaymentService paymentService,
                           CouponService couponService,
                           MaintenanceService maintenanceService,
                           ReviewService reviewService) {
        this.dashboardService = dashboardService;
        this.carService = carService;
        this.userService = userService;
        this.bookingService = bookingService;
        this.paymentService = paymentService;
        this.couponService = couponService;
        this.maintenanceService = maintenanceService;
        this.reviewService = reviewService;
    }

    // 1. Dashboard & Revenue Analytics
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(
                "Admin dashboard analytics retrieved",
                dashboardService.getDashboardStats()
        ));
    }

    // 2. Car Management
    @GetMapping("/cars")
    public ResponseEntity<ApiResponse<List<CarDTO>>> getAllCars() {
        List<CarDTO> cars = carService.searchAndFilterCars(
                null, null, null, null, null, null, null, null, null, null, false, "newest", true
        );
        return ResponseEntity.ok(ApiResponse.success("All cars retrieved successfully", cars));
    }

    @PostMapping("/cars")
    public ResponseEntity<ApiResponse<CarDTO>> addCar(@Valid @RequestBody CarRequest request) {
        CarDTO created = carService.addCar(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Car added successfully", created));
    }

    @PutMapping("/cars/{id}")
    public ResponseEntity<ApiResponse<CarDTO>> updateCar(
            @PathVariable Long id,
            @Valid @RequestBody CarRequest request
    ) {
        CarDTO updated = carService.updateCar(id, request);
        return ResponseEntity.ok(ApiResponse.success("Car updated successfully", updated));
    }

    @DeleteMapping("/cars/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteOrDeactivateCar(@PathVariable Long id) {
        String message = carService.deleteOrDeactivateCar(id);
        return ResponseEntity.ok(ApiResponse.success(message, null));
    }

    // 3. User Management
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", userService.getAllUsers()));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<UserDTO>> updateUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            Authentication authentication
    ) {
        UserStatus status = UserStatus.valueOf(payload.get("status").toUpperCase());
        UserDTO updated = userService.updateUserStatus(id, status, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("User status updated to " + status, updated));
    }

    // 4. Booking Management
    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<BookingDTO>>> getAllBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) Long carId,
            @RequestParam(required = false) String customer
    ) {
        List<BookingDTO> bookings = bookingService.getAllBookingsForAdmin(status, carId, customer);
        return ResponseEntity.ok(ApiResponse.success("Bookings retrieved successfully", bookings));
    }

    @PutMapping("/bookings/{id}/status")
    public ResponseEntity<ApiResponse<BookingDTO>> updateBookingStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload
    ) {
        BookingStatus status = BookingStatus.valueOf(payload.get("status").toUpperCase());
        BookingDTO updated = bookingService.updateBookingStatusByAdmin(id, status);
        return ResponseEntity.ok(ApiResponse.success("Booking status updated to " + status, updated));
    }

    // 5. Payment Management
    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<List<PaymentDTO>>> getAllPayments(
            @RequestParam(required = false) PaymentStatus status
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Payments retrieved successfully",
                paymentService.getAllPayments(status)
        ));
    }

    // 6. Coupon Management
    @GetMapping("/coupons")
    public ResponseEntity<ApiResponse<List<Coupon>>> getAllCoupons() {
        return ResponseEntity.ok(ApiResponse.success("Coupons retrieved successfully", couponService.getAllCoupons()));
    }

    @PostMapping("/coupons")
    public ResponseEntity<ApiResponse<Coupon>> createCoupon(@Valid @RequestBody CouponRequest request) {
        Coupon created = couponService.createCoupon(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Coupon created successfully", created));
    }

    @PutMapping("/coupons/{id}")
    public ResponseEntity<ApiResponse<Coupon>> updateCoupon(
            @PathVariable Long id,
            @Valid @RequestBody CouponRequest request
    ) {
        Coupon updated = couponService.updateCoupon(id, request);
        return ResponseEntity.ok(ApiResponse.success("Coupon updated successfully", updated));
    }

    @DeleteMapping("/coupons/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteOrDeactivateCoupon(@PathVariable Long id) {
        String message = couponService.deleteOrDeactivateCoupon(id);
        return ResponseEntity.ok(ApiResponse.success(message, null));
    }

    // 7. Maintenance Management
    @GetMapping("/maintenance")
    public ResponseEntity<ApiResponse<List<MaintenanceDTO>>> getAllMaintenance() {
        return ResponseEntity.ok(ApiResponse.success(
                "Maintenance records retrieved successfully",
                maintenanceService.getAllMaintenanceRecords()
        ));
    }

    @PostMapping("/maintenance")
    public ResponseEntity<ApiResponse<MaintenanceDTO>> scheduleMaintenance(
            @Valid @RequestBody MaintenanceRequest request
    ) {
        MaintenanceDTO created = maintenanceService.scheduleMaintenance(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Maintenance scheduled successfully", created));
    }

    @PutMapping("/maintenance/{id}")
    public ResponseEntity<ApiResponse<MaintenanceDTO>> updateMaintenance(
            @PathVariable Long id,
            @Valid @RequestBody MaintenanceRequest request
    ) {
        MaintenanceDTO updated = maintenanceService.updateMaintenance(id, request);
        return ResponseEntity.ok(ApiResponse.success("Maintenance updated successfully", updated));
    }

    @PatchMapping("/maintenance/{id}/status")
    public ResponseEntity<ApiResponse<MaintenanceDTO>> updateMaintenanceStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload
    ) {
        MaintenanceStatus status = MaintenanceStatus.valueOf(payload.get("status").toUpperCase());
        MaintenanceDTO updated = maintenanceService.updateMaintenanceStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Maintenance status updated to " + status, updated));
    }

    // 8. Review Management
    @GetMapping("/reviews")
    public ResponseEntity<ApiResponse<List<ReviewDTO>>> getAllReviews() {
        return ResponseEntity.ok(ApiResponse.success("Reviews retrieved successfully", reviewService.getAllReviews()));
    }

    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok(ApiResponse.success("Review removed successfully", null));
    }
}
