package com.allconnect.recommendation.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRecommendation {

    private Long productId;
    private String name;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private String type;
    private Long categoryId;
    private String categoryName;
    private Double score;
    private String reason;
}
