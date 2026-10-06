package com.rentcar.dto;

import com.rentcar.entity.Review;

import java.time.LocalDateTime;

public class ReviewDTO {
    private Long id;
    private Long userId;
    private String userName;
    private Long carId;
    private String carName;
    private Long bookingId;
    private String bookingReference;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;

    public static ReviewDTO fromEntity(Review r) {
        ReviewDTO dto = new ReviewDTO();
        dto.setId(r.getId());
        if (r.getUser() != null) {
            dto.setUserId(r.getUser().getId());
            dto.setUserName(r.getUser().getName());
        }
        if (r.getCar() != null) {
            dto.setCarId(r.getCar().getId());
            dto.setCarName(r.getCar().getBrand() + " " + r.getCar().getModel());
        }
        if (r.getBooking() != null) {
            dto.setBookingId(r.getBooking().getId());
            dto.setBookingReference(r.getBooking().getBookingReference());
        }
        dto.setRating(r.getRating());
        dto.setComment(r.getComment());
        dto.setCreatedAt(r.getCreatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public Long getCarId() {
        return carId;
    }

    public void setCarId(Long carId) {
        this.carId = carId;
    }

    public String getCarName() {
        return carName;
    }

    public void setCarName(String carName) {
        this.carName = carName;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public String getBookingReference() {
        return bookingReference;
    }

    public void setBookingReference(String bookingReference) {
        this.bookingReference = bookingReference;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
