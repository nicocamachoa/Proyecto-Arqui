package com.allconnect.integration.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class GenericSubscriptionResponse {
    private boolean success;
    private String subscriptionId;
    private String planId;
    private String planName;
    private String customerId;
    private String status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private List<String> features;
    private String errorMessage;
}
