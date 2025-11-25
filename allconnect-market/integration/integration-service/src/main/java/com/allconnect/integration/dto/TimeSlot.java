package com.allconnect.integration.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TimeSlot {
    private LocalDateTime time;
    private boolean available;
}
