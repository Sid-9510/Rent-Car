package com.rentcar.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class DashboardStatsDTO {
    private long totalUsers;
    private long totalCars;
    private long availableCars;
    private long maintenanceCars;
    private long inactiveCars;
    private long totalBookings;
    private long activeBookings;
    private long completedBookings;
    private long cancelledBookings;
    private BigDecimal totalRevenue;

    private List<Map<String, Object>> monthlyRevenue;
    private List<Map<String, Object>> monthlyBookings;
    private Map<String, Long> bookingStatusDistribution;
    private List<Map<String, Object>> mostRentedCars;
    private List<BookingDTO> recentBookings;

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalCars() {
        return totalCars;
    }

    public void setTotalCars(long totalCars) {
        this.totalCars = totalCars;
    }

    public long getAvailableCars() {
        return availableCars;
    }

    public void setAvailableCars(long availableCars) {
        this.availableCars = availableCars;
    }

    public long getMaintenanceCars() {
        return maintenanceCars;
    }

    public void setMaintenanceCars(long maintenanceCars) {
        this.maintenanceCars = maintenanceCars;
    }

    public long getInactiveCars() {
        return inactiveCars;
    }

    public void setInactiveCars(long inactiveCars) {
        this.inactiveCars = inactiveCars;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public long getActiveBookings() {
        return activeBookings;
    }

    public void setActiveBookings(long activeBookings) {
        this.activeBookings = activeBookings;
    }

    public long getCompletedBookings() {
        return completedBookings;
    }

    public void setCompletedBookings(long completedBookings) {
        this.completedBookings = completedBookings;
    }

    public long getCancelledBookings() {
        return cancelledBookings;
    }

    public void setCancelledBookings(long cancelledBookings) {
        this.cancelledBookings = cancelledBookings;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public List<Map<String, Object>> getMonthlyRevenue() {
        return monthlyRevenue;
    }

    public void setMonthlyRevenue(List<Map<String, Object>> monthlyRevenue) {
        this.monthlyRevenue = monthlyRevenue;
    }

    public List<Map<String, Object>> getMonthlyBookings() {
        return monthlyBookings;
    }

    public void setMonthlyBookings(List<Map<String, Object>> monthlyBookings) {
        this.monthlyBookings = monthlyBookings;
    }

    public Map<String, Long> getBookingStatusDistribution() {
        return bookingStatusDistribution;
    }

    public void setBookingStatusDistribution(Map<String, Long> bookingStatusDistribution) {
        this.bookingStatusDistribution = bookingStatusDistribution;
    }

    public List<Map<String, Object>> getMostRentedCars() {
        return mostRentedCars;
    }

    public void setMostRentedCars(List<Map<String, Object>> mostRentedCars) {
        this.mostRentedCars = mostRentedCars;
    }

    public List<BookingDTO> getRecentBookings() {
        return recentBookings;
    }

    public void setRecentBookings(List<BookingDTO> recentBookings) {
        this.recentBookings = recentBookings;
    }
}
