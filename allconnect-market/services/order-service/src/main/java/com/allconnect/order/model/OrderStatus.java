package com.allconnect.order.model;

public enum OrderStatus {
    CREATED,
    PAYMENT_PENDING,
    PAYMENT_COMPLETED,
    PAYMENT_FAILED,
    PROVIDER_PENDING,
    PROVIDER_CONFIRMED,
    PROVIDER_FAILED,
    COMPLETED,
    CANCELLED,
    REFUNDED
}
