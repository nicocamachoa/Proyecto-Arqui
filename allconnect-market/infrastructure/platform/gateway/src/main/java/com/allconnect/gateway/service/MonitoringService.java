package com.allconnect.gateway.service;

import com.allconnect.gateway.dto.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentLinkedDeque;

/**
 * Coarse-grained monitoring service that aggregates data from multiple infrastructure sources.
 * Following SOA principles, this service encapsulates all monitoring logic in a single service.
 */
@Service
@Slf4j
public class MonitoringService {

    private final WebClient prometheusClient;
    private final WebClient eurekaClient;
    private final ObjectMapper objectMapper;

    // In-memory event log storage (in production, use a proper log aggregation system)
    private final Deque<EventLogDTO> eventLogs = new ConcurrentLinkedDeque<>();
    private static final int MAX_EVENT_LOGS = 100;

    // Service definitions for health checks
    private static final Map<String, ServiceInfo> SERVICES = Map.ofEntries(
        Map.entry("API-GATEWAY", new ServiceInfo("API Gateway", "http://gateway:8080")),
        Map.entry("SECURITY-SERVICE", new ServiceInfo("Security Service", "http://security-service:8097")),
        Map.entry("CATALOG-SERVICE", new ServiceInfo("Catalog Service", "http://catalog-service:8092")),
        Map.entry("ORDER-SERVICE", new ServiceInfo("Order Service", "http://order-service:8091")),
        Map.entry("CUSTOMER-SERVICE", new ServiceInfo("Customer Service", "http://customer-service:8093")),
        Map.entry("PAYMENT-SERVICE", new ServiceInfo("Payment Service", "http://payment-service:8094")),
        Map.entry("NOTIFICATION-SERVICE", new ServiceInfo("Notification Service", "http://notification-service:8095")),
        Map.entry("BILLING-SERVICE", new ServiceInfo("Billing Service", "http://billing-service:8096")),
        Map.entry("RECOMMENDATION-SERVICE", new ServiceInfo("Recommendation Service", "http://recommendation-service:8098")),
        Map.entry("INTEGRATION-SERVICE", new ServiceInfo("Integration Service", "http://allconnect-integration:8085"))
    );

    // Integration providers
    private static final List<IntegrationInfo> INTEGRATIONS = List.of(
        new IntegrationInfo("REST Provider", "REST", "http://rest-provider:4001"),
        new IntegrationInfo("SOAP Provider", "SOAP", "http://soap-provider:4002"),
        new IntegrationInfo("gRPC Provider", "GRPC", "http://grpc-provider:4003")
    );

    public MonitoringService(
            @Value("${monitoring.prometheus.url:http://prometheus:9090}") String prometheusUrl,
            @Value("${monitoring.eureka.url:http://eureka:8761}") String eurekaUrl) {

        this.prometheusClient = WebClient.builder()
                .baseUrl(prometheusUrl)
                .build();

        this.eurekaClient = WebClient.builder()
                .baseUrl(eurekaUrl)
                .defaultHeader("Accept", "application/json")
                .build();

        this.objectMapper = new ObjectMapper();

        // Add startup event
        addEvent("SYSTEM", "STARTUP", "Monitoring service initialized", "INFO");
    }

    /**
     * Get system-wide metrics by aggregating data from all service actuators
     */
    public Mono<SystemMetricsDTO> getSystemMetrics() {
        // Query metrics from multiple services and aggregate
        List<String> serviceUrls = List.of(
            "http://catalog-service:8092",
            "http://order-service:8091",
            "http://customer-service:8093",
            "http://payment-service:8094",
            "http://security-service:8097",
            "http://billing-service:8096",
            "http://notification-service:8095",
            "http://recommendation-service:8098"
        );

        return Flux.fromIterable(serviceUrls)
                .flatMap(this::getServiceMetrics)
                .collectList()
                .map(metricsList -> {
                    // Aggregate metrics from all services
                    double avgCpu = metricsList.stream()
                            .mapToDouble(m -> m.getOrDefault("cpu", 0.0))
                            .filter(v -> v > 0)
                            .average()
                            .orElse(0.0);

                    double avgMemoryPercent = metricsList.stream()
                            .mapToDouble(m -> m.getOrDefault("memoryPercent", 0.0))
                            .filter(v -> v > 0)
                            .average()
                            .orElse(0.0);

                    int totalConnections = metricsList.stream()
                            .mapToInt(m -> m.getOrDefault("connections", 0.0).intValue())
                            .sum();

                    double totalRequests = metricsList.stream()
                            .mapToDouble(m -> m.getOrDefault("requests", 0.0))
                            .sum();

                    return SystemMetricsDTO.builder()
                            .cpuUsage(Math.round(avgCpu * 10000.0) / 100.0) // Convert to percentage
                            .memoryUsage(Math.round(avgMemoryPercent * 100.0) / 100.0)
                            .diskUsage(calculateDiskUsage())
                            .activeConnections(totalConnections)
                            .requestsPerMinute(Math.round(totalRequests * 100.0) / 100.0)
                            .build();
                })
                .onErrorResume(e -> {
                    log.warn("Error fetching system metrics: {}", e.getMessage());
                    addEvent("MONITORING", "METRICS_ERROR", "Failed to fetch metrics: " + e.getMessage(), "WARN");
                    return Mono.just(getDefaultMetrics());
                });
    }

    /**
     * Get metrics from a single service's actuator endpoint
     */
    private Mono<Map<String, Double>> getServiceMetrics(String serviceUrl) {
        WebClient client = WebClient.builder()
                .baseUrl(serviceUrl)
                .build();

        return Mono.zip(
                // CPU usage
                client.get()
                        .uri("/actuator/metrics/process.cpu.usage")
                        .retrieve()
                        .bodyToMono(String.class)
                        .map(this::parseActuatorMetric)
                        .onErrorReturn(0.0),
                // Memory used
                client.get()
                        .uri("/actuator/metrics/jvm.memory.used?tag=area:heap")
                        .retrieve()
                        .bodyToMono(String.class)
                        .map(this::parseActuatorMetric)
                        .onErrorReturn(0.0),
                // Memory max
                client.get()
                        .uri("/actuator/metrics/jvm.memory.max?tag=area:heap")
                        .retrieve()
                        .bodyToMono(String.class)
                        .map(this::parseActuatorMetric)
                        .onErrorReturn(0.0),
                // Active HTTP connections (tomcat threads)
                client.get()
                        .uri("/actuator/metrics/tomcat.threads.busy")
                        .retrieve()
                        .bodyToMono(String.class)
                        .map(this::parseActuatorMetric)
                        .onErrorReturn(0.0),
                // HTTP request count
                client.get()
                        .uri("/actuator/metrics/http.server.requests")
                        .retrieve()
                        .bodyToMono(String.class)
                        .map(this::parseActuatorCount)
                        .onErrorReturn(0.0)
        ).map(tuple -> {
            double cpu = tuple.getT1();
            double memUsed = tuple.getT2();
            double memMax = tuple.getT3();
            double connections = tuple.getT4();
            double requests = tuple.getT5();

            double memoryPercent = memMax > 0 ? (memUsed / memMax) * 100 : 0;

            return Map.of(
                    "cpu", cpu,
                    "memoryPercent", memoryPercent,
                    "connections", connections,
                    "requests", requests
            );
        }).timeout(Duration.ofSeconds(3))
        .onErrorResume(e -> {
            log.debug("Failed to get metrics from {}: {}", serviceUrl, e.getMessage());
            return Mono.just(Map.of("cpu", 0.0, "memoryPercent", 0.0, "connections", 0.0, "requests", 0.0));
        });
    }

    /**
     * Parse actuator metric response to extract the value
     */
    private double parseActuatorMetric(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            JsonNode measurements = root.path("measurements");
            if (measurements.isArray() && measurements.size() > 0) {
                return measurements.get(0).path("value").asDouble(0.0);
            }
        } catch (Exception e) {
            log.debug("Error parsing actuator metric: {}", e.getMessage());
        }
        return 0.0;
    }

    /**
     * Parse actuator metric response to extract the count statistic
     */
    private double parseActuatorCount(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            JsonNode measurements = root.path("measurements");
            if (measurements.isArray()) {
                for (JsonNode m : measurements) {
                    if ("COUNT".equals(m.path("statistic").asText())) {
                        return m.path("value").asDouble(0.0);
                    }
                }
            }
        } catch (Exception e) {
            log.debug("Error parsing actuator count: {}", e.getMessage());
        }
        return 0.0;
    }

    /**
     * Get health status of all registered services from Eureka
     */
    public Flux<ServiceHealthDTO> getServicesHealth() {
        return eurekaClient.get()
                .uri("/eureka/apps")
                .retrieve()
                .bodyToMono(String.class)
                .flatMapMany(response -> {
                    List<ServiceHealthDTO> services = new ArrayList<>();
                    try {
                        JsonNode root = objectMapper.readTree(response);
                        JsonNode applications = root.path("applications").path("application");

                        if (applications.isArray()) {
                            for (JsonNode app : applications) {
                                String appName = app.path("name").asText();
                                JsonNode instances = app.path("instance");

                                if (instances.isArray() && instances.size() > 0) {
                                    JsonNode instance = instances.get(0);
                                    String status = instance.path("status").asText("UNKNOWN");

                                    ServiceInfo info = SERVICES.getOrDefault(appName,
                                            new ServiceInfo(appName, ""));

                                    services.add(ServiceHealthDTO.builder()
                                            .name(info.displayName)
                                            .status(mapEurekaStatus(status))
                                            .responseTime(getRandomResponseTime())
                                            .lastCheck(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                                            .details(Map.of(
                                                    "instanceId", instance.path("instanceId").asText(""),
                                                    "hostName", instance.path("hostName").asText(""),
                                                    "port", instance.path("port").path("$").asText("")
                                            ))
                                            .build());
                                }
                            }
                        }
                    } catch (Exception e) {
                        log.error("Error parsing Eureka response: {}", e.getMessage());
                    }

                    // Add services not found in Eureka as DOWN (except Integration Service which doesn't use Eureka)
                    Set<String> foundServices = new HashSet<>();
                    for (ServiceHealthDTO s : services) {
                        foundServices.add(s.getName());
                    }

                    for (Map.Entry<String, ServiceInfo> entry : SERVICES.entrySet()) {
                        // Skip Integration Service - will be checked separately
                        if (entry.getKey().equals("INTEGRATION-SERVICE")) {
                            continue;
                        }
                        if (!foundServices.contains(entry.getValue().displayName)) {
                            services.add(ServiceHealthDTO.builder()
                                    .name(entry.getValue().displayName)
                                    .status("DOWN")
                                    .responseTime(0)
                                    .lastCheck(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                                    .details(Map.of("error", "Service not registered in Eureka"))
                                    .build());
                        }
                    }

                    // Check Integration Service directly (it doesn't use Eureka)
                    return Flux.fromIterable(services)
                            .concatWith(checkIntegrationServiceHealth());
                })
                .onErrorResume(e -> {
                    log.warn("Error fetching services from Eureka: {}", e.getMessage());
                    addEvent("MONITORING", "EUREKA_ERROR", "Failed to fetch services: " + e.getMessage(), "WARN");
                    return getDefaultServicesHealth();
                });
    }

    /**
     * Get integration status for external providers
     */
    public Flux<IntegrationStatusDTO> getIntegrationStatus() {
        return Flux.fromIterable(INTEGRATIONS)
                .flatMap(this::checkIntegrationHealth);
    }

    /**
     * Get recent event logs
     */
    public Flux<EventLogDTO> getEventLogs() {
        return Flux.fromIterable(new ArrayList<>(eventLogs));
    }

    /**
     * Add a new event to the log
     */
    public void addEvent(String service, String eventType, String message, String severity) {
        EventLogDTO event = EventLogDTO.builder()
                .id(UUID.randomUUID().toString())
                .timestamp(Instant.now().toString())
                .service(service)
                .eventType(eventType)
                .message(message)
                .severity(severity)
                .build();

        eventLogs.addFirst(event);

        // Keep only the last MAX_EVENT_LOGS events
        while (eventLogs.size() > MAX_EVENT_LOGS) {
            eventLogs.removeLast();
        }
    }

    // ============ Private Helper Methods ============

    private Mono<String> queryPrometheus(String query) {
        // URL encode the query to handle special characters like {, }, =, etc.
        String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
        String fullPath = "/api/v1/query?query=" + encodedQuery;

        return prometheusClient.get()
                .uri(fullPath)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(5))
                .onErrorResume(e -> {
                    log.debug("Prometheus query failed for '{}': {}", query, e.getMessage());
                    return Mono.just("{}");
                });
    }

    private double parsePrometheusValue(String response, double defaultValue) {
        try {
            JsonNode root = objectMapper.readTree(response);
            JsonNode result = root.path("data").path("result");

            if (result.isArray() && result.size() > 0) {
                JsonNode value = result.get(0).path("value");
                if (value.isArray() && value.size() > 1) {
                    String valueStr = value.get(1).asText();
                    if (!"NaN".equals(valueStr) && !valueStr.isEmpty()) {
                        return Double.parseDouble(valueStr);
                    }
                }
            }
        } catch (Exception e) {
            log.debug("Error parsing Prometheus value: {}", e.getMessage());
        }
        return defaultValue;
    }

    private String mapEurekaStatus(String eurekaStatus) {
        return switch (eurekaStatus.toUpperCase()) {
            case "UP" -> "UP";
            case "DOWN" -> "DOWN";
            case "OUT_OF_SERVICE" -> "DEGRADED";
            default -> "DOWN";
        };
    }

    private long getRandomResponseTime() {
        // In production, measure actual response times
        return 15 + (long) (Math.random() * 85);
    }

    private double calculateDiskUsage() {
        // In production, query actual disk metrics from Prometheus
        return 45.0 + (Math.random() * 10);
    }

    private SystemMetricsDTO getDefaultMetrics() {
        return SystemMetricsDTO.builder()
                .cpuUsage(0.0)
                .memoryUsage(0.0)
                .diskUsage(0.0)
                .activeConnections(0)
                .requestsPerMinute(0.0)
                .build();
    }

    private Flux<ServiceHealthDTO> getDefaultServicesHealth() {
        return Flux.fromIterable(SERVICES.entrySet())
                .map(entry -> ServiceHealthDTO.builder()
                        .name(entry.getValue().displayName)
                        .status("DOWN")
                        .responseTime(0)
                        .lastCheck(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                        .details(Map.of("error", "Unable to connect to Eureka"))
                        .build());
    }

    /**
     * Check Integration Service health directly (it doesn't use Eureka)
     */
    private Mono<ServiceHealthDTO> checkIntegrationServiceHealth() {
        ServiceInfo integrationInfo = SERVICES.get("INTEGRATION-SERVICE");
        WebClient client = WebClient.builder()
                .baseUrl(integrationInfo.baseUrl)
                .build();

        long startTime = System.currentTimeMillis();

        return client.get()
                .uri("/api/integration/health")
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(5))
                .map(response -> {
                    long responseTime = System.currentTimeMillis() - startTime;
                    return ServiceHealthDTO.builder()
                            .name(integrationInfo.displayName)
                            .status("UP")
                            .responseTime(responseTime)
                            .lastCheck(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                            .details(Map.of(
                                    "protocol", "HTTP",
                                    "endpoint", integrationInfo.baseUrl,
                                    "note", "Direct health check (no Eureka)"
                            ))
                            .build();
                })
                .onErrorResume(e -> {
                    log.debug("Integration Service health check failed: {}", e.getMessage());
                    return Mono.just(ServiceHealthDTO.builder()
                            .name(integrationInfo.displayName)
                            .status("DOWN")
                            .responseTime(0)
                            .lastCheck(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                            .details(Map.of("error", "Health check failed: " + e.getMessage()))
                            .build());
                });
    }

    private Mono<IntegrationStatusDTO> checkIntegrationHealth(IntegrationInfo integration) {
        WebClient client = WebClient.builder()
                .baseUrl(integration.endpoint)
                .build();

        long startTime = System.currentTimeMillis();

        String healthPath = switch (integration.type) {
            case "REST" -> "/api/products";
            case "SOAP" -> "/api/services";
            case "GRPC" -> "/api/subscriptions";
            default -> "/";
        };

        return client.get()
                .uri(healthPath)
                .retrieve()
                .toBodilessEntity()
                .timeout(Duration.ofSeconds(5))
                .map(response -> {
                    long responseTime = System.currentTimeMillis() - startTime;
                    return IntegrationStatusDTO.builder()
                            .name(integration.name)
                            .type(integration.type)
                            .endpoint(integration.endpoint + healthPath)
                            .status("CONNECTED")
                            .lastSync(Instant.now().toString())
                            .successRate(95.0 + (Math.random() * 5))
                            .avgResponseTime(responseTime)
                            .build();
                })
                .onErrorResume(e -> {
                    log.debug("Integration {} health check failed: {}", integration.name, e.getMessage());
                    return Mono.just(IntegrationStatusDTO.builder()
                            .name(integration.name)
                            .type(integration.type)
                            .endpoint(integration.endpoint + healthPath)
                            .status("DISCONNECTED")
                            .lastSync(Instant.now().toString())
                            .successRate(0.0)
                            .avgResponseTime(0)
                            .build());
                });
    }

    // ============ Inner Classes ============

    private record ServiceInfo(String displayName, String baseUrl) {}
    private record IntegrationInfo(String name, String type, String endpoint) {}
}
