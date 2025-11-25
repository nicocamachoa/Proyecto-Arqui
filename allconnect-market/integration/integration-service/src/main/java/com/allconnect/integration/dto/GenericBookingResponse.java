package com.allconnect.integration.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class GenericBookingResponse {
    private boolean success;
    private String bookingId;
    private String confirmationCode;
    private LocalDateTime scheduledDateTime;
    private String providerName;
    private String serviceName;
    private String status;
    private String errorMessage;
}
