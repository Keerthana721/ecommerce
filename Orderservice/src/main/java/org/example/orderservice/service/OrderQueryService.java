package org.example.orderservice.service;

import lombok.extern.slf4j.Slf4j;
import org.example.orderservice.common.OrderStatus;
import org.example.orderservice.model.Order;
import org.example.orderservice.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Slf4j
public class OrderQueryService {

    @Autowired
    private OrderRepository orderRepository;

    public Order getOrderById(Long orderId) {
        log.info("Querying order by ID: {}", orderId);
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public List<Order> getOrdersByUserId(Long userId) {
        log.info("Querying orders for user: {}", userId);
        return orderRepository.findByUserId(userId);
    }

    public List<Order> getOrdersByStatus(OrderStatus status) {
        log.info("Querying orders with status: {}", status);
        return orderRepository.findByStatus(status);
    }

    public List<Order> getAllOrders() {
        log.info("Querying all orders");
        return orderRepository.findAll();
    }
}
