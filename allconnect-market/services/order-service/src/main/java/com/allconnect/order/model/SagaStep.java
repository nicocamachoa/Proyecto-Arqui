package com.allconnect.order.model;

public enum SagaStep {
    CREATED,
    PROCESS_PAYMENT,
    UPDATE_STOCK,
    CONFIRM_PROVIDER,
    SEND_NOTIFICATION,
    CREATE_INVOICE,
    COMPLETED,
    COMPENSATING,
    FAILED
}
