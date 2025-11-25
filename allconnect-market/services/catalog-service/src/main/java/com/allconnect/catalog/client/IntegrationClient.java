package com.allconnect.catalog.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Map;

/**
 * Feign client for the Integration Service.
 * Fetches products from external providers (REST, SOAP, gRPC).
 */
@FeignClient(
    name = "integration-service",
    url = "${integration.service.url:http://localhost:8086}",
    fallback = IntegrationClientFallback.class
)
public interface IntegrationClient {

    @GetMapping("/api/integration/products")
    Map<String, Object> getAllProducts();

    @GetMapping("/api/integration/products/{productId}")
    Map<String, Object> getProductById(@PathVariable("productId") String productId);

    @GetMapping("/api/integration/health")
    Map<String, Object> healthCheck();
}
