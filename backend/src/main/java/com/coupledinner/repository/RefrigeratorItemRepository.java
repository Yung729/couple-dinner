package com.coupledinner.repository;

import com.coupledinner.entity.RefrigeratorItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RefrigeratorItemRepository extends JpaRepository<RefrigeratorItem, UUID> {

    @Query("SELECT r FROM RefrigeratorItem r LEFT JOIN FETCH r.addedBy ORDER BY r.ingredientName ASC")
    List<RefrigeratorItem> findAllWithDetails();

    Optional<RefrigeratorItem> findByIngredientNameIgnoreCase(String ingredientName);
}
