package com.rentcar.service;

import com.rentcar.dto.ReviewDTO;
import com.rentcar.dto.ReviewRequest;
import com.rentcar.entity.*;
import com.rentcar.exception.BadRequestException;
import com.rentcar.exception.ResourceNotFoundException;
import com.rentcar.exception.UnauthorizedException;
import com.rentcar.repository.BookingRepository;
import com.rentcar.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final UserService userService;
    private final CarService carService;
    private final NotificationService notificationService;

    public ReviewService(ReviewRepository reviewRepository,
                         BookingRepository bookingRepository,
                         UserService userService,
                         CarService carService,
                         NotificationService notificationService) {
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
        this.userService = userService;
        this.carService = carService;
        this.notificationService = notificationService;
    }

    public List<ReviewDTO> getReviewsForCar(Long carId) {
        return reviewRepository.findByCarIdOrderByCreatedAtDesc(carId)
                .stream()
                .map(ReviewDTO::fromEntity)
                .toList();
    }

    public List<ReviewDTO> getAllReviews() {
        return reviewRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(ReviewDTO::fromEntity)
                .toList();
    }

    @Transactional
    public ReviewDTO addReview(String userEmail, Long carId, ReviewRequest request) {
        User user = userService.getUserEntityByEmail(userEmail);
        Car car = carService.getCarEntityById(carId);

        Booking targetBooking;
        if (request.getBookingId() != null) {
            targetBooking = bookingRepository.findById(request.getBookingId())
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
            if (!targetBooking.getUser().getId().equals(user.getId())) {
                throw new UnauthorizedException("You can only review your own bookings.");
            }
            if (!targetBooking.getCar().getId().equals(carId)) {
                throw new BadRequestException("Selected booking does not match this car.");
            }
            // Rule 8: A user cannot review a booking that has not been completed
            if (targetBooking.getStatus() != BookingStatus.COMPLETED) {
                throw new BadRequestException("You can only submit a review after completing the booking.");
            }
            // Rule 9: A user cannot review the same booking twice
            if (reviewRepository.existsByBookingId(targetBooking.getId())) {
                throw new BadRequestException("You have already submitted a review for this booking.");
            }
        } else {
            // Find an unreviewed COMPLETED booking for this user and car
            List<Booking> completedBookings = bookingRepository.findByUserIdAndCarIdAndStatusOrderByCreatedAtDesc(
                    user.getId(), carId, BookingStatus.COMPLETED
            );
            if (completedBookings.isEmpty()) {
                throw new BadRequestException("You can only review a car after completing a rental for it.");
            }
            targetBooking = completedBookings.stream()
                    .filter(b -> !reviewRepository.existsByBookingId(b.getId()))
                    .findFirst()
                    .orElseThrow(() -> new BadRequestException("You have already reviewed all your completed bookings for this car."));
        }

        Review review = new Review();
        review.setUser(user);
        review.setCar(car);
        review.setBooking(targetBooking);
        review.setRating(request.getRating());
        review.setComment(request.getComment().trim());

        Review saved = reviewRepository.save(review);

        notificationService.createNotification(
                user,
                "Your review for " + car.getBrand() + " " + car.getModel() + " was submitted. Thank you for your feedback!",
                NotificationType.REVIEW
        );

        return ReviewDTO.fromEntity(saved);
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with ID: " + reviewId));
        reviewRepository.delete(review);
    }
}
