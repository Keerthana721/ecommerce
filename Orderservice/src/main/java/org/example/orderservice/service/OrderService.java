package org.example.orderservice.service;


import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.example.orderservice.common.EventType;
import org.example.orderservice.common.OrderStats;
import org.example.orderservice.common.OrderStatus;
import org.example.orderservice.common.PaymentStatus;
import org.example.orderservice.model.*;
import org.example.orderservice.repository.OrderEventRepository;
import org.example.orderservice.repository.OrderItemRepository;
import org.example.orderservice.repository.OrderRepository;
import org.example.orderservice.shareddto.OrderCreateDto;
import org.example.orderservice.shareddto.OrderDTO;
import org.example.orderservice.shareddto.OrderItemDTO;
import org.example.orderservice.shareddto.OrderResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
@Service
@Slf4j
@Transactional
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private OrderEventRepository orderEventRepository;

    @Autowired
    private OrderSagaOrchestrator sagaOrchestrator;

    // ========== CREATE ORDER ==========

    /**
     * API: POST /api/orders
     * Create new order and start saga orchestration
     */
    public Order createOrder(Order order, List<OrderItemDTO> itemDTOs) {
        try {
            log.info("Creating order for user: {}", order.getUserId());

            // Validate order
            if (itemDTOs == null || itemDTOs.isEmpty()) {
                throw new IllegalArgumentException("Order must have at least one item");
            }

            if (order.getTotalAmount() == null || order.getTotalAmount() <= 0) {
                throw new IllegalArgumentException("Order amount must be greater than 0");
            }

            // Create order items
            List<OrderItem> items = itemDTOs.stream()
                    .map(this::convertDtoToItem)
                    .collect(Collectors.toList());

            order.setItems(new java.util.ArrayList<>());
            order.setStatus(OrderStatus.PENDING);
            order.setPaymentStatus(PaymentStatus.PENDING);
            order.setCreatedAt(LocalDateTime.now());
            order.setUpdatedAt(LocalDateTime.now());

            // Save order first to generate the auto-increment ID
            Order savedOrder = orderRepository.save(order);
            log.info("Order entity saved: {}", savedOrder.getId());

            // Map generated orderId to each item and save them
            for (OrderItem item : items) {
                item.setOrderId(savedOrder.getId());
            }
            List<OrderItem> savedItems = orderItemRepository.saveAll(items);

            // Set saved items back to the order in memory
            savedOrder.setItems(savedItems);

            // START SAGA - This will publish events
            sagaOrchestrator.startOrderSaga(savedOrder);

            return savedOrder;

        } catch (Exception e) {
            log.error("Error creating order: {}", e.getMessage());
            throw new RuntimeException("Failed to create order: " + e.getMessage());
        }
    }

    // ========== GET ORDERS ==========

    /**
     * API: GET /api/orders/{orderId}
     * Get single order by ID
     */
    public Order getOrderById(Long orderId) {
        log.info("Fetching order: {}", orderId);

        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
    }

    /**
     * API: GET /api/orders/user/{userId}
     * Get all orders for a user
     */
    public List<Order> getUserOrders(Long userId) {
        log.info("Fetching orders for user: {}", userId);

        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * API: GET /api/orders/status/{status}
     * Get orders by status
     */
    public List<Order> getOrdersByStatus(OrderStatus status) {
        log.info("Fetching orders with status: {}", status);

        return orderRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    /**
     * API: GET /api/orders/user/{userId}/status/{status}
     * Get user orders filtered by status
     */
    public List<Order> getUserOrdersByStatus(Long userId, OrderStatus status) {
        log.info("Fetching user {} orders with status: {}", userId, status);

        return orderRepository.findUserOrdersByStatus(userId, status);
    }

    /**
     * API: GET /api/orders/items/{orderId}
     * Get order items
     */
    public List<OrderItem> getOrderItems(Long orderId) {
        log.info("Fetching items for order: {}", orderId);

        return orderItemRepository.findByOrderId(orderId);
    }

    /**
     * API: GET /api/orders/events/{orderId}
     * Get order event history
     */
    public List<OrderEvent> getOrderHistory(Long orderId) {
        log.info("Fetching history for order: {}", orderId);

        return orderEventRepository.findByOrderIdOrderByCreatedAtDesc(orderId);
    }

    // ========== UPDATE ORDERS ==========

    /**
     * API: PUT /api/orders/{orderId}/status
     * Update order status
     */
    public Order updateOrderStatus(Long orderId, OrderStatus newStatus) {
        log.info("Updating order {} status to: {}", orderId, newStatus);

        Order order = getOrderById(orderId);

        // Validate status transition
        validateStatusTransition(order.getStatus(), newStatus);

        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());

        if (newStatus == OrderStatus.DELIVERED) {
            order.setCompletedAt(LocalDateTime.now());
        }

        Order updated = orderRepository.save(order);
        log.info("Order {} status updated to: {}", orderId, newStatus);

        return updated;
    }

    /**
     * API: PUT /api/orders/{orderId}/payment-status
     * Update payment status
     */
    public Order updatePaymentStatus(Long orderId, PaymentStatus newStatus) {
        log.info("Updating order {} payment status to: {}", orderId, newStatus);

        Order order = getOrderById(orderId);
        order.setPaymentStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());

        return orderRepository.save(order);
    }

    /**
     * API: PUT /api/orders/{orderId}
     * Update order details (address, notes)
     */
    public Order updateOrder(Long orderId, OrderDTO updateDto) {
        log.info("Updating order: {}", orderId);

        Order order = getOrderById(orderId);

        // Only allow updates if order is still pending
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Cannot update order with status: " + order.getStatus());
        }

        if (updateDto.getShippingAddress() != null) {
            order.setShippingAddress(updateDto.getShippingAddress());
        }

        if (updateDto.getBillingAddress() != null) {
            order.setBillingAddress(updateDto.getBillingAddress());
        }

        order.setUpdatedAt(LocalDateTime.now());

        return orderRepository.save(order);
    }

    // ========== CANCEL ORDER ==========

    /**
     * API: DELETE /api/orders/{orderId}
     * Cancel order
     */
    public void cancelOrder(Long orderId) {
        log.info("Cancelling order: {}", orderId);

        Order order = getOrderById(orderId);

        // Can only cancel pending or confirmed orders
        if (order.getStatus() == OrderStatus.SHIPPED
                || order.getStatus() == OrderStatus.DELIVERED
                || order.getStatus() == OrderStatus.CANCELLED) {
            throw new RuntimeException("Cannot cancel order with status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setUpdatedAt(LocalDateTime.now());

        orderRepository.save(order);

        // Create event
        createOrderEvent(orderId, EventType.ORDER_CANCELLED, "Order cancelled by user");

        log.info("Order {} cancelled", orderId);
    }



    // ========== SEARCH & FILTER ==========

    /**
     * API: GET /api/orders/search?userId=1&status=PENDING&startDate=2024-01-01
     * Search orders with filters
     */
    public List<Order> searchOrders(Long userId, OrderStatus status, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Searching orders - userId: {}, status: {}, dates: {} to {}", userId, status, startDate, endDate);

        if (userId != null && status != null) {
            return orderRepository.findUserOrdersByStatus(userId, status);
        }

        if (startDate != null && endDate != null) {
            return orderRepository.findOrdersByDateRange(startDate, endDate);
        }

        if (userId != null) {
            return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        }

        if (status != null) {
            return orderRepository.findByStatusOrderByCreatedAtDesc(status);
        }

        return orderRepository.findAll();
    }

    // ========== STATISTICS ==========

    /**
     * API: GET /api/orders/stats/user/{userId}
     * Get user order statistics
     */
    public OrderStats getUserOrderStats(Long userId) {
        log.info("Getting order stats for user: {}", userId);

        long totalOrders = orderRepository.countByUserId(userId);
        long completedOrders = orderRepository.countByUserIdAndStatus(userId, OrderStatus.DELIVERED);
        long pendingOrders = orderRepository.countByUserIdAndStatus(userId, OrderStatus.PENDING);
        Double totalSpent = orderRepository.sumTotalAmountByUserIdAndPaymentStatus(userId, PaymentStatus.COMPLETED);

        return OrderStats.builder()
                .totalOrders(totalOrders)
                .completedOrders(completedOrders)
                .pendingOrders(pendingOrders)
                .totalSpent(totalSpent != null ? totalSpent : 0.0)
                .build();
    }

    // ========== HELPER METHODS ==========

    /**
     * Create order event for audit trail
     */
    public void createOrderEvent(Long orderId, EventType eventType, String eventData) {
        try {
            OrderEvent event = OrderEvent.builder()
                    .orderId(orderId)
                    .eventType(eventType)
                    .eventData(eventData)
                    .createdAt(LocalDateTime.now())
                    .build();

            orderEventRepository.save(event);
            log.info("Order event created: {} for order: {}", eventType, orderId);

        } catch (Exception e) {
            log.error("Error creating order event: {}", e.getMessage());
        }
    }

    /**
     * Convert OrderItemDTO to OrderItem entity
     */
    private OrderItem convertDtoToItem(OrderItemDTO dto) {
        return OrderItem.builder()
                .productId(dto.getProductId())
                .productName(dto.getProductName())
                .quantity(dto.getQuantity())
                .unitPrice(dto.getPrice())
                .discount(BigDecimal.valueOf(0.0))
                .tax(BigDecimal.valueOf(0.0))
                .build();
    }

    /**
     * Validate status transitions
     */
    private void validateStatusTransition(OrderStatus current, OrderStatus next) {
        // Define valid transitions
        switch (current) {
            case PENDING:
                if (next != OrderStatus.CONFIRMED && next != OrderStatus.CANCELLED) {
                    throw new RuntimeException("Invalid status transition: " + current + " → " + next);
                }
                break;
            case CONFIRMED:
                if (next != OrderStatus.PROCESSING && next != OrderStatus.CANCELLED) {
                    throw new RuntimeException("Invalid status transition: " + current + " → " + next);
                }
                break;
            case PROCESSING:
                if (next != OrderStatus.SHIPPED && next != OrderStatus.FAILED) {
                    throw new RuntimeException("Invalid status transition: " + current + " → " + next);
                }
                break;
            case SHIPPED:
                if (next !=OrderStatus.DELIVERED && next != OrderStatus.RETURNED) {
                    throw new RuntimeException("Invalid status transition: " + current + " → " + next);
                }
                break;
            default:
                throw new RuntimeException("Cannot transition from: " + current);
        }
    }
}