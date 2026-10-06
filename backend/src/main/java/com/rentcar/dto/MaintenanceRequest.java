package com.rentcar.dto;

import com.rentcar.entity.MaintenanceStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class MaintenanceRequest {

    @NotNull(message = "Car ID is required")
    private Long carId;

    @NotBlank(message = "Maintenance description is required")
    private String description;

    @NotNull(message = "Maintenance date is required")
    private LocalDate maintenanceDate;

    @NotNull(message = "Maintenance cost is required")
    @DecimalMin(value = "0.0", message = "Cost cannot be negative")
    private BigDecimal cost;

    private MaintenanceStatus status = MaintenanceStatus.SCHEDULED;

    public Long getCarId() {
        return carId;
    }

    public void setCarId(Long carId) {
        this.carId = carId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getMaintenanceDate() {
        return maintenanceDate;
    }

    public void setMaintenanceDate(LocalDate maintenanceDate) {
        this.maintenanceDate = maintenanceDate;
    }

    public BigDecimal getCost() {
        return cost;
    }

    public void setCost(BigDecimal cost) {
        this.cost = cost;
    }

    public MaintenanceStatus getStatus() {
        return status;
    }

    public void setStatus(MaintenanceStatus status) {
        this.status = status;
    }
}
