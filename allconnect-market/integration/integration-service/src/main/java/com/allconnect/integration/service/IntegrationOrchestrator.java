package com.allconnect.integration.service;

import com.allconnect.integration.core.IProviderAdapter;
import com.allconnect.integration.dto.*;
import com.allconnect.integration.factory.AdapterFactory;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.time.LocalDate;

@Service
public class IntegrationOrchestrator {

    private static final Logger log = LoggerFactory.getLogger(IntegrationOrchestrator.class);

    private final AdapterFactory adapterFactory;

    public IntegrationOrchestrator(AdapterFactory adapterFactory) {
        this.adapterFactory = adapterFactory;
    }

    // ============================================
    // Order Operations (REST Provider)
    // ============================================

    @CircuitBreaker(name = "restProvider", fallbackMethod = "createOrderFallback")
    public GenericOrderResponse createOrder(GenericOrderRequest request) {
        log.info("Orchestrator: Creating order via REST provider");
        IProviderAdapter adapter = adapterFactory.getAdapter("REST");
        return adapter.createOrder(request);
    }

    public GenericOrderResponse createOrderFallback(GenericOrderRequest request, Throwable t) {
        log.error("Circuit breaker fallback for createOrder: {}", t.getMessage());
        GenericOrderResponse response = new GenericOrderResponse();
        response.setSuccess(false);
        response.setErrorMessage("Service temporarily unavailable. Please try again later.");
        return response;
    }

    @CircuitBreaker(name = "restProvider", fallbackMethod = "getOrderStatusFallback")
    public GenericStatusResponse getOrderStatus(String orderId) {
        log.info("Orchestrator: Getting order status via REST provider");
        IProviderAdapter adapter = adapterFactory.getAdapter("REST");
        return adapter.getOrderStatus(orderId);
    }

    public GenericStatusResponse getOrderStatusFallback(String orderId, Throwable t) {
        log.error("Circuit breaker fallback for getOrderStatus: {}", t.getMessage());
        GenericStatusResponse response = new GenericStatusResponse();
        response.setSuccess(false);
        response.setErrorMessage("Service temporarily unavailable.");
        return response;
    }

    @CircuitBreaker(name = "restProvider", fallbackMethod = "cancelOrderFallback")
    public GenericCancelResponse cancelOrder(String orderId) {
        log.info("Orchestrator: Cancelling order via REST provider");
        IProviderAdapter adapter = adapterFactory.getAdapter("REST");
        return adapter.cancelOrder(orderId);
    }

    public GenericCancelResponse cancelOrderFallback(String orderId, Throwable t) {
        log.error("Circuit breaker fallback for cancelOrder: {}", t.getMessage());
        GenericCancelResponse response = new GenericCancelResponse();
        response.setSuccess(false);
        response.setErrorMessage("Service temporarily unavailable.");
        return response;
    }

    @CircuitBreaker(name = "restProvider", fallbackMethod = "checkInventoryFallback")
    public GenericInventoryResponse checkInventory(String productId) {
        log.info("Orchestrator: Checking inventory via REST provider");
        IProviderAdapter adapter = adapterFactory.getAdapter("REST");
        return adapter.checkInventory(productId);
    }

    public GenericInventoryResponse checkInventoryFallback(String productId, Throwable t) {
        log.error("Circuit breaker fallback for checkInventory: {}", t.getMessage());
        GenericInventoryResponse response = new GenericInventoryResponse();
        response.setSuccess(false);
        response.setErrorMessage("Service temporarily unavailable.");
        return response;
    }

    // ============================================
    // Booking Operations (SOAP Provider)
    // ============================================

    @CircuitBreaker(name = "soapProvider", fallbackMethod = "createBookingFallback")
    public GenericBookingResponse createBooking(GenericBookingRequest request) {
        log.info("Orchestrator: Creating booking via SOAP provider");
        IProviderAdapter adapter = adapterFactory.getAdapter("SOAP");
        return adapter.createBooking(request);
    }

    public GenericBookingResponse createBookingFallback(GenericBookingRequest request, Throwable t) {
        log.error("Circuit breaker fallback for createBooking: {}", t.getMessage());
        GenericBookingResponse response = new GenericBookingResponse();
        response.setSuccess(false);
        response.setErrorMessage("Service temporarily unavailable.");
        return response;
    }

    @CircuitBreaker(name = "soapProvider", fallbackMethod = "getBookingFallback")
    public GenericBookingResponse getBooking(String bookingId) {
        log.info("Orchestrator: Getting booking via SOAP provider");
        IProviderAdapter adapter = adapterFactory.getAdapter("SOAP");
        return adapter.getBooking(bookingId);
    }

    public GenericBookingResponse getBookingFallback(String bookingId, Throwable t) {
        log.error("Circuit breaker fallback for getBooking: {}", t.getMessage());
        GenericBookingResponse response = new GenericBookingResponse();
        response.setSuccess(false);
        response.setErrorMessage("Service temporarily unavailable.");
        return response;
    }

    @CircuitBreaker(name = "soapProvider", fallbackMethod = "cancelBookingFallback")
    public GenericCancelResponse cancelBooking(String bookingId) {
        log.info("Orchestrator: Cancelling booking via SOAP provider");
        IProviderAdapter adapter = adapterFactory.getAdapter("SOAP");
        return adapter.cancelBooking(bookingId);
    }

    public GenericCancelResponse cancelBookingFallback(String bookingId, Throwable t) {
        log.error("Circuit breaker fallback for cancelBooking: {}", t.getMessage());
        GenericCancelResponse response = new GenericCancelResponse();
        response.setSuccess(false);
        response.setErrorMessage("Service temporarily unavailable.");
        return response;
    }

    @CircuitBreaker(name = "soapProvider", fallbackMethod = "checkAvailabilityFallback")
    public GenericAvailabilityResponse checkAvailability(String serviceId, LocalDate date) {
        log.info("Orchestrator: Checking availability via SOAP provider");
        IProviderAdapter adapter = adapterFactory.getAdapter("SOAP");
        return adapter.checkAvailability(serviceId, date);
    }

    public GenericAvailabilityResponse checkAvailabilityFallback(String serviceId, LocalDate date, Throwable t) {
        log.error("Circuit breaker fallback for checkAvailability: {}", t.getMessage());
        GenericAvailabilityResponse response = new GenericAvailabilityResponse();
        response.setSuccess(false);
        response.setErrorMessage("Service temporarily unavailable.");
        return response;
    }

    // ============================================
    // Subscription Operations (gRPC Provider)
    // ============================================

    @CircuitBreaker(name = "grpcProvider", fallbackMethod = "createSubscriptionFallback")
    public GenericSubscriptionResponse createSubscription(GenericSubscriptionRequest request) {
        log.info("Orchestrator: Creating subscription via gRPC provider");
        IProviderAdapter adapter = adapterFactory.getAdapter("GRPC");
        return adapter.createSubscription(request);
    }

    public GenericSubscriptionResponse createSubscriptionFallback(GenericSubscriptionRequest request, Throwable t) {
        log.error("Circuit breaker fallback for createSubscription: {}", t.getMessage());
        GenericSubscriptionResponse response = new GenericSubscriptionResponse();
        response.setSuccess(false);
        response.setErrorMessage("Service temporarily unavailable.");
        return response;
    }

    @CircuitBreaker(name = "grpcProvider", fallbackMethod = "getSubscriptionFallback")
    public GenericSubscriptionResponse getSubscription(String subscriptionId) {
        log.info("Orchestrator: Getting subscription via gRPC provider");
        IProviderAdapter adapter = adapterFactory.getAdapter("GRPC");
        return adapter.getSubscription(subscriptionId);
    }

    public GenericSubscriptionResponse getSubscriptionFallback(String subscriptionId, Throwable t) {
        log.error("Circuit breaker fallback for getSubscription: {}", t.getMessage());
        GenericSubscriptionResponse response = new GenericSubscriptionResponse();
        response.setSuccess(false);
        response.setErrorMessage("Service temporarily unavailable.");
        return response;
    }

    @CircuitBreaker(name = "grpcProvider", fallbackMethod = "cancelSubscriptionFallback")
    public GenericCancelResponse cancelSubscription(String subscriptionId) {
        log.info("Orchestrator: Cancelling subscription via gRPC provider");
        IProviderAdapter adapter = adapterFactory.getAdapter("GRPC");
        return adapter.cancelSubscription(subscriptionId);
    }

    public GenericCancelResponse cancelSubscriptionFallback(String subscriptionId, Throwable t) {
        log.error("Circuit breaker fallback for cancelSubscription: {}", t.getMessage());
        GenericCancelResponse response = new GenericCancelResponse();
        response.setSuccess(false);
        response.setErrorMessage("Service temporarily unavailable.");
        return response;
    }

    @CircuitBreaker(name = "grpcProvider", fallbackMethod = "checkAccessFallback")
    public GenericAccessResponse checkAccess(String subscriptionId, String contentId) {
        log.info("Orchestrator: Checking access via gRPC provider");
        IProviderAdapter adapter = adapterFactory.getAdapter("GRPC");
        return adapter.checkAccess(subscriptionId, contentId);
    }

    public GenericAccessResponse checkAccessFallback(String subscriptionId, String contentId, Throwable t) {
        log.error("Circuit breaker fallback for checkAccess: {}", t.getMessage());
        GenericAccessResponse response = new GenericAccessResponse();
        response.setSuccess(false);
        response.setErrorMessage("Service temporarily unavailable.");
        return response;
    }
}
