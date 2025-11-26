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
public class ServiceHealthDTO {
    private String name;
    private String status; // UP, DOWN, DEGRADED
    private long responseTime;
    private String lastCheck;
    private Map<String, Object> details;
}
