package com.rentcar.repository;

import com.rentcar.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByCarIdOrderByCreatedAtDesc(Long carId);
    boolean existsByBookingId(Long bookingId);
    Optional<Review> findByBookingId(Long bookingId);
    List<Review> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.car.id = :carId")
    Double getAverageRatingForCar(@Param("carId") Long carId);

    long countByCarId(Long carId);
}
