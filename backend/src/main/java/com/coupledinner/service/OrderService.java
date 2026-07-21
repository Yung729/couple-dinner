package com.coupledinner.service;

import com.coupledinner.dto.request.OrderRequest;
import com.coupledinner.dto.request.OrderStatusRequest;
import com.coupledinner.dto.response.MenuItemResponse;
import com.coupledinner.dto.response.OrderResponse;
import com.coupledinner.dto.response.UserResponse;
import com.coupledinner.entity.MenuItem;
import com.coupledinner.entity.Order;
import com.coupledinner.entity.OrderStatus;
import com.coupledinner.entity.User;
import com.coupledinner.event.SseEvent;
import com.coupledinner.exception.BadRequestException;
import com.coupledinner.exception.ResourceNotFoundException;
import com.coupledinner.repository.MenuItemRepository;
import com.coupledinner.repository.OrderRepository;
import com.coupledinner.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final MenuItemRepository menuItemRepository;
    private final UserRepository userRepository;
    private final SseEmitterManager sseEmitterManager;
    private final MenuItemService menuItemService;

    public List<OrderResponse> getUpcomingOrders() {
        return orderRepository.findUpcomingOrders().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllWithDetails().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest request, UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        MenuItem menuItem = menuItemRepository.findById(request.getMenuItemId())
            .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));

        if (request.getScheduledTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Scheduled time must be in the future");
        }

        Order order = Order.builder()
            .menuItem(menuItem)
            .scheduledTime(request.getScheduledTime())
            .status(OrderStatus.PLANNED)
            .requestedBy(user)
            .build();
        orderRepository.save(order);

        OrderResponse response = toResponse(order);
        sseEmitterManager.broadcast(SseEvent.builder().type("ORDER_CREATED").payload(response).build());
        return response;
    }

    @Transactional
    public OrderResponse updateStatus(UUID orderId, OrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Cannot update a cancelled order");
        }

        order.setStatus(request.getStatus());
        orderRepository.save(order);

        OrderResponse response = toResponse(order);
        sseEmitterManager.broadcast(SseEvent.builder().type("ORDER_UPDATED").payload(response).build());
        return response;
    }

    @Transactional
    public void cancelOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        sseEmitterManager.broadcast(SseEvent.builder().type("ORDER_CANCELLED").payload(orderId).build());
    }

    private OrderResponse toResponse(Order order) {
        UserResponse requestedByResponse = order.getRequestedBy() != null ? UserResponse.builder()
            .id(order.getRequestedBy().getId())
            .name(order.getRequestedBy().getName())
            .email(order.getRequestedBy().getEmail())
            .createdAt(order.getRequestedBy().getCreatedAt())
            .build() : null;

        MenuItemResponse menuItemResponse = order.getMenuItem() != null
            ? menuItemService.toResponse(order.getMenuItem())
            : null;

        return OrderResponse.builder()
            .id(order.getId())
            .menuItem(menuItemResponse)
            .scheduledTime(order.getScheduledTime())
            .status(order.getStatus())
            .requestedBy(requestedByResponse)
            .createdAt(order.getCreatedAt())
            .build();
    }
}
