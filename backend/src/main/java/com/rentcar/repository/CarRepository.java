package com.rentcar.repository;

import com.rentcar.entity.Car;
import com.rentcar.entity.CarStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CarRepository extends JpaRepository<Car, Long> {
    List<Car> findByStatusNot(CarStatus status);
    long countByStatus(CarStatus status);
    List<Car> findAllByOrderByCreatedAtDesc();
}
