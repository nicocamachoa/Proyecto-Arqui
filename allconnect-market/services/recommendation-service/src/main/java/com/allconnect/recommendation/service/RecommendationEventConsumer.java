package com.allconnect.recommendation.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationEventConsumer {

    private final RecommendationService recommendationService;

    @KafkaListener(topics = "catalog-events", groupId = "recommendation-service-group")
    public void handleCatalogEvent(Map<String, Object> event) {
        log.info("Received catalog event: {}", event);
        // Could be used to update recommendations cache when products change
    }

    @KafkaListener(topics = "order-events", groupId = "recommendation-service-group")
    public void handleOrderEvent(Map<String, Object> event) {
        log.info("Received order event for recommendations: {}", event);

        try {
            String eventType = (String) event.get("eventType");

            if ("order.completed".equals(eventType)) {
                Long customerId = getLongValue(event.get("customerId"));

                // In a real implementation, we would get category IDs from order items
                // For now, we record a generic purchase preference update
                log.info("Recording purchase preferences for customer: {}", customerId);
            }

        } catch (Exception e) {
            log.error("Error processing order event: {}", e.getMessage());
        }
    }

    private Long getLongValue(Object value) {
        if (value == null) return null;
        if (value instanceof Long) return (Long) value;
        if (value instanceof Integer) return ((Integer) value).longValue();
        if (value instanceof Number) return ((Number) value).longValue();
        return Long.parseLong(value.toString());
    }
}
