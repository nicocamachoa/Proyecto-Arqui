package com.allconnect.integration.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class GenericAccessResponse {
    private boolean success;
    private boolean hasAccess;
    private String accessUrl;
    private LocalDateTime expiresAt;
    private String errorMessage;
}
