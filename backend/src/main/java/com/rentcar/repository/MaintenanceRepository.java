package com.rentcar.repository;

import com.rentcar.entity.Maintenance;
import com.rentcar.entity.MaintenanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {
    List<Maintenance> findAllByOrderByMaintenanceDateDesc();
    List<Maintenance> findByCarIdOrderByMaintenanceDateDesc(Long carId);
    boolean existsByCarIdAndStatusIn(Long carId, List<MaintenanceStatus> statuses);
}
