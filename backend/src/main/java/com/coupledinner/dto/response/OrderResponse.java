package com.coupledinner.dto.response;

import com.coupledinner.entity.OrderStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder
public class OrderResponse {
    private UUID id;
    private MenuItemResponse menuItem;
    private LocalDateTime scheduledTime;
    private OrderStatus status;
    private UserResponse requestedBy;
    private LocalDateTime createdAt;
}
