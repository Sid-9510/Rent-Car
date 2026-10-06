package com.rentcar.service;

import com.rentcar.dto.PasswordChangeRequest;
import com.rentcar.dto.ProfileUpdateRequest;
import com.rentcar.dto.UserDTO;
import com.rentcar.entity.Role;
import com.rentcar.entity.User;
import com.rentcar.entity.UserStatus;
import com.rentcar.exception.BadRequestException;
import com.rentcar.exception.ResourceNotFoundException;
import com.rentcar.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User getUserEntityByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public UserDTO getUserProfile(String email) {
        return UserDTO.fromEntity(getUserEntityByEmail(email));
    }

    @Transactional
    public UserDTO updateProfile(String email, ProfileUpdateRequest request) {
        User user = getUserEntityByEmail(email);
        user.setName(request.getName().trim());
        user.setPhone(request.getPhone().trim());
        user.setAddress(request.getAddress());
        user.setDrivingLicenseNumber(request.getDrivingLicenseNumber());
        if (request.getProfileImage() != null) {
            user.setProfileImage(request.getProfileImage());
        }
        // Role and status are intentionally never modified here (Rule 13)
        User updated = userRepository.save(user);
        return UserDTO.fromEntity(updated);
    }

    @Transactional
    public void changePassword(String email, PasswordChangeRequest request) {
        User user = getUserEntityByEmail(email);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect.");
        }

        if (request.getConfirmPassword() != null && !request.getConfirmPassword().isBlank()
                && !request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirm password do not match.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(UserDTO::fromEntity)
                .toList();
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        return UserDTO.fromEntity(user);
    }

    @Transactional
    public UserDTO updateUserStatus(Long userId, UserStatus newStatus, String currentAdminEmail) {
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (targetUser.getEmail().equalsIgnoreCase(currentAdminEmail) && newStatus == UserStatus.BLOCKED) {
            throw new BadRequestException("You cannot block your own administrator account.");
        }

        if (targetUser.getRole() == Role.ADMIN && newStatus == UserStatus.BLOCKED) {
            long activeAdmins = userRepository.countByRoleAndStatus(Role.ADMIN, UserStatus.ACTIVE);
            if (activeAdmins <= 1) {
                throw new BadRequestException("Cannot block the last active administrator account.");
            }
        }

        targetUser.setStatus(newStatus);
        return UserDTO.fromEntity(userRepository.save(targetUser));
    }
}
