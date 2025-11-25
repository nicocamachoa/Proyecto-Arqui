package com.allconnect.catalog.dto;

import com.allconnect.catalog.model.ProductType;
import com.allconnect.catalog.model.ProviderType;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal price;

    @NotNull(message = "Product type is required")
    private ProductType type;

    private Long categoryId;

    @NotNull(message = "Provider type is required")
    private ProviderType providerType;

    private String providerProductId;

    @Min(value = 0, message = "Stock cannot be negative")
    private Integer stock;

    private String imageUrl;

    private String brand;

    private String sku;

    private String billingPeriod;

    private Integer durationMinutes;
}
