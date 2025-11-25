package com.allconnect.catalog.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Map;

/**
 * Fallback for IntegrationClient when the integration service is unavailable.
 * Returns empty results to allow graceful degradation.
 */
@Component
@Slf4j
public class IntegrationClientFallback implements IntegrationClient {

    @Override
    public Map<String, Object> getAllProducts() {
        log.warn("Integration service unavailable - returning empty product list");
        return Map.of(
            "products", Collections.emptyList(),
            "total", 0,
            "source", "fallback"
        );
    }

    @Override
    public Map<String, Object> getProductById(String productId) {
        log.warn("Integration service unavailable - cannot fetch product {}", productId);
        return Collections.emptyMap();
    }

    @Override
    public Map<String, Object> healthCheck() {
        return Map.of(
            "status", "DOWN",
            "service", "Integration Service (fallback)",
            "message", "Integration service is unavailable"
        );
    }
}
