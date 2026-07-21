package com.coupledinner.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data @Builder
public class MenuItemResponse {
    private UUID id;
    private String name;
    private String description;
    private UserResponse createdBy;
    private LocalDateTime createdAt;
    private List<IngredientResponse> ingredients;
}
