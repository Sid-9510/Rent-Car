package com.rentcar.controller;

import com.rentcar.dto.ApiResponse;
import com.rentcar.dto.CarDTO;
import com.rentcar.service.FavoriteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CarDTO>>> getFavorites(Authentication authentication) {
        List<CarDTO> favorites = favoriteService.getUserFavorites(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Favorite cars retrieved successfully", favorites));
    }

    @PostMapping("/{carId}")
    public ResponseEntity<ApiResponse<CarDTO>> addFavorite(
            @PathVariable Long carId,
            Authentication authentication
    ) {
        CarDTO car = favoriteService.addFavorite(authentication.getName(), carId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Car added to favorites", car));
    }

    @DeleteMapping("/{carId}")
    public ResponseEntity<ApiResponse<Object>> removeFavorite(
            @PathVariable Long carId,
            Authentication authentication
    ) {
        favoriteService.removeFavorite(authentication.getName(), carId);
        return ResponseEntity.ok(ApiResponse.success("Car removed from favorites", null));
    }
}
