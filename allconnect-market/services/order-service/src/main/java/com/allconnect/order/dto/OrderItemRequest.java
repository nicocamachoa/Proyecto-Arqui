package com.allconnect.order.dto;

import com.allconnect.order.model.ProductType;
import com.allconnect.order.model.ProviderType;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    private String productSku;

    private String productName;

    @NotNull(message = "Product type is required")
    private ProductType productType;

    private ProviderType providerType;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @NotNull(message = "Unit price is required")
    @Positive(message = "Unit price must be positive")
    private BigDecimal unitPrice;

    // For services
    private String bookingDate;
    private String bookingTime;
}
