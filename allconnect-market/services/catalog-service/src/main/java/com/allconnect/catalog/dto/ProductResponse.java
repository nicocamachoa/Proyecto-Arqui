package com.allconnect.catalog.dto;

import com.allconnect.catalog.model.ProductType;
import com.allconnect.catalog.model.ProviderType;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private ProductType type;
    private Long categoryId;
    private String categoryName;
    private ProviderType providerType;
    private String providerProductId;
    private Integer stock;
    private String imageUrl;
    private String brand;
    private String sku;
    private String billingPeriod;
    private Integer durationMinutes;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
