package com.rentcar.repository;

import com.rentcar.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Favorite> findByUserIdAndCarId(Long userId, Long carId);
    boolean existsByUserIdAndCarId(Long userId, Long carId);
    void deleteByUserIdAndCarId(Long userId, Long carId);
}
