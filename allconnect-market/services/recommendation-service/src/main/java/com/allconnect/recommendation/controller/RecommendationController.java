package com.allconnect.recommendation.controller;

import com.allconnect.recommendation.dto.RecommendationResponse;
import com.allconnect.recommendation.service.RecommendationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
@Tag(name = "Recommendations", description = "Product Recommendation APIs")
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get personalized recommendations for user")
    public ResponseEntity<RecommendationResponse> getPersonalizedRecommendations(@PathVariable Long userId) {
        return ResponseEntity.ok(recommendationService.getPersonalizedRecommendations(userId));
    }

    @GetMapping("/product/{productId}/related")
    @Operation(summary = "Get related products")
    public ResponseEntity<RecommendationResponse> getRelatedProducts(@PathVariable Long productId) {
        return ResponseEntity.ok(recommendationService.getRelatedProducts(productId));
    }

    @GetMapping("/trending")
    @Operation(summary = "Get trending products")
    public ResponseEntity<RecommendationResponse> getTrendingProducts() {
        return ResponseEntity.ok(recommendationService.getTrendingProducts());
    }

    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Get recommendations by category")
    public ResponseEntity<RecommendationResponse> getRecommendationsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(recommendationService.getRecommendationsByCategory(categoryId));
    }

    @PostMapping("/view")
    @Operation(summary = "Record product view for recommendations")
    public ResponseEntity<Void> recordProductView(
            @RequestParam Long userId,
            @RequestParam Long productId,
            @RequestParam(required = false) Long categoryId) {
        recommendationService.recordProductView(userId, productId, categoryId);
        return ResponseEntity.ok().build();
    }
}
