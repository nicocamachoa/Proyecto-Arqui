package com.allconnect.catalog.service;

import com.allconnect.catalog.client.IntegrationClient;
import com.allconnect.catalog.dto.*;
import com.allconnect.catalog.model.*;
import com.allconnect.catalog.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
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
    private final IntegrationClient integrationClient;

    @Value("${catalog.use-providers:true}")
    private boolean useProviders;

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
        List<ProductResponse> allProducts = new ArrayList<>();

        // First, get products from external providers via integration service
        if (useProviders) {
            try {
                log.info("Fetching products from integration service (external providers)");
                Map<String, Object> integrationResponse = integrationClient.getAllProducts();

                if (integrationResponse != null && integrationResponse.containsKey("products")) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> providerProducts = (List<Map<String, Object>>) integrationResponse.get("products");

                    for (Map<String, Object> p : providerProducts) {
                        ProductResponse productResponse = mapProviderProduct(p);
                        allProducts.add(productResponse);
                    }
                    log.info("Fetched {} products from providers", allProducts.size());
                }
            } catch (Exception e) {
                log.error("Error fetching from integration service: {}", e.getMessage());
                // Fall back to database products
            }
        }

        // Then, add products from local database (if any)
        List<ProductResponse> dbProducts = productRepository.findByActiveTrue().stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());

        // Merge - avoid duplicates based on providerProductId
        for (ProductResponse dbProduct : dbProducts) {
            boolean exists = allProducts.stream()
                    .anyMatch(p -> p.getProviderProductId() != null &&
                            p.getProviderProductId().equals(dbProduct.getProviderProductId()));
            if (!exists) {
                allProducts.add(dbProduct);
            }
        }

        log.info("Total products returned: {} (providers: {}, db: {})",
                allProducts.size(), allProducts.size() - dbProducts.size(), dbProducts.size());
        return allProducts;
    }

    /**
     * Map a product from the integration service (provider) to ProductResponse
     */
    private ProductResponse mapProviderProduct(Map<String, Object> p) {
        // Generate a unique ID for provider products (negative to avoid collision with DB)
        Long id = -1L;
        if (p.get("id") != null) {
            String idStr = p.get("id").toString();
            // Extract numeric part: PROD001 -> 1001, SVC001 -> 2001, SUB001 -> 3001
            String numericPart = idStr.replaceAll("[^0-9]", "");
            if (!numericPart.isEmpty()) {
                int num = Integer.parseInt(numericPart);
                if (idStr.startsWith("PROD")) id = 10000L + num;
                else if (idStr.startsWith("SVC")) id = 20000L + num;
                else if (idStr.startsWith("SUB")) id = 30000L + num;
                else id = (long) num;
            }
        }

        // Determine ProductType from providerType or productType field
        ProductType productType = ProductType.PHYSICAL;
        String typeStr = p.get("productType") != null ? p.get("productType").toString() : null;
        if ("SERVICE".equals(typeStr)) productType = ProductType.SERVICE;
        else if ("DIGITAL".equals(typeStr) || "SUBSCRIPTION".equals(typeStr)) productType = ProductType.SUBSCRIPTION;

        // Determine ProviderType
        ProviderType providerType = ProviderType.REST;
        String providerStr = p.get("providerType") != null ? p.get("providerType").toString() : "REST";
        if ("SOAP".equals(providerStr)) providerType = ProviderType.SOAP;
        else if ("GRPC".equals(providerStr)) providerType = ProviderType.GRPC;

        // Get price
        BigDecimal price = BigDecimal.ZERO;
        if (p.get("price") != null) {
            price = new BigDecimal(p.get("price").toString());
        }

        // Get stock
        Integer stock = 999;
        if (p.get("stock") != null) {
            stock = ((Number) p.get("stock")).intValue();
        }

        // Generate image URL if example.com or missing
        String imageUrl = p.get("imageUrl") != null ? p.get("imageUrl").toString() : null;
        if (imageUrl == null || imageUrl.contains("example.com")) {
            String name = p.get("name") != null ? p.get("name").toString() : "Product";
            // Take first 15 chars, remove special chars, replace spaces
            String encodedName = name.length() > 15 ? name.substring(0, 15) : name;
            encodedName = encodedName.replaceAll("[^a-zA-Z0-9 ]", "").replace(" ", "+");
            if (encodedName.isEmpty()) encodedName = "Product";
            String[] colors = {"6366f1", "8b5cf6", "ec4899", "f59e0b", "10b981", "3b82f6"};
            String color = colors[(int) (Math.abs(id) % colors.length)];
            imageUrl = String.format("https://placehold.co/400x400/%s/ffffff?text=%s", color, encodedName);
        }

        return ProductResponse.builder()
                .id(id)
                .name(p.get("name") != null ? p.get("name").toString() : "Unknown")
                .description(p.get("description") != null ? p.get("description").toString() : "")
                .price(price)
                .type(productType)
                .categoryId(null)
                .categoryName(p.get("category") != null ? p.get("category").toString() : null)
                .providerType(providerType)
                .providerProductId(p.get("id") != null ? p.get("id").toString() : null)
                .stock(stock)
                .imageUrl(imageUrl)
                .brand(p.get("providerName") != null ? p.get("providerName").toString() : null)
                .sku(p.get("id") != null ? p.get("id").toString() : null)
                .billingPeriod(null)
                .durationMinutes(p.get("durationMinutes") != null ? ((Number) p.get("durationMinutes")).intValue() : null)
                .active(true)
                .createdAt(null)
                .updatedAt(null)
                .build();
    }

    public ProductResponse getProductById(Long id) {
        // Search in all products (providers + DB)
        List<ProductResponse> allProducts = getAllProducts();
        return allProducts.stream()
                .filter(p -> p.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
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
