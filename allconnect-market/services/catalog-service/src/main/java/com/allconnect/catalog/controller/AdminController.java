package com.allconnect.catalog.controller;

import com.allconnect.catalog.dto.*;
import com.allconnect.catalog.model.*;
import com.allconnect.catalog.repository.*;
import com.allconnect.catalog.service.CatalogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin Catalog APIs")
@Slf4j
public class AdminController {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final CatalogService catalogService;

    private static final int DEFAULT_LOW_STOCK_THRESHOLD = 10;

    // ============= Product Admin Endpoints =============

    @GetMapping("/products")
    @Operation(summary = "Get all products for admin (including inactive)")
    public ResponseEntity<List<AdminProductResponse>> getAllProducts() {
        List<Product> products = productRepository.findAll();

        List<AdminProductResponse> response = products.stream()
                .map(this::mapToAdminProductResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/catalog/products")
    @Operation(summary = "Get all products for catalog admin")
    public ResponseEntity<List<AdminProductResponse>> getCatalogProducts() {
        return getAllProducts();
    }

    @PostMapping("/catalog/products")
    @Operation(summary = "Create a new product")
    public ResponseEntity<AdminProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        ProductResponse created = catalogService.createProduct(request);
        Product product = productRepository.findById(created.getId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return ResponseEntity.ok(mapToAdminProductResponse(product));
    }

    @PutMapping("/catalog/products/{id}")
    @Operation(summary = "Update a product")
    public ResponseEntity<AdminProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        catalogService.updateProduct(id, request);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return ResponseEntity.ok(mapToAdminProductResponse(product));
    }

    @DeleteMapping("/catalog/products/{id}")
    @Operation(summary = "Delete a product")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        catalogService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/catalog/products/{id}/status")
    @Operation(summary = "Toggle product active status")
    public ResponseEntity<AdminProductResponse> toggleProductStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Boolean isActive = body.get("isActive");
        if (isActive != null) {
            product.setActive(isActive);
            productRepository.save(product);
        }

        return ResponseEntity.ok(mapToAdminProductResponse(product));
    }

    @PatchMapping("/catalog/products/{id}/featured")
    @Operation(summary = "Toggle product featured status")
    public ResponseEntity<AdminProductResponse> toggleProductFeatured(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Note: Product model doesn't have 'featured' field
        // This endpoint exists for API compatibility but won't persist the value
        log.info("Toggle featured for product {}: {}", id, body.get("isFeatured"));

        return ResponseEntity.ok(mapToAdminProductResponse(product));
    }

    // ============= Operations/Inventory Endpoints =============

    @GetMapping("/operations/inventory/low-stock")
    @Operation(summary = "Get low stock products")
    public ResponseEntity<List<AdminProductResponse>> getLowStockProducts() {
        List<Product> lowStock = productRepository.findLowStockProducts(DEFAULT_LOW_STOCK_THRESHOLD);

        List<AdminProductResponse> response = lowStock.stream()
                .map(this::mapToAdminProductResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/operations/inventory/{productId}/stock")
    @Operation(summary = "Update product stock")
    public ResponseEntity<AdminProductResponse> updateStock(
            @PathVariable Long productId,
            @RequestBody Map<String, Integer> body) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Integer stock = body.get("stock");
        if (stock != null) {
            product.setStock(stock);
            productRepository.save(product);
            log.info("Updated stock for product {}: {}", productId, stock);
        }

        return ResponseEntity.ok(mapToAdminProductResponse(product));
    }

    // ============= Content Admin Endpoints =============

    @GetMapping("/content/items")
    @Operation(summary = "Get content items (promotions, banners)")
    public ResponseEntity<List<Map<String, Object>>> getContentItems() {
        // Content items could be stored in a separate table or service
        // For now, return empty list - this would need a proper implementation
        return ResponseEntity.ok(List.of());
    }

    @PutMapping("/content/items/{id}")
    @Operation(summary = "Update content item")
    public ResponseEntity<Map<String, Object>> updateContentItem(
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        // Placeholder - would need proper implementation
        return ResponseEntity.ok(body);
    }

    // ============= Helpers =============

    private AdminProductResponse mapToAdminProductResponse(Product product) {
        String categoryName = null;
        if (product.getCategoryId() != null) {
            categoryName = categoryRepository.findById(product.getCategoryId())
                    .map(Category::getName)
                    .orElse(null);
        }

        return AdminProductResponse.builder()
                .id(product.getId())
                .sku(product.getSku())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .productType(product.getType())
                .categoryId(product.getCategoryId())
                .categoryName(categoryName)
                .providerType(product.getProviderType())
                .stock(product.getStock())
                .lowStockThreshold(DEFAULT_LOW_STOCK_THRESHOLD)
                .imageUrl(product.getImageUrl())
                .isActive(product.getActive())
                .isFeatured(false) // Not stored in model, default to false
                .ratingAverage(0.0) // Not stored in model
                .ratingCount(0) // Not stored in model
                .createdAt(product.getCreatedAt())
                .build();
    }
}
