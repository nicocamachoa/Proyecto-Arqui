package com.allconnect.catalog.repository;

import com.allconnect.catalog.model.Product;
import com.allconnect.catalog.model.ProductType;
import com.allconnect.catalog.model.ProviderType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByActiveTrue();

    List<Product> findByType(ProductType type);

    List<Product> findByCategoryId(Long categoryId);

    List<Product> findByProviderType(ProviderType providerType);

    Optional<Product> findBySku(String sku);

    @Query("SELECT p FROM Product p WHERE p.active = true " +
            "AND (:categoryId IS NULL OR p.categoryId = :categoryId) " +
            "AND (:type IS NULL OR p.type = :type) " +
            "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
            "AND (:maxPrice IS NULL OR p.price <= :maxPrice) " +
            "AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "     OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> findByFilters(
            @Param("categoryId") Long categoryId,
            @Param("type") ProductType type,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND p.stock > 0")
    List<Product> findAvailableProducts();

    @Query("SELECT p FROM Product p WHERE p.active = true AND p.stock < :threshold")
    List<Product> findLowStockProducts(@Param("threshold") Integer threshold);
}
