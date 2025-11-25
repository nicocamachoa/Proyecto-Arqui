package com.allconnect.integration.api;

import com.allconnect.integration.dto.*;
import com.allconnect.integration.factory.AdapterFactory;
import com.allconnect.integration.service.IntegrationOrchestrator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/integration")
@CrossOrigin(origins = "*")
@Tag(name = "Integration API", description = "Multi-protocol integration endpoints for orders, bookings, and subscriptions")
public class IntegrationController {

    private final IntegrationOrchestrator orchestrator;
    private final AdapterFactory adapterFactory;

    public IntegrationController(IntegrationOrchestrator orchestrator, AdapterFactory adapterFactory) {
        this.orchestrator = orchestrator;
        this.adapterFactory = adapterFactory;
    }

    // ============================================
    // Health & Info Endpoints
    // ============================================

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Returns the health status and available protocols")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "Integration Service",
            "protocols", adapterFactory.getAvailableProtocols()
        ));
    }

    @GetMapping("/providers")
    public ResponseEntity<List<String>> getAvailableProviders() {
        return ResponseEntity.ok(adapterFactory.getAvailableProtocols());
    }

    // ============================================
    // Products Endpoints (Aggregated from all providers)
    // ============================================

    @GetMapping("/products")
    @Operation(summary = "Get all products", description = "Returns products aggregated from all providers (REST, SOAP, gRPC)")
    public ResponseEntity<Map<String, Object>> getAllProducts() {
        Map<String, Object> allProducts = orchestrator.getAllProducts();
        return ResponseEntity.ok(allProducts);
    }

    @GetMapping("/products/{productId}")
    @Operation(summary = "Get product by ID", description = "Returns a single product from the appropriate provider")
    public ResponseEntity<Map<String, Object>> getProductById(@PathVariable String productId) {
        Map<String, Object> product = orchestrator.getProductById(productId);
        if (product != null && !product.isEmpty()) {
            return ResponseEntity.ok(product);
        }
        return ResponseEntity.notFound().build();
    }

    // ============================================
    // Order Endpoints (REST Provider - Physical Products)
    // ============================================

    @PostMapping("/orders")
    @Operation(summary = "Create order", description = "Creates a new order for physical products via REST provider (port 4001)")
    public ResponseEntity<GenericOrderResponse> createOrder(@RequestBody GenericOrderRequest request) {
        GenericOrderResponse response = orchestrator.createOrder(request);
        return response.isSuccess() ?
            ResponseEntity.ok(response) :
            ResponseEntity.badRequest().body(response);
    }

    @GetMapping("/orders/{orderId}/status")
    public ResponseEntity<GenericStatusResponse> getOrderStatus(@PathVariable String orderId) {
        GenericStatusResponse response = orchestrator.getOrderStatus(orderId);
        return response.isSuccess() ?
            ResponseEntity.ok(response) :
            ResponseEntity.notFound().build();
    }

    @DeleteMapping("/orders/{orderId}")
    public ResponseEntity<GenericCancelResponse> cancelOrder(@PathVariable String orderId) {
        GenericCancelResponse response = orchestrator.cancelOrder(orderId);
        return response.isSuccess() ?
            ResponseEntity.ok(response) :
            ResponseEntity.badRequest().body(response);
    }

    @GetMapping("/inventory/{productId}")
    public ResponseEntity<GenericInventoryResponse> checkInventory(@PathVariable String productId) {
        GenericInventoryResponse response = orchestrator.checkInventory(productId);
        return response.isSuccess() ?
            ResponseEntity.ok(response) :
            ResponseEntity.notFound().build();
    }

    // ============================================
    // Booking Endpoints (SOAP Provider - Professional Services)
    // ============================================

    @PostMapping("/bookings")
    @Operation(summary = "Create booking", description = "Creates a booking for professional services via SOAP provider (port 4002)")
    public ResponseEntity<GenericBookingResponse> createBooking(@RequestBody GenericBookingRequest request) {
        GenericBookingResponse response = orchestrator.createBooking(request);
        return response.isSuccess() ?
            ResponseEntity.ok(response) :
            ResponseEntity.badRequest().body(response);
    }

    @GetMapping("/bookings/{bookingId}")
    public ResponseEntity<GenericBookingResponse> getBooking(@PathVariable String bookingId) {
        GenericBookingResponse response = orchestrator.getBooking(bookingId);
        return response.isSuccess() ?
            ResponseEntity.ok(response) :
            ResponseEntity.notFound().build();
    }

    @DeleteMapping("/bookings/{bookingId}")
    public ResponseEntity<GenericCancelResponse> cancelBooking(@PathVariable String bookingId) {
        GenericCancelResponse response = orchestrator.cancelBooking(bookingId);
        return response.isSuccess() ?
            ResponseEntity.ok(response) :
            ResponseEntity.badRequest().body(response);
    }

    @GetMapping("/availability/{serviceId}")
    public ResponseEntity<GenericAvailabilityResponse> checkAvailability(
            @PathVariable String serviceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        GenericAvailabilityResponse response = orchestrator.checkAvailability(serviceId, date);
        return response.isSuccess() ?
            ResponseEntity.ok(response) :
            ResponseEntity.badRequest().body(response);
    }

    // ============================================
    // Subscription Endpoints (gRPC Provider - Digital Content)
    // ============================================

    @PostMapping("/subscriptions")
    @Operation(summary = "Create subscription", description = "Creates a digital subscription via gRPC provider (port 4003)")
    public ResponseEntity<GenericSubscriptionResponse> createSubscription(@RequestBody GenericSubscriptionRequest request) {
        GenericSubscriptionResponse response = orchestrator.createSubscription(request);
        return response.isSuccess() ?
            ResponseEntity.ok(response) :
            ResponseEntity.badRequest().body(response);
    }

    @GetMapping("/subscriptions/{subscriptionId}")
    public ResponseEntity<GenericSubscriptionResponse> getSubscription(@PathVariable String subscriptionId) {
        GenericSubscriptionResponse response = orchestrator.getSubscription(subscriptionId);
        return response.isSuccess() ?
            ResponseEntity.ok(response) :
            ResponseEntity.notFound().build();
    }

    @DeleteMapping("/subscriptions/{subscriptionId}")
    public ResponseEntity<GenericCancelResponse> cancelSubscription(@PathVariable String subscriptionId) {
        GenericCancelResponse response = orchestrator.cancelSubscription(subscriptionId);
        return response.isSuccess() ?
            ResponseEntity.ok(response) :
            ResponseEntity.badRequest().body(response);
    }

    @GetMapping("/subscriptions/{subscriptionId}/access/{contentId}")
    public ResponseEntity<GenericAccessResponse> checkAccess(
            @PathVariable String subscriptionId,
            @PathVariable String contentId) {
        GenericAccessResponse response = orchestrator.checkAccess(subscriptionId, contentId);
        return response.isSuccess() ?
            ResponseEntity.ok(response) :
            ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }
}
