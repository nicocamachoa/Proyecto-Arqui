package com.allconnect.notification.repository;

import com.allconnect.notification.model.Notification;
import com.allconnect.notification.model.NotificationChannel;
import com.allconnect.notification.model.NotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByCustomerId(Long customerId);

    List<Notification> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<Notification> findByStatus(NotificationStatus status);

    List<Notification> findByChannel(NotificationChannel channel);

    List<Notification> findByOrderId(Long orderId);
}
