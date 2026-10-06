package com.rentcar.controller;

import com.rentcar.dto.ApiResponse;
import com.rentcar.dto.AuthResponse;
import com.rentcar.dto.LoginRequest;
import com.rentcar.dto.RegisterRequest;
import com.rentcar.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Object>> forgotPassword(@RequestBody Map<String, String> payload) {
        String email = payload.getOrDefault("email", "");
        if (email.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Please provide your registered email address."));
        }
        return ResponseEntity.ok(ApiResponse.success(
                "If an account exists for " + email + ", password reset instructions have been sent.",
                null
        ));
    }
}
