package com.rentcar.controller;

import com.rentcar.dto.ApiResponse;
import com.rentcar.dto.PasswordChangeRequest;
import com.rentcar.dto.ProfileUpdateRequest;
import com.rentcar.dto.UserDTO;
import com.rentcar.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping({"/users/me", "/profile"})
    public ResponseEntity<ApiResponse<UserDTO>> getProfile(Authentication authentication) {
        UserDTO profile = userService.getUserProfile(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", profile));
    }

    @PutMapping({"/users/me", "/profile"})
    public ResponseEntity<ApiResponse<UserDTO>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody ProfileUpdateRequest request) {
        UserDTO updated = userService.updateProfile(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    @PutMapping({"/users/change-password", "/profile/password"})
    public ResponseEntity<ApiResponse<Object>> changePassword(
            Authentication authentication,
            @Valid @RequestBody PasswordChangeRequest request) {
        userService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }
}
