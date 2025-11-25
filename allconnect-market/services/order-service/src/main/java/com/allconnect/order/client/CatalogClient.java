package com.allconnect.order.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@FeignClient(name = "catalog-service", url = "${catalog.service.url:http://localhost:8092}")
public interface CatalogClient {

    @GetMapping("/api/catalog/products/{id}")
    Map<String, Object> getProduct(@PathVariable Long id);

    @PutMapping("/api/catalog/products/{id}/stock")
    Map<String, Object> updateStock(@PathVariable Long id, @RequestBody Map<String, Object> request);
}
