package com.allconnect.gateway.controller;

import com.allconnect.gateway.dto.*;
import com.allconnect.gateway.service.MonitoringService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for IT Admin Dashboard.
 * Exposes endpoints for monitoring system health, metrics, and integrations.
 */
@RestController
@RequestMapping("/api/admin/it")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3002", "http://localhost:3000"})
public class ITAdminController {

    private final MonitoringService monitoringService;

    /**
     * Get system-wide metrics (CPU, memory, disk, connections, requests/min)
     */
    @GetMapping("/metrics")
    public Mono<ResponseEntity<SystemMetricsDTO>> getSystemMetrics() {
        log.debug("Fetching system metrics");
        return monitoringService.getSystemMetrics()
                .map(ResponseEntity::ok)
                .doOnSuccess(r -> log.debug("System metrics retrieved successfully"));
    }

    /**
     * Get health status of all microservices
     */
    @GetMapping("/services/health")
    public Mono<ResponseEntity<List<ServiceHealthDTO>>> getServicesHealth() {
        log.debug("Fetching services health");
        return monitoringService.getServicesHealth()
                .collectList()
                .map(ResponseEntity::ok)
                .doOnSuccess(r -> log.debug("Services health retrieved: {} services",
                        r.getBody() != null ? r.getBody().size() : 0));
    }

    /**
     * Get integration status for external providers (REST, SOAP, gRPC)
     */
    @GetMapping("/integrations")
    public Mono<ResponseEntity<List<IntegrationStatusDTO>>> getIntegrationStatus() {
        log.debug("Fetching integration status");
        return monitoringService.getIntegrationStatus()
                .collectList()
                .map(ResponseEntity::ok)
                .doOnSuccess(r -> log.debug("Integration status retrieved: {} integrations",
                        r.getBody() != null ? r.getBody().size() : 0));
    }

    /**
     * Get recent system event logs
     */
    @GetMapping("/logs")
    public Mono<ResponseEntity<List<EventLogDTO>>> getEventLogs() {
        log.debug("Fetching event logs");
        return monitoringService.getEventLogs()
                .collectList()
                .map(ResponseEntity::ok)
                .doOnSuccess(r -> log.debug("Event logs retrieved: {} logs",
                        r.getBody() != null ? r.getBody().size() : 0));
    }

    /**
     * Test connection to a specific integration
     */
    @PostMapping("/integrations/test")
    public Mono<ResponseEntity<Map<String, Object>>> testIntegrationConnection(
            @RequestBody Map<String, String> request) {
        String integrationName = request.get("name");
        log.info("Testing connection to integration: {}", integrationName);

        return monitoringService.getIntegrationStatus()
                .filter(status -> status.getName().equalsIgnoreCase(integrationName))
                .next()
                .map(status -> {
                    Map<String, Object> result = Map.of(
                            "success", "CONNECTED".equals(status.getStatus()),
                            "status", status.getStatus(),
                            "responseTime", status.getAvgResponseTime(),
                            "message", "CONNECTED".equals(status.getStatus())
                                    ? "Connection successful"
                                    : "Connection failed"
                    );
                    monitoringService.addEvent("INTEGRATION", "CONNECTION_TEST",
                            "Tested connection to " + integrationName + ": " + status.getStatus(), "INFO");
                    return ResponseEntity.ok(result);
                })
                .defaultIfEmpty(ResponseEntity.ok(Map.of(
                        "success", false,
                        "message", "Integration not found: " + integrationName
                )));
    }

    /**
     * Force sync with a specific integration
     */
    @PostMapping("/integrations/sync")
    public Mono<ResponseEntity<Map<String, Object>>> forceSync(
            @RequestBody Map<String, String> request) {
        String integrationName = request.get("name");
        log.info("Forcing sync with integration: {}", integrationName);

        monitoringService.addEvent("INTEGRATION", "FORCE_SYNC",
                "Manual sync initiated for " + integrationName, "INFO");

        // In production, this would trigger an actual sync
        return Mono.just(ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Sync initiated for " + integrationName,
                "timestamp", System.currentTimeMillis()
        )));
    }

    /**
     * Health check endpoint for the monitoring service itself
     */
    @GetMapping("/health")
    public Mono<ResponseEntity<Map<String, Object>>> healthCheck() {
        return Mono.just(ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "IT Admin Monitoring",
                "timestamp", System.currentTimeMillis()
        )));
    }
}
