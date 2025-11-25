package com.allconnect.recommendation.dto;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationResponse {

    private Long userId;
    private String type;
    private List<ProductRecommendation> products;
    private Integer totalCount;
}
