package com.allconnect.integration.service;

import com.allconnect.integration.core.IProviderAdapter;
import com.allconnect.integration.dto.*;
import com.allconnect.integration.factory.AdapterFactory;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
public class IntegrationOrchestrator {

    private static final Logger log = LoggerFactory.getLogger(IntegrationOrchestrator.class);

    private final AdapterFactory adapterFactory;
    private final WebClient webClient;

    @Value("${integration.providers[0].baseUrl:http://localhost:4001}")
    private String restProviderUrl;

    @Value("${integration.providers[1].baseUrl:http://localhost:4002}")
    private String soapProviderUrl;

    @Value("${integration.providers[2].baseUrl:http://localhost:4003}")
    private String grpcProviderUrl;

    public IntegrationOrchestrator(AdapterFactory adapterFactory, WebClient.Builder webClientBuilder) {
        this.adapterFactory = adapterFactory;
        this.webClient = webClientBuilder.build();
    }

    // ============================================
    // Products Operations (Aggregated from all providers)
    // ============================================

    public Map<String, Object> getAllProducts() {
        log.info("Orchestrator: Fetching products from all providers");
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> allProducts = new ArrayList<>();

        // Fetch from REST provider (Physical Products)
        try {
            List<Map<String, Object>> restProducts = webClient.get()
                .uri(restProviderUrl + "/api/products")
                .retrieve()
                .bodyToFlux(Map.class)
                .map(p -> {
                    Map<String, Object> product = new HashMap<>(p);
                    product.put("providerType", "REST");
                    product.put("productType", "PHYSICAL");
                    return product;
                })
                .collectList()
                .block();
            if (restProducts != null) {
                allProducts.addAll(restProducts);
                log.info("Fetched {} products from REST provider", restProducts.size());
            }
        } catch (Exception e) {
            log.error("Error fetching from REST provider: {}", e.getMessage());
        }

        // Fetch from SOAP provider (Professional Services)
        try {
            Map<String, Object> soapResponse = webClient.get()
                .uri(soapProviderUrl + "/api/services")
                .retrieve()
                .bodyToMono(Map.class)
                .block();
            if (soapResponse != null && soapResponse.get("services") != null) {
                List<Map<String, Object>> services = (List<Map<String, Object>>) soapResponse.get("services");
                for (Map<String, Object> service : services) {
                    Map<String, Object> product = new HashMap<>(service);
                    product.put("providerType", "SOAP");
                    product.put("productType", "SERVICE");
                    product.put("stock", 999); // Services have unlimited "stock"
                    allProducts.add(product);
                }
                log.info("Fetched {} services from SOAP provider", services.size());
            }
        } catch (Exception e) {
            log.error("Error fetching from SOAP provider: {}", e.getMessage());
        }

        // Fetch from gRPC provider (Digital Subscriptions)
        try {
            List<Map<String, Object>> grpcProducts = webClient.get()
                .uri(grpcProviderUrl + "/api/subscriptions")
                .retrieve()
                .bodyToFlux(Map.class)
                .map(p -> {
                    Map<String, Object> product = new HashMap<>(p);
                    product.put("providerType", "GRPC");
                    product.put("productType", "DIGITAL");
                    product.put("stock", 999); // Digital products have unlimited "stock"
                    return product;
                })
                .collectList()
                .block();
            if (grpcProducts != null) {
                allProducts.addAll(grpcProducts);
                log.info("Fetched {} subscriptions from gRPC provider", grpcProducts.size());
            }
        } catch (Exception e) {
            log.error("Error fetching from gRPC provider: {}", e.getMessage());
        }

        result.put("products", allProducts);
        result.put("total", allProducts.size());
        result.put("providers", Map.of(
            "rest", restProviderUrl,
            "soap", soapProviderUrl,
            "grpc", grpcProviderUrl
        ));
        return result;
    }

    public Map<String, Object> getProductById(String productId) {
        log.info("Orchestrator: Fetching product {} from providers", productId);

        // Try REST provider first (PROD* IDs)
        if (productId.startsWith("PROD")) {
            try {
                Map<String, Object> product = webClient.get()
                    .uri(restProviderUrl + "/api/products/{id}", productId)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
                if (product != null) {
                    product.put("providerType", "REST");
                    product.put("productType", "PHYSICAL");
                    return product;
                }
            } catch (Exception e) {
                log.warn("Product {} not found in REST provider", productId);
            }
        }

        // Try SOAP provider (SVC* IDs)
        if (productId.startsWith("SVC")) {
            try {
                Map<String, Object> service = webClient.get()
                    .uri(soapProviderUrl + "/api/services/{id}", productId)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
                if (service != null) {
                    service.put("providerType", "SOAP");
                    service.put("productType", "SERVICE");
                    service.put("stock", 999);
                    return service;
                }
            } catch (Exception e) {
                log.warn("Service {} not found in SOAP provider", productId);
            }
        }

        // Try gRPC provider (SUB* IDs)
        if (productId.startsWith("SUB")) {
            try {
                Map<String, Object> subscription = webClient.get()
                    .uri(grpcProviderUrl + "/api/subscriptions/{id}", productId)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
                if (subscription != null) {
                    subscription.put("providerType", "GRPC");
                    subscription.put("productType", "DIGITAL");
                    subscription.put("stock", 999);
                    return subscription;
                }
            } catch (Exception e) {
                log.warn("Subscription {} not found in gRPC provider", productId);
            }
        }

        return Collections.emptyMap();
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
