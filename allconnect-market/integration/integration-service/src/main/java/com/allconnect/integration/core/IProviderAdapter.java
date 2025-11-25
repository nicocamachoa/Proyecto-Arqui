package com.allconnect.integration.core;

import com.allconnect.integration.dto.*;
import java.time.LocalDate;

/**
 * Generic interface that all provider adapters must implement.
 * This enables protocol-agnostic communication with external providers.
 */
public interface IProviderAdapter {

    /**
     * Returns the protocol type (REST, SOAP, GRPC)
     */
    String getProviderType();

    /**
     * Returns the unique provider identifier
     */
    String getProviderId();

    // ============================================
    // Physical Products Operations (REST Provider)
    // ============================================

    /**
     * Creates an order for physical products
     */
    GenericOrderResponse createOrder(GenericOrderRequest request);

    /**
     * Gets the status of an existing order
     */
    GenericStatusResponse getOrderStatus(String orderId);

    /**
     * Cancels an existing order
     */
    GenericCancelResponse cancelOrder(String orderId);

    /**
     * Checks inventory for a product
     */
    GenericInventoryResponse checkInventory(String productId);

    // ============================================
    // Professional Services Operations (SOAP Provider)
    // ============================================

    /**
     * Creates a booking for professional services
     */
    GenericBookingResponse createBooking(GenericBookingRequest request);

    /**
     * Gets details of an existing booking
     */
    GenericBookingResponse getBooking(String bookingId);

    /**
     * Cancels an existing booking
     */
    GenericCancelResponse cancelBooking(String bookingId);

    /**
     * Checks availability for a service on a specific date
     */
    GenericAvailabilityResponse checkAvailability(String serviceId, LocalDate date);

    // ============================================
    // Digital Subscriptions Operations (gRPC Provider)
    // ============================================

    /**
     * Creates a subscription for digital content
     */
    GenericSubscriptionResponse createSubscription(GenericSubscriptionRequest request);

    /**
     * Gets details of an existing subscription
     */
    GenericSubscriptionResponse getSubscription(String subscriptionId);

    /**
     * Cancels an existing subscription
     */
    GenericCancelResponse cancelSubscription(String subscriptionId);

    /**
     * Checks access to specific content
     */
    GenericAccessResponse checkAccess(String subscriptionId, String contentId);

    // ============================================
    // Health Check
    // ============================================

    /**
     * Returns true if the provider is healthy and responding
     */
    boolean isHealthy();
}
