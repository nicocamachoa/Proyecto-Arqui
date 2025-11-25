package com.allconnect.integration.dto;

import lombok.Data;

@Data
public class ProviderConfig {
    private String id;
    private String name;
    private String protocol; // REST, SOAP, GRPC
    private String baseUrl;
    private String wsdlUrl;
    private String host;
    private int port;
    private int timeout = 5000;
    private int retries = 3;
    private boolean enabled = true;
}
