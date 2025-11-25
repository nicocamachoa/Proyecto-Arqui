package com.allconnect.integration.adapter;

import com.allconnect.integration.core.IProviderAdapter;
import com.allconnect.integration.dto.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * SOAP Provider Adapter that communicates with CoreWCF service.
 * Uses HTTP/JSON wrapper for simplicity (CoreWCF also supports REST-style calls).
 */
@Component
public class SoapProviderAdapter implements IProviderAdapter {

    private static final Logger log = LoggerFactory.getLogger(SoapProviderAdapter.class);

    private final WebClient webClient;

    @Value("${integration.providers[1].baseUrl:http://localhost:4002}")
    private String baseUrl;

    public SoapProviderAdapter(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    @Override
    public String getProviderType() {
        return "SOAP";
    }

    @Override
    public String getProviderId() {
        return "soap-provider";
    }

    // REST operations - not supported by SOAP adapter
    @Override
    public GenericOrderResponse createOrder(GenericOrderRequest request) {
        GenericOrderResponse response = new GenericOrderResponse();
        response.setSuccess(false);
        response.setErrorMessage("Order operations not supported by SOAP provider");
        return response;
    }

    @Override
    public GenericStatusResponse getOrderStatus(String orderId) {
        GenericStatusResponse response = new GenericStatusResponse();
        response.setSuccess(false);
        response.setErrorMessage("Order operations not supported by SOAP provider");
        return response;
    }

    @Override
    public GenericCancelResponse cancelOrder(String orderId) {
        GenericCancelResponse response = new GenericCancelResponse();
        response.setSuccess(false);
        response.setErrorMessage("Order operations not supported by SOAP provider");
        return response;
    }

    @Override
    public GenericInventoryResponse checkInventory(String productId) {
        GenericInventoryResponse response = new GenericInventoryResponse();
        response.setSuccess(false);
        response.setErrorMessage("Inventory operations not supported by SOAP provider");
        return response;
    }

    // SOAP Booking operations - Using REST API wrapper for easier E2E testing
    @Override
    public GenericBookingResponse createBooking(GenericBookingRequest request) {
        log.info("SOAP Adapter: Creating booking for service: {}", request.getServiceId());
        try {
            // Use REST API endpoint instead of SOAP for easier integration
            Map<String, Object> restRequest = Map.of(
                "serviceId", request.getServiceId(),
                "customerId", request.getCustomerId(),
                "customerName", request.getCustomerName(),
                "customerEmail", request.getCustomerEmail(),
                "preferredDateTime", request.getPreferredDateTime().toString(),
                "notes", request.getNotes() != null ? request.getNotes() : ""
            );

            Map<String, Object> response = webClient.post()
                .uri(baseUrl + "/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(restRequest)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            GenericBookingResponse result = new GenericBookingResponse();
            result.setSuccess(response != null && Boolean.TRUE.equals(response.get("success")));
            result.setBookingId((String) response.get("bookingId"));
            result.setConfirmationCode((String) response.get("confirmationCode"));
            result.setProviderName((String) response.get("providerName"));
            result.setServiceName((String) response.get("serviceName"));
            result.setStatus((String) response.get("status"));
            result.setErrorMessage((String) response.get("errorMessage"));
            return result;
        } catch (Exception e) {
            log.error("Error creating booking via SOAP: {}", e.getMessage());
            GenericBookingResponse error = new GenericBookingResponse();
            error.setSuccess(false);
            error.setErrorMessage("SOAP Provider error: " + e.getMessage());
            return error;
        }
    }

    @Override
    public GenericBookingResponse getBooking(String bookingId) {
        log.info("SOAP Adapter: Getting booking: {}", bookingId);
        try {
            Map<String, Object> response = webClient.get()
                .uri(baseUrl + "/api/bookings/{bookingId}", bookingId)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            GenericBookingResponse result = new GenericBookingResponse();
            result.setSuccess(response != null && Boolean.TRUE.equals(response.get("success")));
            result.setBookingId((String) response.get("bookingId"));
            result.setConfirmationCode((String) response.get("confirmationCode"));
            result.setProviderName((String) response.get("providerName"));
            result.setServiceName((String) response.get("serviceName"));
            result.setStatus((String) response.get("status"));
            result.setErrorMessage((String) response.get("errorMessage"));
            return result;
        } catch (Exception e) {
            log.error("Error getting booking: {}", e.getMessage());
            GenericBookingResponse error = new GenericBookingResponse();
            error.setSuccess(false);
            error.setErrorMessage("SOAP Provider error: " + e.getMessage());
            return error;
        }
    }

    @Override
    public GenericCancelResponse cancelBooking(String bookingId) {
        log.info("SOAP Adapter: Cancelling booking: {}", bookingId);
        try {
            Map<String, Object> response = webClient.delete()
                .uri(baseUrl + "/api/bookings/{bookingId}", bookingId)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            GenericCancelResponse result = new GenericCancelResponse();
            result.setSuccess(response != null && Boolean.TRUE.equals(response.get("success")));
            result.setErrorMessage((String) response.get("errorMessage"));
            return result;
        } catch (Exception e) {
            log.error("Error cancelling booking: {}", e.getMessage());
            GenericCancelResponse error = new GenericCancelResponse();
            error.setSuccess(false);
            error.setErrorMessage("SOAP Provider error: " + e.getMessage());
            return error;
        }
    }

    @Override
    public GenericAvailabilityResponse checkAvailability(String serviceId, LocalDate date) {
        log.info("SOAP Adapter: Checking availability for service: {} on {}", serviceId, date);
        try {
            Map<String, Object> response = webClient.get()
                .uri(baseUrl + "/api/availability/{serviceId}?date={date}", serviceId, date.toString())
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            GenericAvailabilityResponse result = new GenericAvailabilityResponse();
            result.setSuccess(response != null && Boolean.TRUE.equals(response.get("success")));
            result.setServiceId(serviceId);
            result.setDate(date);
            // Parse slots from response
            result.setSlots(List.of()); // Simplified for E2E demo
            result.setErrorMessage((String) response.get("errorMessage"));
            return result;
        } catch (Exception e) {
            log.error("Error checking availability: {}", e.getMessage());
            GenericAvailabilityResponse error = new GenericAvailabilityResponse();
            error.setSuccess(false);
            error.setErrorMessage("SOAP Provider error: " + e.getMessage());
            return error;
        }
    }

    // gRPC operations - not supported by SOAP adapter
    @Override
    public GenericSubscriptionResponse createSubscription(GenericSubscriptionRequest request) {
        GenericSubscriptionResponse response = new GenericSubscriptionResponse();
        response.setSuccess(false);
        response.setErrorMessage("Subscription operations not supported by SOAP provider");
        return response;
    }

    @Override
    public GenericSubscriptionResponse getSubscription(String subscriptionId) {
        GenericSubscriptionResponse response = new GenericSubscriptionResponse();
        response.setSuccess(false);
        response.setErrorMessage("Subscription operations not supported by SOAP provider");
        return response;
    }

    @Override
    public GenericCancelResponse cancelSubscription(String subscriptionId) {
        GenericCancelResponse response = new GenericCancelResponse();
        response.setSuccess(false);
        response.setErrorMessage("Subscription operations not supported by SOAP provider");
        return response;
    }

    @Override
    public GenericAccessResponse checkAccess(String subscriptionId, String contentId) {
        GenericAccessResponse response = new GenericAccessResponse();
        response.setSuccess(false);
        response.setErrorMessage("Access check operations not supported by SOAP provider");
        return response;
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
            log.warn("SOAP Provider health check failed: {}", e.getMessage());
            return false;
        }
    }

}
