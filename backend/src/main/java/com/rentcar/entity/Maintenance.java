package com.rentcar.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance", indexes = {
        @Index(name = "idx_maintenance_car", columnList = "car_id"),
        @Index(name = "idx_maintenance_status", columnList = "status")
})
public class Maintenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "car_id", nullable = false)
    private Car car;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(name = "maintenance_date", nullable = false)
    private LocalDate maintenanceDate;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal cost;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private MaintenanceStatus status = MaintenanceStatus.SCHEDULED;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = MaintenanceStatus.SCHEDULED;
        }
    }

    public Maintenance() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Car getCar() {
        return car;
    }

    public void setCar(Car car) {
        this.car = car;
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
