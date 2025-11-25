package com.allconnect.notification.controller;

import com.allconnect.notification.dto.NotificationRequest;
import com.allconnect.notification.dto.NotificationResponse;
import com.allconnect.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Notification Management APIs")
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/email")
    @Operation(summary = "Send email notification")
    public ResponseEntity<NotificationResponse> sendEmail(@Valid @RequestBody NotificationRequest request) {
        return ResponseEntity.ok(notificationService.sendEmail(request));
    }

    @PostMapping("/sms")
    @Operation(summary = "Send SMS notification")
    public ResponseEntity<NotificationResponse> sendSms(@Valid @RequestBody NotificationRequest request) {
        return ResponseEntity.ok(notificationService.sendSms(request));
    }

    @PostMapping("/push")
    @Operation(summary = "Send push notification")
    public ResponseEntity<NotificationResponse> sendPush(@Valid @RequestBody NotificationRequest request) {
        return ResponseEntity.ok(notificationService.sendPush(request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get notification by ID")
    public ResponseEntity<NotificationResponse> getNotificationById(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.getNotificationById(id));
    }

    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Get notifications by customer")
    public ResponseEntity<List<NotificationResponse>> getNotificationsByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(notificationService.getNotificationsByCustomer(customerId));
    }

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Get notifications by order")
    public ResponseEntity<List<NotificationResponse>> getNotificationsByOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(notificationService.getNotificationsByOrder(orderId));
    }
}
