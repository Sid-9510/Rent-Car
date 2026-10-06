package com.rentcar.exception;

public class BookingNotAvailableException extends RuntimeException {
    public BookingNotAvailableException(String message) {
        super(message);
    }
}
