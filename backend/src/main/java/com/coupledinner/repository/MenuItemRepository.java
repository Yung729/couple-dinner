package com.coupledinner.repository;

import com.coupledinner.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;

public interface MenuItemRepository extends JpaRepository<MenuItem, UUID> {

    @Query("SELECT DISTINCT m FROM MenuItem m JOIN m.ingredients i WHERE LOWER(i.name) LIKE LOWER(CONCAT('%', :ingredient, '%'))")
    List<MenuItem> findByIngredientName(@Param("ingredient") String ingredient);

    @Query("SELECT m FROM MenuItem m LEFT JOIN FETCH m.ingredients LEFT JOIN FETCH m.createdBy")
    List<MenuItem> findAllWithDetails();
}
