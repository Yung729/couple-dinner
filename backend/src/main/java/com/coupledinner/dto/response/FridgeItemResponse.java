package com.coupledinner.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder
public class FridgeItemResponse {
    private UUID id;
    private String ingredientName;
    private BigDecimal quantity;
    private String unit;
    private UserResponse addedBy;
    private LocalDateTime updatedAt;
}
