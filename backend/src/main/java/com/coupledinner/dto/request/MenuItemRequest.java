package com.coupledinner.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

@Data
public class MenuItemRequest {
    @NotBlank(message = "Name is required")
    @Size(max = 200)
    private String name;

    private String description;

    private List<String> ingredients;
}
