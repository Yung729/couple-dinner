package com.coupledinner.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class IngredientRequest {
    @NotBlank(message = "Ingredient name is required")
    @Size(max = 200)
    private String name;
}
