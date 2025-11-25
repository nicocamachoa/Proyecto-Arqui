package com.allconnect.integration.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class GenericAvailabilityResponse {
    private boolean success;
    private String serviceId;
    private LocalDate date;
    private List<TimeSlot> slots;
    private String errorMessage;
}
