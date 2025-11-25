package com.allconnect.catalog.service;

import com.allconnect.catalog.dto.*;
import com.allconnect.catalog.model.*;
import com.allconnect.catalog.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CatalogService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    // Product operations
    public Page<ProductResponse> getProducts(Long categoryId, ProductType type,
                                              BigDecimal minPrice, BigDecimal maxPrice,
                                              String search, int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).descending());
        Page<Product> products = productRepository.findByFilters(
                categoryId, type, minPrice, maxPrice, search, pageable);
        return products.map(this::mapToProductResponse);
    }

    public List<ProductResponse> getAllProducts() {
        return productRepository.findByActiveTrue().stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return mapToProductResponse(product);
    }

    public List<ProductResponse> getProductsByType(ProductType type) {
        return productRepository.findByType(type).stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId).stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .type(request.getType())
                .categoryId(request.getCategoryId())
                .providerType(request.getProviderType())
                .providerProductId(request.getProviderProductId())
                .stock(request.getStock() != null ? request.getStock() : 0)
                .imageUrl(request.getImageUrl())
                .brand(request.getBrand())
                .sku(request.getSku())
                .billingPeriod(request.getBillingPeriod())
                .durationMinutes(request.getDurationMinutes())
                .active(true)
                .build();

        product = productRepository.save(product);
        log.info("Product created: {}", product.getName());

        publishCatalogEvent("product.created", product);
        return mapToProductResponse(product);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setType(request.getType());
        product.setCategoryId(request.getCategoryId());
        product.setProviderType(request.getProviderType());
        product.setProviderProductId(request.getProviderProductId());
        product.setStock(request.getStock());
        product.setImageUrl(request.getImageUrl());
        product.setBrand(request.getBrand());
        product.setSku(request.getSku());
        product.setBillingPeriod(request.getBillingPeriod());
        product.setDurationMinutes(request.getDurationMinutes());

        product = productRepository.save(product);
        log.info("Product updated: {}", product.getName());

        publishCatalogEvent("product.updated", product);
        return mapToProductResponse(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setActive(false);
        productRepository.save(product);
        log.info("Product deactivated: {}", product.getName());

        publishCatalogEvent("product.deleted", product);
    }

    @Transactional
    public ProductResponse updateStock(Long id, StockUpdateRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        int newStock;
        String operation = request.getOperation() != null ? request.getOperation() : "SET";

        switch (operation.toUpperCase()) {
            case "ADD":
                newStock = product.getStock() + request.getQuantity();
                break;
            case "SUBTRACT":
                newStock = product.getStock() - request.getQuantity();
                if (newStock < 0) {
                    throw new RuntimeException("Insufficient stock");
                }
                break;
            case "SET":
            default:
                newStock = request.getQuantity();
                break;
        }

        product.setStock(newStock);
        product = productRepository.save(product);
        log.info("Stock updated for product {}: {} ({})", product.getName(), newStock, operation);

        publishStockEvent(product);
        return mapToProductResponse(product);
    }

    // Category operations
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findByActiveTrue().stream()
                .map(this::mapToCategoryResponse)
                .collect(Collectors.toList());
    }

    public List<CategoryResponse> getRootCategories() {
        return categoryRepository.findByParentIdIsNull().stream()
                .map(this::mapToCategoryResponse)
                .collect(Collectors.toList());
    }

    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        return mapToCategoryResponse(category);
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .parentId(request.getParentId())
                .active(true)
                .build();

        category = categoryRepository.save(category);
        log.info("Category created: {}", category.getName());

        return mapToCategoryResponse(category);
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());
        category.setParentId(request.getParentId());

        category = categoryRepository.save(category);
        log.info("Category updated: {}", category.getName());

        return mapToCategoryResponse(category);
    }

    // Mappers
    private ProductResponse mapToProductResponse(Product product) {
        String categoryName = null;
        if (product.getCategoryId() != null) {
            categoryName = categoryRepository.findById(product.getCategoryId())
                    .map(Category::getName)
                    .orElse(null);
        }

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .type(product.getType())
                .categoryId(product.getCategoryId())
                .categoryName(categoryName)
                .providerType(product.getProviderType())
                .providerProductId(product.getProviderProductId())
                .stock(product.getStock())
                .imageUrl(product.getImageUrl())
                .brand(product.getBrand())
                .sku(product.getSku())
                .billingPeriod(product.getBillingPeriod())
                .durationMinutes(product.getDurationMinutes())
                .active(product.getActive())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    private CategoryResponse mapToCategoryResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .parentId(category.getParentId())
                .active(category.getActive())
                .createdAt(category.getCreatedAt())
                .build();
    }

    private void publishCatalogEvent(String eventType, Product product) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("eventType", eventType);
            event.put("productId", product.getId());
            event.put("name", product.getName());
            event.put("type", product.getType().name());
            event.put("price", product.getPrice());
            event.put("timestamp", System.currentTimeMillis());

            kafkaTemplate.send("catalog-events", event);
            log.info("Published event: {} for product: {}", eventType, product.getId());
        } catch (Exception e) {
            log.warn("Failed to publish Kafka event: {}", e.getMessage());
        }
    }

    private void publishStockEvent(Product product) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("eventType", "stock.updated");
            event.put("productId", product.getId());
            event.put("stock", product.getStock());
            event.put("timestamp", System.currentTimeMillis());

            kafkaTemplate.send("inventory-events", event);
            log.info("Published stock event for product: {}", product.getId());
        } catch (Exception e) {
            log.warn("Failed to publish Kafka event: {}", e.getMessage());
        }
    }
}
