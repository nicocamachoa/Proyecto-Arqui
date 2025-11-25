package com.allconnect.integration.adapter;

import com.allconnect.integration.core.IProviderAdapter;
import com.allconnect.integration.dto.*;
import com.allconnect.integration.exception.IntegrationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

@Component
public class RestProviderAdapter implements IProviderAdapter {

    private static final Logger log = LoggerFactory.getLogger(RestProviderAdapter.class);

    private final WebClient webClient;

    @Value("${integration.providers[0].baseUrl:http://localhost:4001}")
    private String baseUrl;

    public RestProviderAdapter(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    @Override
    public String getProviderType() {
        return "REST";
    }

    @Override
    public String getProviderId() {
        return "rest-provider";
    }

    @Override
    public GenericOrderResponse createOrder(GenericOrderRequest request) {
        log.info("REST Adapter: Creating order for customer: {}", request.getCustomerId());
        try {
            // Transform to provider format
            Map<String, Object> providerRequest = Map.of(
                "customerId", request.getCustomerId(),
                "customerEmail", request.getCustomerEmail(),
                "items", request.getItems().stream()
                    .map(item -> Map.of("productId", item.getProductId(), "quantity", item.getQuantity()))
                    .toList(),
                "shippingAddress", request.getShippingAddress() != null ? Map.of(
                    "street", request.getShippingAddress().getStreet(),
                    "city", request.getShippingAddress().getCity(),
                    "state", request.getShippingAddress().getState(),
                    "zipCode", request.getShippingAddress().getZipCode(),
                    "country", request.getShippingAddress().getCountry()
                ) : Map.of()
            );

            Map<String, Object> response = webClient.post()
                .uri(baseUrl + "/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(providerRequest)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            // Transform response
            GenericOrderResponse result = new GenericOrderResponse();
            result.setSuccess(response != null && Boolean.TRUE.equals(response.get("success")));
            result.setProviderOrderId((String) response.get("orderId"));
            result.setStatus((String) response.get("status"));
            result.setTrackingNumber((String) response.get("trackingNumber"));
            if (response.get("estimatedDelivery") != null) {
                result.setEstimatedDelivery(parseDateTime((String) response.get("estimatedDelivery")));
            }
            result.setErrorMessage((String) response.get("errorMessage"));
            return result;
        } catch (Exception e) {
            log.error("Error creating order via REST: {}", e.getMessage());
            GenericOrderResponse error = new GenericOrderResponse();
            error.setSuccess(false);
            error.setErrorMessage("REST Provider error: " + e.getMessage());
            return error;
        }
    }

    @Override
    public GenericStatusResponse getOrderStatus(String orderId) {
        log.info("REST Adapter: Getting status for order: {}", orderId);
        try {
            Map<String, Object> response = webClient.get()
                .uri(baseUrl + "/api/orders/{id}/status", orderId)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            GenericStatusResponse result = new GenericStatusResponse();
            result.setSuccess(response != null);
            result.setOrderId((String) response.get("orderId"));
            result.setStatus((String) response.get("status"));
            result.setTrackingNumber((String) response.get("trackingNumber"));
            result.setCurrentLocation((String) response.get("currentLocation"));
            result.setLastUpdate(LocalDateTime.now());
            return result;
        } catch (Exception e) {
            log.error("Error getting order status: {}", e.getMessage());
            GenericStatusResponse error = new GenericStatusResponse();
            error.setSuccess(false);
            error.setErrorMessage("REST Provider error: " + e.getMessage());
            return error;
        }
    }

    @Override
    public GenericCancelResponse cancelOrder(String orderId) {
        log.info("REST Adapter: Cancelling order: {}", orderId);
        try {
            Map<String, Object> response = webClient.delete()
                .uri(baseUrl + "/api/orders/{id}", orderId)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            GenericCancelResponse result = new GenericCancelResponse();
            result.setSuccess(response != null && Boolean.TRUE.equals(response.get("success")));
            result.setErrorMessage((String) response.get("message"));
            return result;
        } catch (Exception e) {
            log.error("Error cancelling order: {}", e.getMessage());
            GenericCancelResponse error = new GenericCancelResponse();
            error.setSuccess(false);
            error.setErrorMessage("REST Provider error: " + e.getMessage());
            return error;
        }
    }

    @Override
    public GenericInventoryResponse checkInventory(String productId) {
        log.info("REST Adapter: Checking inventory for: {}", productId);
        try {
            Map<String, Object> response = webClient.get()
                .uri(baseUrl + "/api/inventory/{productId}", productId)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            GenericInventoryResponse result = new GenericInventoryResponse();
            result.setSuccess(response != null);
            result.setProductId((String) response.get("productId"));
            result.setAvailableStock(((Number) response.get("availableStock")).intValue());
            result.setReservedStock(((Number) response.get("reservedStock")).intValue());
            result.setInStock(Boolean.TRUE.equals(response.get("inStock")));
            result.setWarehouseLocation((String) response.get("warehouseLocation"));
            result.setLastUpdated(LocalDateTime.now());
            return result;
        } catch (Exception e) {
            log.error("Error checking inventory: {}", e.getMessage());
            GenericInventoryResponse error = new GenericInventoryResponse();
            error.setSuccess(false);
            error.setErrorMessage("REST Provider error: " + e.getMessage());
            return error;
        }
    }

    // SOAP operations - not supported by REST adapter
    @Override
    public GenericBookingResponse createBooking(GenericBookingRequest request) {
        GenericBookingResponse response = new GenericBookingResponse();
        response.setSuccess(false);
        response.setErrorMessage("Booking operations not supported by REST provider");
        return response;
    }

    @Override
    public GenericBookingResponse getBooking(String bookingId) {
        GenericBookingResponse response = new GenericBookingResponse();
        response.setSuccess(false);
        response.setErrorMessage("Booking operations not supported by REST provider");
        return response;
    }

    @Override
    public GenericCancelResponse cancelBooking(String bookingId) {
        GenericCancelResponse response = new GenericCancelResponse();
        response.setSuccess(false);
        response.setErrorMessage("Booking operations not supported by REST provider");
        return response;
    }

    @Override
    public GenericAvailabilityResponse checkAvailability(String serviceId, LocalDate date) {
        GenericAvailabilityResponse response = new GenericAvailabilityResponse();
        response.setSuccess(false);
        response.setErrorMessage("Availability operations not supported by REST provider");
        return response;
    }

    // gRPC operations - not supported by REST adapter
    @Override
    public GenericSubscriptionResponse createSubscription(GenericSubscriptionRequest request) {
        GenericSubscriptionResponse response = new GenericSubscriptionResponse();
        response.setSuccess(false);
        response.setErrorMessage("Subscription operations not supported by REST provider");
        return response;
    }

    @Override
    public GenericSubscriptionResponse getSubscription(String subscriptionId) {
        GenericSubscriptionResponse response = new GenericSubscriptionResponse();
        response.setSuccess(false);
        response.setErrorMessage("Subscription operations not supported by REST provider");
        return response;
    }

    @Override
    public GenericCancelResponse cancelSubscription(String subscriptionId) {
        GenericCancelResponse response = new GenericCancelResponse();
        response.setSuccess(false);
        response.setErrorMessage("Subscription operations not supported by REST provider");
        return response;
    }

    @Override
    public GenericAccessResponse checkAccess(String subscriptionId, String contentId) {
        GenericAccessResponse response = new GenericAccessResponse();
        response.setSuccess(false);
        response.setErrorMessage("Access check operations not supported by REST provider");
        return response;
    }

    @Override
    public boolean isHealthy() {
        try {
            Map<String, Object> response = webClient.get()
                .uri(baseUrl + "/api/health")
                .retrieve()
                .bodyToMono(Map.class)
                .block();
            return response != null && "Healthy".equals(response.get("Status"));
        } catch (Exception e) {
            log.warn("REST Provider health check failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Parse datetime string from .NET format (with variable precision microseconds)
     * Examples: 2025-11-28T06:05:56.9740515Z, 2025-11-28T06:05:56Z, 2025-11-28T06:05:56.123Z
     */
    private LocalDateTime parseDateTime(String dateTimeStr) {
        if (dateTimeStr == null || dateTimeStr.isEmpty()) {
            return null;
        }
        try {
            // Try parsing as OffsetDateTime (handles 'Z' suffix)
            OffsetDateTime odt = OffsetDateTime.parse(dateTimeStr);
            return odt.toLocalDateTime();
        } catch (DateTimeParseException e) {
            // Fallback: truncate to standard format
            try {
                String truncated = dateTimeStr;
                // Remove 'Z' and truncate microseconds if present
                if (truncated.endsWith("Z")) {
                    truncated = truncated.substring(0, truncated.length() - 1);
                }
                // If there's a dot, keep only 3 decimal places
                int dotIndex = truncated.indexOf('.');
                if (dotIndex > 0 && truncated.length() > dotIndex + 4) {
                    truncated = truncated.substring(0, dotIndex + 4);
                }
                return LocalDateTime.parse(truncated);
            } catch (Exception ex) {
                log.warn("Could not parse datetime: {}", dateTimeStr);
                return LocalDateTime.now();
            }
        }
    }
}
