package com.allconnect.integration.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class GenericStatusResponse {
    private boolean success;
    private String orderId;
    private String status;
    private String trackingNumber;
    private String currentLocation;
    private LocalDateTime lastUpdate;
    private List<StatusHistoryEntry> history;
    private String errorMessage;
}
