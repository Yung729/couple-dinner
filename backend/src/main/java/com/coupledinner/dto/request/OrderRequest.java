package com.coupledinner.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class OrderRequest {
    @NotNull(message = "Menu item ID is required")
    private java.util.UUID menuItemId;

    @NotNull(message = "Scheduled time is required")
    @Future(message = "Scheduled time must be in the future")
    private LocalDateTime scheduledTime;
}
