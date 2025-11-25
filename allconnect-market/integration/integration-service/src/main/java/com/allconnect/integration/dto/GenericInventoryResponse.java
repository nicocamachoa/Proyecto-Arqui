package com.allconnect.integration.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class GenericInventoryResponse {
    private boolean success;
    private String productId;
    private int availableStock;
    private int reservedStock;
    private boolean inStock;
    private String warehouseLocation;
    private LocalDateTime lastUpdated;
    private String errorMessage;
}
