package com.rentcar.controller;

import com.rentcar.dto.ApiResponse;
import com.rentcar.dto.PaymentDTO;
import com.rentcar.dto.PaymentRequest;
import com.rentcar.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentDTO>> processPayment(
            Authentication authentication,
            @Valid @RequestBody PaymentRequest request
    ) {
        PaymentDTO payment = paymentService.processSimulatedPayment(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment processed successfully", payment));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentDTO>> getPaymentById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN") || a.equals("ADMIN"));
        PaymentDTO payment = paymentService.getPaymentById(id, authentication.getName(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Payment details retrieved successfully", payment));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ApiResponse<PaymentDTO>> getPaymentByBookingId(
            @PathVariable Long bookingId,
            Authentication authentication
    ) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN") || a.equals("ADMIN"));
        PaymentDTO payment = paymentService.getPaymentByBookingId(bookingId, authentication.getName(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Payment details retrieved successfully", payment));
    }
}
