package com.allconnect.recommendation.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Map;

@FeignClient(name = "catalog-service", url = "${catalog.service.url:http://localhost:8092}")
public interface CatalogClient {

    @GetMapping("/api/catalog/products/all")
    List<Map<String, Object>> getAllProducts();

    @GetMapping("/api/catalog/products/{id}")
    Map<String, Object> getProduct(@PathVariable Long id);

    @GetMapping("/api/catalog/products/category/{categoryId}")
    List<Map<String, Object>> getProductsByCategory(@PathVariable Long categoryId);

    @GetMapping("/api/catalog/categories")
    List<Map<String, Object>> getAllCategories();
}
