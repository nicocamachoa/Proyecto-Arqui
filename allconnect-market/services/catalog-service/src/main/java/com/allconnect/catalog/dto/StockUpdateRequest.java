package com.allconnect.catalog.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockUpdateRequest {

    @NotNull(message = "Quantity is required")
    private Integer quantity;

    private String operation; // ADD, SUBTRACT, SET
}
