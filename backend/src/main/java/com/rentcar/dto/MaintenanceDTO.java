package com.rentcar.dto;

import com.rentcar.entity.CarCategory;
import com.rentcar.entity.Maintenance;
import com.rentcar.entity.MaintenanceStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class MaintenanceDTO {
    private Long id;
    private Long carId;
    private String carName;
    private CarCategory carCategory;
    private String description;
    private LocalDate maintenanceDate;
    private BigDecimal cost;
    private MaintenanceStatus status;
    private LocalDateTime createdAt;

    public static MaintenanceDTO fromEntity(Maintenance m) {
        MaintenanceDTO dto = new MaintenanceDTO();
        dto.setId(m.getId());
        if (m.getCar() != null) {
            dto.setCarId(m.getCar().getId());
            dto.setCarName(m.getCar().getBrand() + " " + m.getCar().getModel());
            dto.setCarCategory(m.getCar().getCategory());
        }
        dto.setDescription(m.getDescription());
        dto.setMaintenanceDate(m.getMaintenanceDate());
        dto.setCost(m.getCost());
        dto.setStatus(m.getStatus());
        dto.setCreatedAt(m.getCreatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public CarCategory getCarCategory() {
        return carCategory;
    }

    public void setCarCategory(CarCategory carCategory) {
        this.carCategory = carCategory;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
