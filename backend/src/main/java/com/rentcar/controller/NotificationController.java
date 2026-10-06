package com.rentcar.controller;

import com.rentcar.dto.ApiResponse;
import com.rentcar.entity.Notification;
import com.rentcar.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getNotifications(Authentication authentication) {
        List<Notification> list = notificationService.getUserNotifications(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved successfully", list));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Notification>> markAsRead(
            @PathVariable Long id,
            Authentication authentication
    ) {
        Notification updated = notificationService.markAsRead(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", updated));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Object>> markAllAsRead(Authentication authentication) {
        notificationService.markAllAsRead(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }
}
