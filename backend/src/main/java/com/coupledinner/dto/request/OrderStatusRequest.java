package com.coupledinner.dto.request;

import com.coupledinner.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderStatusRequest {
    @NotNull(message = "Status is required")
    private OrderStatus status;
}
