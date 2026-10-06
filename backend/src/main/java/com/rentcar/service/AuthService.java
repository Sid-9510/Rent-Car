package com.rentcar.service;

import com.rentcar.dto.AuthResponse;
import com.rentcar.dto.LoginRequest;
import com.rentcar.dto.RegisterRequest;
import com.rentcar.dto.UserDTO;
import com.rentcar.entity.NotificationType;
import com.rentcar.entity.Role;
import com.rentcar.entity.User;
import com.rentcar.entity.UserStatus;
import com.rentcar.exception.BadRequestException;
import com.rentcar.exception.UnauthorizedException;
import com.rentcar.repository.UserRepository;
import com.rentcar.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final NotificationService notificationService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       AuthenticationManager authenticationManager,
                       NotificationService notificationService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authenticationManager = authenticationManager;
        this.notificationService = notificationService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BadRequestException("An account with this email already exists.");
        }

        if (request.getConfirmPassword() != null && !request.getConfirmPassword().isBlank()
                && !request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and confirm password do not match.");
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(normalizedEmail);
        user.setPhone(request.getPhone().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setAddress(request.getAddress());
        user.setDrivingLicenseNumber(request.getDrivingLicenseNumber());
        // Always assign ROLE_USER on registration (never allow self-registration as ADMIN)
        user.setRole(Role.USER);
        user.setStatus(UserStatus.ACTIVE);

        User savedUser = userRepository.save(user);

        notificationService.createNotification(
                savedUser,
                "Welcome to RentCar! Use coupon code WELCOME20 for 20% off your first booking.",
                NotificationType.SYSTEM
        );

        String token = jwtTokenProvider.generateToken(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getRole().name()
        );

        return new AuthResponse("Registration successful", token, UserDTO.fromEntity(savedUser));
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
        );

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password."));

        if (user.getStatus() == UserStatus.BLOCKED) {
            throw new UnauthorizedException("Your account has been blocked. Please contact RentCar support.");
        }

        String token = jwtTokenProvider.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole().name()
        );

        return new AuthResponse("Login successful", token, UserDTO.fromEntity(user));
    }
}
