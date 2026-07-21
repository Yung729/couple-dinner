package com.coupledinner.repository;

import com.coupledinner.entity.Order;
import com.coupledinner.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.menuItem LEFT JOIN FETCH o.requestedBy WHERE o.status != 'CANCELLED' ORDER BY o.scheduledTime ASC")
    List<Order> findUpcomingOrders();

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.menuItem LEFT JOIN FETCH o.requestedBy ORDER BY o.scheduledTime ASC")
    List<Order> findAllWithDetails();
}
