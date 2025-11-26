package com.allconnect.order.model;

public enum OrderStatus {
    PENDING,
    CONFIRMED,
    PROCESSING,
    SHIPPED,
    DELIVERED,
    CANCELLED,
    REFUNDED,
    // Saga states
    CREATED,
    PAYMENT_PENDING,
    PAYMENT_COMPLETED,
    PAYMENT_FAILED,
    PROVIDER_PENDING,
    PROVIDER_CONFIRMED,
    PROVIDER_FAILED,
    COMPLETED
}
