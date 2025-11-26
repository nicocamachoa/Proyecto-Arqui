package com.allconnect.gateway.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemMetricsDTO {
    private double cpuUsage;
    private double memoryUsage;
    private double diskUsage;
    private int activeConnections;
    private double requestsPerMinute;
}
