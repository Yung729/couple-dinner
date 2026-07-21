package com.coupledinner.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class FridgeItemRequest {
    @NotBlank(message = "Ingredient name is required")
    @Size(max = 200)
    private String ingredientName;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Quantity must be greater than 0")
    private BigDecimal quantity;

    @Size(max = 50)
    private String unit;
}
