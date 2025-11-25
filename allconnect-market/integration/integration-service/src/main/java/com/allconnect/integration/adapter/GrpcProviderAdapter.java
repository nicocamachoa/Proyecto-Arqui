package com.allconnect.integration.adapter;

import com.allconnect.integration.core.IProviderAdapter;
import com.allconnect.integration.dto.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * gRPC Provider Adapter.
 * Uses HTTP/JSON for health checks and gRPC for subscription operations.
 * In a full implementation, this would use generated gRPC stubs.
 */
@Component
public class GrpcProviderAdapter implements IProviderAdapter {

    private static final Logger log = LoggerFactory.getLogger(GrpcProviderAdapter.class);

    private final WebClient webClient;

    @Value("${integration.providers[2].host:localhost}")
    private String grpcHost;

    @Value("${integration.providers[2].port:4003}")
    private int grpcPort;

    // For health checks via HTTP
    @Value("${integration.providers[2].baseUrl:http://localhost:4003}")
    private String baseUrl;

    public GrpcProviderAdapter(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    @Override
    public String getProviderType() {
        return "GRPC";
    }

    @Override
    public String getProviderId() {
        return "grpc-provider";
    }

    // REST operations - not supported by gRPC adapter
    @Override
    public GenericOrderResponse createOrder(GenericOrderRequest request) {
        GenericOrderResponse response = new GenericOrderResponse();
        response.setSuccess(false);
        response.setErrorMessage("Order operations not supported by gRPC provider");
        return response;
    }

    @Override
    public GenericStatusResponse getOrderStatus(String orderId) {
        GenericStatusResponse response = new GenericStatusResponse();
        response.setSuccess(false);
        response.setErrorMessage("Order operations not supported by gRPC provider");
        return response;
    }

    @Override
    public GenericCancelResponse cancelOrder(String orderId) {
        GenericCancelResponse response = new GenericCancelResponse();
        response.setSuccess(false);
        response.setErrorMessage("Order operations not supported by gRPC provider");
        return response;
    }

    @Override
    public GenericInventoryResponse checkInventory(String productId) {
        GenericInventoryResponse response = new GenericInventoryResponse();
        response.setSuccess(false);
        response.setErrorMessage("Inventory operations not supported by gRPC provider");
        return response;
    }

    // SOAP operations - not supported by gRPC adapter
    @Override
    public GenericBookingResponse createBooking(GenericBookingRequest request) {
        GenericBookingResponse response = new GenericBookingResponse();
        response.setSuccess(false);
        response.setErrorMessage("Booking operations not supported by gRPC provider");
        return response;
    }

    @Override
    public GenericBookingResponse getBooking(String bookingId) {
        GenericBookingResponse response = new GenericBookingResponse();
        response.setSuccess(false);
        response.setErrorMessage("Booking operations not supported by gRPC provider");
        return response;
    }

    @Override
    public GenericCancelResponse cancelBooking(String bookingId) {
        GenericCancelResponse response = new GenericCancelResponse();
        response.setSuccess(false);
        response.setErrorMessage("Booking operations not supported by gRPC provider");
        return response;
    }

    @Override
    public GenericAvailabilityResponse checkAvailability(String serviceId, LocalDate date) {
        GenericAvailabilityResponse response = new GenericAvailabilityResponse();
        response.setSuccess(false);
        response.setErrorMessage("Availability operations not supported by gRPC provider");
        return response;
    }

    // gRPC Subscription operations - Using REST API wrapper for easier E2E testing
    @Override
    public GenericSubscriptionResponse createSubscription(GenericSubscriptionRequest request) {
        log.info("gRPC Adapter: Creating subscription for plan: {}", request.getPlanId());
        try {
            Map<String, Object> restRequest = Map.of(
                "planId", request.getPlanId(),
                "customerId", request.getCustomerId(),
                "customerEmail", request.getCustomerEmail(),
                "paymentMethodId", request.getPaymentMethodId() != null ? request.getPaymentMethodId() : ""
            );

            Map<String, Object> response = webClient.post()
                .uri(baseUrl + "/api/subscriptions")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .bodyValue(restRequest)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            GenericSubscriptionResponse result = new GenericSubscriptionResponse();
            result.setSuccess(response != null && Boolean.TRUE.equals(response.get("success")));
            result.setSubscriptionId((String) response.get("subscriptionId"));
            result.setPlanId((String) response.get("planId"));
            result.setPlanName((String) response.get("planName"));
            result.setCustomerId((String) response.get("customerId"));
            result.setStatus((String) response.get("status"));
            result.setStartDate(LocalDateTime.now());
            result.setEndDate(LocalDateTime.now().plusMonths(1));
            if (response.get("features") instanceof List) {
                result.setFeatures((List<String>) response.get("features"));
            }
            result.setErrorMessage((String) response.get("errorMessage"));
            return result;
        } catch (Exception e) {
            log.error("Error creating subscription via gRPC: {}", e.getMessage());
            GenericSubscriptionResponse error = new GenericSubscriptionResponse();
            error.setSuccess(false);
            error.setErrorMessage("gRPC Provider error: " + e.getMessage());
            return error;
        }
    }

    @Override
    public GenericSubscriptionResponse getSubscription(String subscriptionId) {
        log.info("gRPC Adapter: Getting subscription: {}", subscriptionId);
        try {
            Map<String, Object> response = webClient.get()
                .uri(baseUrl + "/api/subscriptions/{subscriptionId}", subscriptionId)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            GenericSubscriptionResponse result = new GenericSubscriptionResponse();
            result.setSuccess(response != null && Boolean.TRUE.equals(response.get("success")));
            result.setSubscriptionId((String) response.get("subscriptionId"));
            result.setPlanId((String) response.get("planId"));
            result.setPlanName((String) response.get("planName"));
            result.setCustomerId((String) response.get("customerId"));
            result.setStatus((String) response.get("status"));
            result.setStartDate(LocalDateTime.now().minusDays(10));
            result.setEndDate(LocalDateTime.now().plusDays(20));
            if (response.get("features") instanceof List) {
                result.setFeatures((List<String>) response.get("features"));
            }
            result.setErrorMessage((String) response.get("errorMessage"));
            return result;
        } catch (Exception e) {
            log.error("Error getting subscription: {}", e.getMessage());
            GenericSubscriptionResponse error = new GenericSubscriptionResponse();
            error.setSuccess(false);
            error.setErrorMessage("gRPC Provider error: " + e.getMessage());
            return error;
        }
    }

    @Override
    public GenericCancelResponse cancelSubscription(String subscriptionId) {
        log.info("gRPC Adapter: Cancelling subscription: {}", subscriptionId);
        try {
            Map<String, Object> response = webClient.delete()
                .uri(baseUrl + "/api/subscriptions/{subscriptionId}", subscriptionId)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            GenericCancelResponse result = new GenericCancelResponse();
            result.setSuccess(response != null && Boolean.TRUE.equals(response.get("success")));
            result.setErrorMessage((String) response.get("errorMessage"));
            return result;
        } catch (Exception e) {
            log.error("Error cancelling subscription: {}", e.getMessage());
            GenericCancelResponse error = new GenericCancelResponse();
            error.setSuccess(false);
            error.setErrorMessage("gRPC Provider error: " + e.getMessage());
            return error;
        }
    }

    @Override
    public GenericAccessResponse checkAccess(String subscriptionId, String contentId) {
        log.info("gRPC Adapter: Checking access for subscription: {}, content: {}", subscriptionId, contentId);
        try {
            Map<String, Object> response = webClient.get()
                .uri(baseUrl + "/api/subscriptions/{subscriptionId}/access/{contentId}", subscriptionId, contentId)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            GenericAccessResponse result = new GenericAccessResponse();
            result.setSuccess(response != null && Boolean.TRUE.equals(response.get("success")));
            result.setHasAccess(Boolean.TRUE.equals(response.get("hasAccess")));
            result.setAccessUrl((String) response.get("accessUrl"));
            result.setExpiresAt(LocalDateTime.now().plusHours(24));
            result.setErrorMessage((String) response.get("errorMessage"));
            return result;
        } catch (Exception e) {
            log.error("Error checking access: {}", e.getMessage());
            GenericAccessResponse error = new GenericAccessResponse();
            error.setSuccess(false);
            error.setErrorMessage("gRPC Provider error: " + e.getMessage());
            return error;
        }
    }

    @Override
    public boolean isHealthy() {
        try {
            Map<String, Object> response = webClient.get()
                .uri(baseUrl + "/health")
                .retrieve()
                .bodyToMono(Map.class)
                .block();
            return response != null && "Healthy".equals(response.get("Status"));
        } catch (Exception e) {
            log.warn("gRPC Provider health check failed: {}", e.getMessage());
            return false;
        }
    }
}
