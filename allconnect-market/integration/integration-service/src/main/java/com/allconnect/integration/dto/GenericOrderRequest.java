package com.allconnect.integration.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class GenericOrderRequest {
    private String customerId;
    private String customerEmail;
    private List<GenericOrderItem> items;
    private GenericAddress shippingAddress;
    private Map<String, Object> metadata;
}
