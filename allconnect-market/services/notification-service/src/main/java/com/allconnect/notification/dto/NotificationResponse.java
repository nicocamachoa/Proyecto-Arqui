package com.allconnect.notification.dto;

import com.allconnect.notification.model.NotificationChannel;
import com.allconnect.notification.model.NotificationStatus;
import com.allconnect.notification.model.NotificationType;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    private Long id;
    private Long customerId;
    private NotificationType type;
    private NotificationChannel channel;
    private String recipient;
    private String subject;
    private String content;
    private NotificationStatus status;
    private String errorMessage;
    private Long orderId;
    private LocalDateTime createdAt;
    private LocalDateTime sentAt;
}
