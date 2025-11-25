package com.allconnect.integration.dto;

import lombok.Data;
import java.util.Map;

@Data
public class GenericSubscriptionRequest {
    private String customerId;
    private String customerEmail;
    private String planId;
    private String paymentMethodId;
    private Map<String, Object> metadata;
}
