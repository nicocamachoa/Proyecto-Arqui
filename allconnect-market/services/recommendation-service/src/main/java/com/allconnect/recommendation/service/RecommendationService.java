package com.allconnect.recommendation.service;

import com.allconnect.recommendation.client.CatalogClient;
import com.allconnect.recommendation.dto.ProductRecommendation;
import com.allconnect.recommendation.dto.RecommendationResponse;
import com.allconnect.recommendation.model.ProductView;
import com.allconnect.recommendation.model.UserPreference;
import com.allconnect.recommendation.repository.ProductViewRepository;
import com.allconnect.recommendation.repository.UserPreferenceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {

    private final UserPreferenceRepository userPreferenceRepository;
    private final ProductViewRepository productViewRepository;
    private final CatalogClient catalogClient;

    private static final int DEFAULT_LIMIT = 10;

    public RecommendationResponse getPersonalizedRecommendations(Long userId) {
        log.info("Getting personalized recommendations for user: {}", userId);

        List<ProductRecommendation> recommendations = new ArrayList<>();

        try {
            // Get user preferences
            List<UserPreference> preferences = userPreferenceRepository.findByUserIdOrderByWeightDesc(userId);

            if (!preferences.isEmpty()) {
                // Get products from preferred categories
                for (UserPreference pref : preferences.subList(0, Math.min(3, preferences.size()))) {
                    List<Map<String, Object>> products = catalogClient.getProductsByCategory(pref.getCategoryId());
                    for (Map<String, Object> product : products) {
                        ProductRecommendation rec = mapToRecommendation(product, pref.getWeight(), "Based on your preferences");
                        if (!containsProduct(recommendations, rec.getProductId())) {
                            recommendations.add(rec);
                        }
                    }
                }
            }

            // If not enough recommendations, add trending products
            if (recommendations.size() < DEFAULT_LIMIT) {
                List<ProductRecommendation> trending = getTrendingProducts().getProducts();
                for (ProductRecommendation rec : trending) {
                    if (!containsProduct(recommendations, rec.getProductId())) {
                        recommendations.add(rec);
                        if (recommendations.size() >= DEFAULT_LIMIT) break;
                    }
                }
            }

        } catch (Exception e) {
            log.warn("Error getting catalog data, using fallback: {}", e.getMessage());
            recommendations = getMockRecommendations("personalized");
        }

        // Sort by score and limit
        recommendations.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));
        recommendations = recommendations.stream().limit(DEFAULT_LIMIT).collect(Collectors.toList());

        return RecommendationResponse.builder()
                .userId(userId)
                .type("PERSONALIZED")
                .products(recommendations)
                .totalCount(recommendations.size())
                .build();
    }

    public RecommendationResponse getRelatedProducts(Long productId) {
        log.info("Getting related products for product: {}", productId);

        List<ProductRecommendation> recommendations = new ArrayList<>();

        try {
            Map<String, Object> product = catalogClient.getProduct(productId);
            Long categoryId = getLongValue(product.get("categoryId"));

            if (categoryId != null) {
                List<Map<String, Object>> products = catalogClient.getProductsByCategory(categoryId);
                for (Map<String, Object> p : products) {
                    Long pId = getLongValue(p.get("id"));
                    if (!pId.equals(productId)) {
                        ProductRecommendation rec = mapToRecommendation(p, 0.8, "Similar product");
                        recommendations.add(rec);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Error getting related products, using fallback: {}", e.getMessage());
            recommendations = getMockRecommendations("related");
        }

        recommendations = recommendations.stream().limit(DEFAULT_LIMIT).collect(Collectors.toList());

        return RecommendationResponse.builder()
                .type("RELATED")
                .products(recommendations)
                .totalCount(recommendations.size())
                .build();
    }

    public RecommendationResponse getTrendingProducts() {
        log.info("Getting trending products");

        List<ProductRecommendation> recommendations = new ArrayList<>();

        try {
            List<Map<String, Object>> allProducts = catalogClient.getAllProducts();

            // Shuffle and pick random products as "trending"
            Collections.shuffle(allProducts);
            for (Map<String, Object> product : allProducts.subList(0, Math.min(DEFAULT_LIMIT, allProducts.size()))) {
                ProductRecommendation rec = mapToRecommendation(product, Math.random() * 0.3 + 0.7, "Trending");
                recommendations.add(rec);
            }
        } catch (Exception e) {
            log.warn("Error getting trending products, using fallback: {}", e.getMessage());
            recommendations = getMockRecommendations("trending");
        }

        recommendations.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));

        return RecommendationResponse.builder()
                .type("TRENDING")
                .products(recommendations)
                .totalCount(recommendations.size())
                .build();
    }

    public RecommendationResponse getRecommendationsByCategory(Long categoryId) {
        log.info("Getting recommendations for category: {}", categoryId);

        List<ProductRecommendation> recommendations = new ArrayList<>();

        try {
            List<Map<String, Object>> products = catalogClient.getProductsByCategory(categoryId);
            for (Map<String, Object> product : products) {
                ProductRecommendation rec = mapToRecommendation(product, Math.random() * 0.3 + 0.6, "Category recommendation");
                recommendations.add(rec);
            }
        } catch (Exception e) {
            log.warn("Error getting category recommendations, using fallback: {}", e.getMessage());
            recommendations = getMockRecommendations("category");
        }

        recommendations.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));
        recommendations = recommendations.stream().limit(DEFAULT_LIMIT).collect(Collectors.toList());

        return RecommendationResponse.builder()
                .type("CATEGORY")
                .products(recommendations)
                .totalCount(recommendations.size())
                .build();
    }

    @Transactional
    public void recordProductView(Long userId, Long productId, Long categoryId) {
        log.info("Recording product view: user={}, product={}", userId, productId);

        ProductView view = ProductView.builder()
                .userId(userId)
                .productId(productId)
                .categoryId(categoryId)
                .build();
        productViewRepository.save(view);

        // Update user preferences
        if (categoryId != null) {
            UserPreference pref = userPreferenceRepository.findByUserIdAndCategoryId(userId, categoryId)
                    .orElse(UserPreference.builder()
                            .userId(userId)
                            .categoryId(categoryId)
                            .weight(0.0)
                            .viewCount(0)
                            .purchaseCount(0)
                            .build());

            pref.setViewCount(pref.getViewCount() + 1);
            pref.setWeight(calculateWeight(pref.getViewCount(), pref.getPurchaseCount()));
            userPreferenceRepository.save(pref);
        }
    }

    @Transactional
    public void recordPurchase(Long userId, Long categoryId) {
        if (categoryId != null) {
            UserPreference pref = userPreferenceRepository.findByUserIdAndCategoryId(userId, categoryId)
                    .orElse(UserPreference.builder()
                            .userId(userId)
                            .categoryId(categoryId)
                            .weight(0.0)
                            .viewCount(0)
                            .purchaseCount(0)
                            .build());

            pref.setPurchaseCount(pref.getPurchaseCount() + 1);
            pref.setWeight(calculateWeight(pref.getViewCount(), pref.getPurchaseCount()));
            userPreferenceRepository.save(pref);
        }
    }

    private double calculateWeight(int viewCount, int purchaseCount) {
        // Purchases are weighted more heavily than views
        return (viewCount * 0.1) + (purchaseCount * 0.5);
    }

    private ProductRecommendation mapToRecommendation(Map<String, Object> product, Double score, String reason) {
        return ProductRecommendation.builder()
                .productId(getLongValue(product.get("id")))
                .name((String) product.get("name"))
                .description((String) product.get("description"))
                .price(getBigDecimalValue(product.get("price")))
                .imageUrl((String) product.get("imageUrl"))
                .type((String) product.get("type"))
                .categoryId(getLongValue(product.get("categoryId")))
                .categoryName((String) product.get("categoryName"))
                .score(score)
                .reason(reason)
                .build();
    }

    private boolean containsProduct(List<ProductRecommendation> list, Long productId) {
        return list.stream().anyMatch(r -> r.getProductId().equals(productId));
    }

    private List<ProductRecommendation> getMockRecommendations(String type) {
        List<ProductRecommendation> mock = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            mock.add(ProductRecommendation.builder()
                    .productId((long) i)
                    .name("Producto Recomendado " + i)
                    .description("Descripción del producto " + i)
                    .price(BigDecimal.valueOf(50000 + (i * 10000)))
                    .imageUrl("https://example.com/product" + i + ".jpg")
                    .type("PHYSICAL")
                    .categoryId(1L)
                    .score(0.9 - (i * 0.1))
                    .reason("Mock recommendation - " + type)
                    .build());
        }
        return mock;
    }

    private Long getLongValue(Object value) {
        if (value == null) return null;
        if (value instanceof Long) return (Long) value;
        if (value instanceof Integer) return ((Integer) value).longValue();
        if (value instanceof Number) return ((Number) value).longValue();
        return Long.parseLong(value.toString());
    }

    private BigDecimal getBigDecimalValue(Object value) {
        if (value == null) return BigDecimal.ZERO;
        if (value instanceof BigDecimal) return (BigDecimal) value;
        if (value instanceof Number) return BigDecimal.valueOf(((Number) value).doubleValue());
        return new BigDecimal(value.toString());
    }
}
