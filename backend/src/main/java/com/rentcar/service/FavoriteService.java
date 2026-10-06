package com.rentcar.service;

import com.rentcar.dto.CarDTO;
import com.rentcar.entity.Car;
import com.rentcar.entity.Favorite;
import com.rentcar.entity.User;
import com.rentcar.exception.BadRequestException;
import com.rentcar.repository.FavoriteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserService userService;
    private final CarService carService;

    public FavoriteService(FavoriteRepository favoriteRepository,
                           UserService userService,
                           CarService carService) {
        this.favoriteRepository = favoriteRepository;
        this.userService = userService;
        this.carService = carService;
    }

    public List<CarDTO> getUserFavorites(String userEmail) {
        User user = userService.getUserEntityByEmail(userEmail);
        return favoriteRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(fav -> carService.toDTO(fav.getCar(), null, null))
                .toList();
    }

    @Transactional
    public CarDTO addFavorite(String userEmail, Long carId) {
        User user = userService.getUserEntityByEmail(userEmail);
        Car car = carService.getCarEntityById(carId);

        if (favoriteRepository.existsByUserIdAndCarId(user.getId(), carId)) {
            throw new BadRequestException("This car is already in your favorites.");
        }

        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setCar(car);
        favoriteRepository.save(favorite);

        return carService.toDTO(car, null, null);
    }

    @Transactional
    public void removeFavorite(String userEmail, Long carId) {
        User user = userService.getUserEntityByEmail(userEmail);
        favoriteRepository.deleteByUserIdAndCarId(user.getId(), carId);
    }
}
