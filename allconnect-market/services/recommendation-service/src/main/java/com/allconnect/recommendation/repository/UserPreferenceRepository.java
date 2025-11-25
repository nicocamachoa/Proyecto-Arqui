package com.allconnect.recommendation.repository;

import com.allconnect.recommendation.model.UserPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserPreferenceRepository extends JpaRepository<UserPreference, Long> {

    List<UserPreference> findByUserId(Long userId);

    List<UserPreference> findByUserIdOrderByWeightDesc(Long userId);

    Optional<UserPreference> findByUserIdAndCategoryId(Long userId, Long categoryId);

    @Query("SELECT up.categoryId FROM UserPreference up WHERE up.userId = :userId ORDER BY up.weight DESC")
    List<Long> findTopCategoriesByUserId(@Param("userId") Long userId);
}
