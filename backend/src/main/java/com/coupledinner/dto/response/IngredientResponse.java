package com.coupledinner.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data @Builder
public class IngredientResponse {
    private UUID id;
    private String name;
}
