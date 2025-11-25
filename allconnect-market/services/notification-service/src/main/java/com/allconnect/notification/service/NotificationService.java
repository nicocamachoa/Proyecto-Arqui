package com.allconnect.notification.service;

import com.allconnect.notification.dto.NotificationRequest;
import com.allconnect.notification.dto.NotificationResponse;
import com.allconnect.notification.model.*;
import com.allconnect.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Transactional
    public NotificationResponse sendEmail(NotificationRequest request) {
        log.info("Sending email notification to customer: {}", request.getCustomerId());

        Notification notification = createNotification(request, NotificationChannel.EMAIL);

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(request.getRecipient());
            message.setSubject(request.getSubject() != null ? request.getSubject() : getDefaultSubject(request.getType()));
            message.setText(request.getContent() != null ? request.getContent() : getDefaultContent(request.getType(), request.getOrderId()));
            message.setFrom("noreply@allconnect.com");

            mailSender.send(message);

            notification.setStatus(NotificationStatus.SENT);
            notification.setSentAt(LocalDateTime.now());
            log.info("Email sent successfully to: {}", request.getRecipient());

        } catch (Exception e) {
            log.error("Failed to send email: {}", e.getMessage());
            notification.setStatus(NotificationStatus.FAILED);
            notification.setErrorMessage(e.getMessage());
        }

        notification = notificationRepository.save(notification);
        publishNotificationEvent(notification);
        return mapToResponse(notification);
    }

    @Transactional
    public NotificationResponse sendSms(NotificationRequest request) {
        log.info("Sending SMS notification to customer: {}", request.getCustomerId());

        Notification notification = createNotification(request, NotificationChannel.SMS);

        // Mock SMS sending
        try {
            Thread.sleep(500); // Simulate SMS gateway call
            log.info("SMS sent to {} (MOCK): {}", request.getRecipient(), request.getContent());

            notification.setStatus(NotificationStatus.SENT);
            notification.setSentAt(LocalDateTime.now());

        } catch (Exception e) {
            log.error("Failed to send SMS: {}", e.getMessage());
            notification.setStatus(NotificationStatus.FAILED);
            notification.setErrorMessage(e.getMessage());
        }

        notification = notificationRepository.save(notification);
        publishNotificationEvent(notification);
        return mapToResponse(notification);
    }

    @Transactional
    public NotificationResponse sendPush(NotificationRequest request) {
        log.info("Sending push notification to customer: {}", request.getCustomerId());

        Notification notification = createNotification(request, NotificationChannel.PUSH);

        // Mock Push notification
        try {
            Thread.sleep(300); // Simulate push service call
            log.info("Push notification sent to device {} (MOCK): {}", request.getRecipient(), request.getContent());

            notification.setStatus(NotificationStatus.SENT);
            notification.setSentAt(LocalDateTime.now());

        } catch (Exception e) {
            log.error("Failed to send push notification: {}", e.getMessage());
            notification.setStatus(NotificationStatus.FAILED);
            notification.setErrorMessage(e.getMessage());
        }

        notification = notificationRepository.save(notification);
        publishNotificationEvent(notification);
        return mapToResponse(notification);
    }

    public NotificationResponse getNotificationById(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        return mapToResponse(notification);
    }

    public List<NotificationResponse> getNotificationsByCustomer(Long customerId) {
        return notificationRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<NotificationResponse> getNotificationsByOrder(Long orderId) {
        return notificationRepository.findByOrderId(orderId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private Notification createNotification(NotificationRequest request, NotificationChannel channel) {
        return Notification.builder()
                .customerId(request.getCustomerId())
                .type(request.getType())
                .channel(channel)
                .recipient(request.getRecipient())
                .subject(request.getSubject() != null ? request.getSubject() : getDefaultSubject(request.getType()))
                .content(request.getContent() != null ? request.getContent() : getDefaultContent(request.getType(), request.getOrderId()))
                .status(NotificationStatus.PENDING)
                .orderId(request.getOrderId())
                .build();
    }

    private String getDefaultSubject(NotificationType type) {
        return switch (type) {
            case WELCOME -> "Bienvenido a AllConnect Market";
            case ORDER_CONFIRMATION -> "Tu orden ha sido confirmada";
            case ORDER_SHIPPED -> "Tu orden ha sido enviada";
            case ORDER_DELIVERED -> "Tu orden ha sido entregada";
            case ORDER_CANCELLED -> "Tu orden ha sido cancelada";
            case PAYMENT_RECEIVED -> "Pago recibido";
            case PAYMENT_FAILED -> "Error en el pago";
            case PASSWORD_RESET -> "Restablecer contraseña";
            case PROMOTION -> "Promoción especial para ti";
            case GENERAL -> "Notificación de AllConnect Market";
        };
    }

    private String getDefaultContent(NotificationType type, Long orderId) {
        String orderRef = orderId != null ? " (Orden #" + orderId + ")" : "";
        return switch (type) {
            case WELCOME -> "¡Gracias por registrarte en AllConnect Market! Estamos encantados de tenerte con nosotros.";
            case ORDER_CONFIRMATION -> "Tu orden" + orderRef + " ha sido confirmada y está siendo procesada.";
            case ORDER_SHIPPED -> "Tu orden" + orderRef + " ha sido enviada. Pronto la recibirás.";
            case ORDER_DELIVERED -> "Tu orden" + orderRef + " ha sido entregada. ¡Esperamos que disfrutes tu compra!";
            case ORDER_CANCELLED -> "Tu orden" + orderRef + " ha sido cancelada. Si tienes preguntas, contáctanos.";
            case PAYMENT_RECEIVED -> "Hemos recibido tu pago" + orderRef + ". ¡Gracias por tu compra!";
            case PAYMENT_FAILED -> "Hubo un problema con tu pago" + orderRef + ". Por favor, intenta nuevamente.";
            case PASSWORD_RESET -> "Haz clic en el enlace para restablecer tu contraseña.";
            case PROMOTION -> "¡Tenemos ofertas especiales para ti! No te las pierdas.";
            case GENERAL -> "Tienes una nueva notificación de AllConnect Market.";
        };
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .customerId(notification.getCustomerId())
                .type(notification.getType())
                .channel(notification.getChannel())
                .recipient(notification.getRecipient())
                .subject(notification.getSubject())
                .content(notification.getContent())
                .status(notification.getStatus())
                .errorMessage(notification.getErrorMessage())
                .orderId(notification.getOrderId())
                .createdAt(notification.getCreatedAt())
                .sentAt(notification.getSentAt())
                .build();
    }

    private void publishNotificationEvent(Notification notification) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("eventType", "notification." + notification.getStatus().name().toLowerCase());
            event.put("notificationId", notification.getId());
            event.put("customerId", notification.getCustomerId());
            event.put("type", notification.getType().name());
            event.put("channel", notification.getChannel().name());
            event.put("status", notification.getStatus().name());
            event.put("timestamp", System.currentTimeMillis());

            kafkaTemplate.send("notification-status-events", event);
            log.info("Published notification event: {}", notification.getId());
        } catch (Exception e) {
            log.warn("Failed to publish Kafka event: {}", e.getMessage());
        }
    }
}
