package com.allconnect.gateway.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventLogDTO {
    private String id;
    private String timestamp;
    private String service;
    private String eventType;
    private String message;
    private String severity; // INFO, WARN, ERROR
    private Map<String, Object> metadata;
}
