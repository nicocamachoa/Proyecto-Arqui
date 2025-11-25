package com.allconnect.integration.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class StatusHistoryEntry {
    private String status;
    private LocalDateTime timestamp;
    private String location;
}
