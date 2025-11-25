package com.allconnect.notification.service;

import com.allconnect.notification.dto.NotificationRequest;
import com.allconnect.notification.model.NotificationChannel;
import com.allconnect.notification.model.NotificationType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationEventConsumer {

    private final NotificationService notificationService;

    @KafkaListener(topics = "notification-events", groupId = "notification-service-group")
    public void handleNotificationEvent(Map<String, Object> event) {
        log.info("Received notification event: {}", event);

        try {
            String type = (String) event.get("type");
            Long customerId = getLongValue(event.get("customerId"));
            Long orderId = getLongValue(event.get("orderId"));
            String channel = (String) event.getOrDefault("channel", "EMAIL");

            NotificationType notificationType = mapEventTypeToNotificationType(type);

            NotificationRequest request = NotificationRequest.builder()
                    .customerId(customerId)
                    .type(notificationType)
                    .channel(NotificationChannel.valueOf(channel))
                    .recipient(customerId + "@customer.allconnect.com") // Mock email
                    .orderId(orderId)
                    .build();

            notificationService.sendEmail(request);
            log.info("Notification processed for customer: {}", customerId);

        } catch (Exception e) {
            log.error("Error processing notification event: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "user-events", groupId = "notification-service-group")
    public void handleUserEvent(Map<String, Object> event) {
        log.info("Received user event: {}", event);

        try {
            String eventType = (String) event.get("eventType");

            if ("user.registered".equals(eventType)) {
                Long userId = getLongValue(event.get("userId"));
                String email = (String) event.get("email");

                NotificationRequest request = NotificationRequest.builder()
                        .customerId(userId)
                        .type(NotificationType.WELCOME)
                        .channel(NotificationChannel.EMAIL)
                        .recipient(email)
                        .build();

                notificationService.sendEmail(request);
                log.info("Welcome email sent to new user: {}", email);
            }

        } catch (Exception e) {
            log.error("Error processing user event: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "order-events", groupId = "notification-service-group")
    public void handleOrderEvent(Map<String, Object> event) {
        log.info("Received order event: {}", event);

        try {
            String eventType = (String) event.get("eventType");
            Long orderId = getLongValue(event.get("orderId"));
            Long customerId = getLongValue(event.get("customerId"));

            NotificationType notificationType = switch (eventType) {
                case "order.created" -> NotificationType.ORDER_CONFIRMATION;
                case "order.completed" -> NotificationType.ORDER_SHIPPED;
                case "order.cancelled" -> NotificationType.ORDER_CANCELLED;
                default -> null;
            };

            if (notificationType != null) {
                NotificationRequest request = NotificationRequest.builder()
                        .customerId(customerId)
                        .type(notificationType)
                        .channel(NotificationChannel.EMAIL)
                        .recipient(customerId + "@customer.allconnect.com")
                        .orderId(orderId)
                        .build();

                notificationService.sendEmail(request);
                log.info("Order notification sent for order: {}", orderId);
            }

        } catch (Exception e) {
            log.error("Error processing order event: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "payment-events", groupId = "notification-service-group")
    public void handlePaymentEvent(Map<String, Object> event) {
        log.info("Received payment event: {}", event);

        try {
            String eventType = (String) event.get("eventType");
            Long orderId = getLongValue(event.get("orderId"));
            Long customerId = getLongValue(event.get("customerId"));

            NotificationType notificationType = switch (eventType) {
                case "payment.completed" -> NotificationType.PAYMENT_RECEIVED;
                case "payment.failed" -> NotificationType.PAYMENT_FAILED;
                default -> null;
            };

            if (notificationType != null) {
                NotificationRequest request = NotificationRequest.builder()
                        .customerId(customerId)
                        .type(notificationType)
                        .channel(NotificationChannel.EMAIL)
                        .recipient(customerId + "@customer.allconnect.com")
                        .orderId(orderId)
                        .build();

                notificationService.sendEmail(request);
                log.info("Payment notification sent for order: {}", orderId);
            }

        } catch (Exception e) {
            log.error("Error processing payment event: {}", e.getMessage());
        }
    }

    private NotificationType mapEventTypeToNotificationType(String type) {
        if (type == null) return NotificationType.GENERAL;
        return switch (type.toUpperCase()) {
            case "ORDER_CONFIRMATION" -> NotificationType.ORDER_CONFIRMATION;
            case "ORDER_SHIPPED" -> NotificationType.ORDER_SHIPPED;
            case "ORDER_DELIVERED" -> NotificationType.ORDER_DELIVERED;
            case "ORDER_CANCELLED" -> NotificationType.ORDER_CANCELLED;
            case "PAYMENT_RECEIVED" -> NotificationType.PAYMENT_RECEIVED;
            case "PAYMENT_FAILED" -> NotificationType.PAYMENT_FAILED;
            case "WELCOME" -> NotificationType.WELCOME;
            default -> NotificationType.GENERAL;
        };
    }

    private Long getLongValue(Object value) {
        if (value == null) return null;
        if (value instanceof Long) return (Long) value;
        if (value instanceof Integer) return ((Integer) value).longValue();
        if (value instanceof Number) return ((Number) value).longValue();
        return Long.parseLong(value.toString());
    }
}
