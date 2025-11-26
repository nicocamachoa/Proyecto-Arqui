package com.allconnect.gateway.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IntegrationStatusDTO {
    private String name;
    private String type; // REST, SOAP, GRPC
    private String endpoint;
    private String status; // CONNECTED, DISCONNECTED, ERROR
    private String lastSync;
    private double successRate;
    private long avgResponseTime;
}
