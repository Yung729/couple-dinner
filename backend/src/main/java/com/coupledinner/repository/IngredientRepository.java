package com.coupledinner.repository;

import com.coupledinner.entity.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface IngredientRepository extends JpaRepository<Ingredient, UUID> {
    Optional<Ingredient> findByNameIgnoreCase(String name);
}
