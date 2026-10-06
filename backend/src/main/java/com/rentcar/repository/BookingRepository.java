package com.rentcar.repository;

import com.rentcar.entity.Booking;
import com.rentcar.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Booking> findByBookingReference(String bookingReference);

    boolean existsByCarId(Long carId);

    @Query("SELECT b FROM Booking b WHERE b.car.id = :carId " +
           "AND b.status IN :statuses " +
           "AND b.pickupDate <= :returnDate " +
           "AND b.returnDate >= :pickupDate")
    List<Booking> findOverlappingBookings(
            @Param("carId") Long carId,
            @Param("pickupDate") LocalDate pickupDate,
            @Param("returnDate") LocalDate returnDate,
            @Param("statuses") List<BookingStatus> statuses
    );

    List<Booking> findByUserIdAndCarIdAndStatusOrderByCreatedAtDesc(
            Long userId, Long carId, BookingStatus status);

    long countByStatus(BookingStatus status);

    List<Booking> findAllByOrderByCreatedAtDesc();
}
