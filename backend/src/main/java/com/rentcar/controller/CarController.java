package com.rentcar.controller;

import com.rentcar.dto.ApiResponse;
import com.rentcar.dto.CarDTO;
import com.rentcar.dto.ReviewDTO;
import com.rentcar.dto.ReviewRequest;
import com.rentcar.entity.CarCategory;
import com.rentcar.entity.FuelType;
import com.rentcar.entity.TransmissionType;
import com.rentcar.service.CarService;
import com.rentcar.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
public class CarController {

    private final CarService carService;
    private final ReviewService reviewService;

    public CarController(CarService carService, ReviewService reviewService) {
        this.carService = carService;
        this.reviewService = reviewService;
    }

    @GetMapping("/cars")
    public ResponseEntity<ApiResponse<List<CarDTO>>> getCars(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) CarCategory category,
            @RequestParam(required = false) FuelType fuelType,
            @RequestParam(required = false) TransmissionType transmission,
            @RequestParam(required = false) Integer seats,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate pickupDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate returnDate,
            @RequestParam(required = false) Boolean availableOnly,
            @RequestParam(required = false, defaultValue = "newest") String sortBy
    ) {
        List<CarDTO> cars = carService.searchAndFilterCars(
                keyword, location, category, fuelType, transmission, seats,
                minPrice, maxPrice, pickupDate, returnDate, availableOnly, sortBy, false
        );
        return ResponseEntity.ok(ApiResponse.success("Cars retrieved successfully", cars));
    }

    @GetMapping("/cars/{id}")
    public ResponseEntity<ApiResponse<CarDTO>> getCarById(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate pickupDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate returnDate
    ) {
        CarDTO car = carService.getCarById(id, pickupDate, returnDate);
        return ResponseEntity.ok(ApiResponse.success("Car details retrieved successfully", car));
    }

    @GetMapping("/cars/{carId}/reviews")
    public ResponseEntity<ApiResponse<List<ReviewDTO>>> getCarReviews(@PathVariable Long carId) {
        List<ReviewDTO> reviews = reviewService.getReviewsForCar(carId);
        return ResponseEntity.ok(ApiResponse.success("Reviews retrieved successfully", reviews));
    }

    @PostMapping("/cars/{carId}/reviews")
    public ResponseEntity<ApiResponse<ReviewDTO>> createReview(
            @PathVariable Long carId,
            Authentication authentication,
            @Valid @RequestBody ReviewRequest request
    ) {
        ReviewDTO created = reviewService.addReview(authentication.getName(), carId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review submitted successfully", created));
    }

    @GetMapping("/reviews/public")
    public ResponseEntity<ApiResponse<List<ReviewDTO>>> getPublicReviews() {
        List<ReviewDTO> reviews = reviewService.getAllReviews().stream().limit(6).toList();
        return ResponseEntity.ok(ApiResponse.success("Recent customer reviews retrieved successfully", reviews));
    }
}
