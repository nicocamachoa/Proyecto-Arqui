package com.allconnect.recommendation.repository;

import com.allconnect.recommendation.model.ProductView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductViewRepository extends JpaRepository<ProductView, Long> {

    List<ProductView> findByUserId(Long userId);

    List<ProductView> findByUserIdOrderByViewedAtDesc(Long userId);

    @Query("SELECT pv.productId, COUNT(pv) as viewCount FROM ProductView pv GROUP BY pv.productId ORDER BY viewCount DESC")
    List<Object[]> findMostViewedProducts();

    @Query("SELECT pv.productId FROM ProductView pv WHERE pv.userId = :userId ORDER BY pv.viewedAt DESC")
    List<Long> findRecentlyViewedProductIds(@Param("userId") Long userId);

    @Query("SELECT pv.categoryId, COUNT(pv) as count FROM ProductView pv WHERE pv.userId = :userId GROUP BY pv.categoryId ORDER BY count DESC")
    List<Object[]> findTopCategoriesByViews(@Param("userId") Long userId);
}
