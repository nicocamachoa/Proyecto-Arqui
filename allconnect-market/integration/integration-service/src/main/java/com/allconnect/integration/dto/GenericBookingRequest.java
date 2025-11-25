package com.allconnect.integration.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;

@Data
public class GenericBookingRequest {
    private String customerId;
    private String customerName;
    private String customerEmail;
    private String serviceId;
    private LocalDateTime preferredDateTime;
    private String notes;
    private Map<String, Object> metadata;
}
