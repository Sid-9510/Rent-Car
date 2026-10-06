package com.rentcar.service;

import com.rentcar.dto.MaintenanceDTO;
import com.rentcar.dto.MaintenanceRequest;
import com.rentcar.entity.Car;
import com.rentcar.entity.CarStatus;
import com.rentcar.entity.Maintenance;
import com.rentcar.entity.MaintenanceStatus;
import com.rentcar.exception.ResourceNotFoundException;
import com.rentcar.repository.CarRepository;
import com.rentcar.repository.MaintenanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;
    private final CarRepository carRepository;
    private final CarService carService;

    public MaintenanceService(MaintenanceRepository maintenanceRepository,
                              CarRepository carRepository,
                              CarService carService) {
        this.maintenanceRepository = maintenanceRepository;
        this.carRepository = carRepository;
        this.carService = carService;
    }

    public List<MaintenanceDTO> getAllMaintenanceRecords() {
        return maintenanceRepository.findAllByOrderByMaintenanceDateDesc()
                .stream()
                .map(MaintenanceDTO::fromEntity)
                .toList();
    }

    @Transactional
    public MaintenanceDTO scheduleMaintenance(MaintenanceRequest request) {
        Car car = carService.getCarEntityById(request.getCarId());

        Maintenance maintenance = new Maintenance();
        maintenance.setCar(car);
        maintenance.setDescription(request.getDescription().trim());
        maintenance.setMaintenanceDate(request.getMaintenanceDate());
        maintenance.setCost(request.getCost());
        MaintenanceStatus status = request.getStatus() != null ? request.getStatus() : MaintenanceStatus.SCHEDULED;
        maintenance.setStatus(status);

        Maintenance saved = maintenanceRepository.save(maintenance);
        syncCarStatusWithMaintenance(car);
        return MaintenanceDTO.fromEntity(saved);
    }

    @Transactional
    public MaintenanceDTO updateMaintenance(Long id, MaintenanceRequest request) {
        Maintenance maintenance = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance record not found with ID: " + id));

        Car car = carService.getCarEntityById(request.getCarId());
        maintenance.setCar(car);
        maintenance.setDescription(request.getDescription().trim());
        maintenance.setMaintenanceDate(request.getMaintenanceDate());
        maintenance.setCost(request.getCost());
        if (request.getStatus() != null) {
            maintenance.setStatus(request.getStatus());
        }

        Maintenance saved = maintenanceRepository.save(maintenance);
        syncCarStatusWithMaintenance(car);
        return MaintenanceDTO.fromEntity(saved);
    }

    @Transactional
    public MaintenanceDTO updateMaintenanceStatus(Long id, MaintenanceStatus status) {
        Maintenance maintenance = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance record not found with ID: " + id));
        maintenance.setStatus(status);
        Maintenance saved = maintenanceRepository.save(maintenance);
        syncCarStatusWithMaintenance(maintenance.getCar());
        return MaintenanceDTO.fromEntity(saved);
    }

    private void syncCarStatusWithMaintenance(Car car) {
        if (car.getStatus() == CarStatus.INACTIVE) {
            return;
        }
        boolean hasActiveMaintenance = maintenanceRepository.existsByCarIdAndStatusIn(
                car.getId(),
                List.of(MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS)
        );
        car.setStatus(hasActiveMaintenance ? CarStatus.MAINTENANCE : CarStatus.AVAILABLE);
        carRepository.save(car);
    }
}
