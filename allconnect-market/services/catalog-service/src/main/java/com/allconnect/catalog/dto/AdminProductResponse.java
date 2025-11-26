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
public class AdminProductResponse {
    private Long id;
    private String sku;
    private String name;
    private String description;
    private BigDecimal price;
    private ProductType productType;
    private Long categoryId;
    private String categoryName;
    private ProviderType providerType;
    private Integer stock;
    private Integer lowStockThreshold;
    private String imageUrl;
    private Boolean isActive;
    private Boolean isFeatured;
    private Double ratingAverage;
    private Integer ratingCount;
    private LocalDateTime createdAt;
}
