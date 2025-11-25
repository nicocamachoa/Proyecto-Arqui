package com.allconnect.integration.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;

@Data
public class GenericOrderResponse {
    private boolean success;
    private String providerOrderId;
    private String status;
    private String trackingNumber;
    private LocalDateTime estimatedDelivery;
    private String errorMessage;
    private Map<String, Object> metadata;
}
