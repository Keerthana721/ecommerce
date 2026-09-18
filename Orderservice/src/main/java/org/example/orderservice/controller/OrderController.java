package org.example.orderservice.controller;

import lombok.extern.slf4j.Slf4j;
import org.example.orderservice.common.OrderStats;
import org.example.orderservice.common.OrderStatus;
import org.example.orderservice.common.PaymentStatus;
import org.example.orderservice.dto.OrderHistoryDto;
import org.example.orderservice.model.Order;
import org.example.orderservice.model.OrderEvent;
import org.example.orderservice.model.OrderItem;
import org.example.orderservice.service.OrderService;
import org.example.orderservice.shareddto.ApiResponse;
import org.example.orderservice.shareddto.OrderDTO;
import org.example.orderservice.shareddto.OrderItemDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("orders")
//@Tag(name = "Order Management", description = "Create, view, and manage orders")
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class OrderController {

    @Autowired
    private OrderService orderService;

    // ============================================================
    // CREATE ORDER - POST /api/orders
    // ============================================================

    /**
     * @api {post} /api/orders Create New Order
     * @apiName CreateOrder
     * @apiGroup Orders
     * @apiHeader {String} Authorization Bearer JWT token
     * @apiHeader {String} X-User-Id User ID from JWT
     *
     * @apiParam {Number} userId User ID
     * @apiParam {Array} items Array of order items
     * @apiParam {Number} items.productId Product ID
     * @apiParam {String} items.productName Product name
     * @apiParam {Number} items.quantity Quantity
     * @apiParam {Number} items.price Unit price
     * @apiParam {Number} totalAmount Total order amount
     * @apiParam {String} shippingAddress Shipping address
     *
     * @apiSuccess {Boolean} success True if successful
     * @apiSuccess {String} message Success message
     * @apiSuccess {Object} data Order object
     *
     * @apiError {Boolean} success False
     * @apiError {String} message Error message
     */
    @PostMapping({"", "/place"})
//    @Operation(summary = "Create a new order", description = "Creates order and starts Saga orchestration")
    public ResponseEntity<ApiResponse<OrderDTO>> createOrder(
             @RequestBody OrderDTO orderDTO,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        try {
            if (userId != null) {
                orderDTO.setUserId(userId);
            }
            if (orderDTO.getUserId() == null) {
                orderDTO.setUserId(1L); // Default fallback user ID for public demo orders
            }
            log.info("🔵 [API] POST /orders/place - Creating order for user: {}", orderDTO.getUserId());

            // Convert DTO to entity
            Order order = new Order();
            order.setUserId(orderDTO.getUserId());
            order.setTotalAmount(orderDTO.getTotalAmount());
            order.setShippingAddress(orderDTO.getShippingAddress());

            // Create order (triggers Saga)
            Order createdOrder = orderService.createOrder(order, orderDTO.getItems());

            log.info("✅ [SUCCESS] Order created: {}", createdOrder.getId());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.<OrderDTO>builder()
                            .success(true)
                            .message("Order created successfully. Saga orchestration started...")
                            .data(convertEntityToDto(createdOrder))
                            .timestamp(LocalDateTime.now())
                            .build());

        } catch (Exception e) {
            log.error("❌ [ERROR] Failed to create order: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.<OrderDTO>builder()
                            .success(false)
                            .message(e.getMessage())
                            .timestamp(LocalDateTime.now())
                            .build());
        }
    }

    // ============================================================
    // GET ORDERS - GET /api/orders/*
    // ============================================================

    /**
     * @api {get} /api/orders/:id Get Order by ID
     * @apiName GetOrderById
     * @apiGroup Orders
     * @apiHeader {String} Authorization Bearer JWT token
     *
     * @apiParam {Number} id Order ID
     *
     * @apiSuccess {Object} data Order object with status, items, etc.
     */
    @GetMapping("/{id}")
//    @Operation(summary = "Get order by ID", description = "Retrieves order details with all items and history")
    public ResponseEntity<ApiResponse<OrderDTO>> getOrderById(
            @PathVariable Long id) {
        try {
            log.info("🔵 [API] GET /api/orders/{} - Fetching order", id);

            Order order = orderService.getOrderById(id);

            log.info("✅ [SUCCESS] Order retrieved: {}", id);

            return ResponseEntity.ok(ApiResponse.<OrderDTO>builder()
                    .success(true)
                    .message("Order retrieved successfully")
                    .data(convertEntityToDto(order))
                    .timestamp(LocalDateTime.now())
                    .build());

        } catch (Exception e) {
            log.error("❌ [ERROR] Failed to fetch order: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.<OrderDTO>builder()
                            .success(false)
                            .message(e.getMessage())
                            .timestamp(LocalDateTime.now())
                            .build());
        }
    }

    /**
     * @api {get} /api/orders/user/:userId Get User Orders
     * @apiName GetUserOrders
     * @apiGroup Orders
     * @apiHeader {String} Authorization Bearer JWT token
     *
     * @apiParam {Number} userId User ID
     *
     * @apiSuccess {Array} data Array of user orders sorted by date
     */
    @GetMapping("/user/{userId}")
//    @Operation(summary = "Get all orders for a user", description = "Retrieves all orders for specific user")
    public ResponseEntity<ApiResponse<List<OrderDTO>>> getUserOrders(
            @PathVariable Long userId) {
        try {
            log.info("🔵 [API] GET /api/orders/user/{} - Fetching user orders", userId);

            List<Order> orders = orderService.getUserOrders(userId);
            List<OrderDTO> orderDTOs = orders.stream()
                    .map(this::convertEntityToDto)
                    .collect(Collectors.toList());

            log.info("✅ [SUCCESS] Retrieved {} orders for user: {}", orderDTOs.size(), userId);

            return ResponseEntity.ok(ApiResponse.<List<OrderDTO>>builder()
                    .success(true)
                    .message("Orders retrieved successfully")
                    .data(orderDTOs)
                    .timestamp(LocalDateTime.now())
                    .build());

        } catch (Exception e) {
            log.error("❌ [ERROR] Failed to fetch user orders: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<List<OrderDTO>>builder()
                            .success(false)
                            .message(e.getMessage())
                            .timestamp(LocalDateTime.now())
                            .build());
        }
    }

    /**
     * @api {get} /api/orders/status/:status Get Orders by Status
     * @apiName GetOrdersByStatus
     * @apiGroup Orders
     * @apiHeader {String} Authorization Bearer JWT token
     *
     * @apiParam {String} status Order status (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
     *
     * @apiSuccess {Array} data Array of orders with specified status
     */
    @GetMapping("/status/{status}")
//    @Operation(summary = "Get orders by status", description = "Retrieves all orders with specific status")
    public ResponseEntity<ApiResponse<List<OrderDTO>>> getOrdersByStatus(
            @PathVariable String status) {
        try {
            log.info("🔵 [API] GET /api/orders/status/{} - Fetching orders by status", status);

            OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
            List<Order> orders = orderService.getOrdersByStatus(orderStatus);
            List<OrderDTO> orderDTOs = orders.stream()
                    .map(this::convertEntityToDto)
                    .collect(Collectors.toList());

            log.info("✅ [SUCCESS] Retrieved {} orders with status: {}", orderDTOs.size(), status);

            return ResponseEntity.ok(ApiResponse.<List<OrderDTO>>builder()
                    .success(true)
                    .message("Orders retrieved successfully")
                    .data(orderDTOs)
                    .timestamp(LocalDateTime.now())
                    .build());

        } catch (IllegalArgumentException e) {
            log.error("❌ [ERROR] Invalid status: {}", status);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.<List<OrderDTO>>builder()
                            .success(false)
                            .message("Invalid status: " + status)
                            .timestamp(LocalDateTime.now())
                            .build());
        } catch (Exception e) {
            log.error("❌ [ERROR] Failed to fetch orders by status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<List<OrderDTO>>builder()
                            .success(false)
                            .message(e.getMessage())
                            .timestamp(LocalDateTime.now())
                            .build());
        }
    }

    /**
     * @api {get} /api/orders/user/:userId/status/:status Get User Orders by Status
     * @apiName GetUserOrdersByStatus
     * @apiGroup Orders
     *
     * @apiParam {Number} userId User ID
     * @apiParam {String} status Order status
     *
     * @apiSuccess {Array} data Array of user orders filtered by status
     */
    @GetMapping("/user/{userId}/status/{status}")
//    @Operation(summary = "Get user orders filtered by status")
    public ResponseEntity<ApiResponse<List<OrderDTO>>> getUserOrdersByStatus(
            @PathVariable Long userId,
            @PathVariable String status) {
        try {
            log.info("🔵 [API] GET /api/orders/user/{}/status/{}", userId, status);

           OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
            List<Order> orders = orderService.getUserOrdersByStatus(userId, orderStatus);
            List<OrderDTO> orderDTOs = orders.stream()
                    .map(this::convertEntityToDto)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.<List<OrderDTO>>builder()
                    .success(true)
                    .data(orderDTOs)
                    .timestamp(LocalDateTime.now())
                    .build());

        } catch (Exception e) {
            log.error("❌ [ERROR] {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.<List<OrderDTO>>builder()
                            .success(false)
                            .message(e.getMessage())
                            .timestamp(LocalDateTime.now())
                            .build());
        }
    }

    // ============================================================
    // GET ORDER ITEMS
    // ============================================================

    /**
     * @api {get} /api/orders/:id/items Get Order Items
     * @apiName GetOrderItems
     * @apiGroup Orders
     *
     * @apiParam {Number} id Order ID
     *
     * @apiSuccess {Array} data Array of items in order
     */
    @GetMapping("/{id}/items")
//    @Operation(summary = "Get items in order")
    public ResponseEntity<ApiResponse<List<OrderItemDTO>>> getOrderItems(
            @PathVariable Long id) {
        try {
            log.info("🔵 [API] GET /api/orders/{}/items", id);

            List<OrderItem> items = orderService.getOrderItems(id);
            List<OrderItemDTO> itemDTOs = items.stream()
                    .map(this::convertItemToDto)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.<List<OrderItemDTO>>builder()
                    .success(true)
                    .data(itemDTOs)
                    .timestamp(LocalDateTime.now())
                    .build());

        } catch (Exception e) {
            log.error("❌ [ERROR] {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.<List<OrderItemDTO>>builder()
                            .success(false)
                            .message(e.getMessage())
                            .timestamp(LocalDateTime.now())
                            .build());
        }
    }

    // ============================================================
    // GET ORDER HISTORY
    // ============================================================

    /**
     * @api {get} /api/orders/:id/history Get Order Event History
     * @apiName GetOrderHistory
     * @apiGroup Orders
     *
     * @apiParam {Number} id Order ID
     *
     * @apiSuccess {Array} data Array of order events (audit trail)
     */
    @GetMapping("/{id}/history")
//    @Operation(summary = "Get order event history", description = "Retrieves all Saga events for order")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getOrderHistory(
            @PathVariable Long id) {
        try {
            log.info("🔵 [API] GET /api/orders/{}/history", id);

            List<OrderEvent> events = orderService.getOrderHistory(id);

            List<OrderHistoryDto> eventList = events.stream()
                    .map(event -> OrderHistoryDto.builder()
                            .eventType(event.getEventType().name())
                            .eventData(event.getEventData())
                            .timestamp(event.getCreatedAt())
                            .build())
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.<List<Map<String, Object>>>builder()
                    .success(true)
                    .data((List<Map<String, Object>>) eventList.get(0))
                    .timestamp(LocalDateTime.now())
                    .build());

        } catch (Exception e) {
            log.error("❌ [ERROR] {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.<List<Map<String, Object>>>builder()
                            .success(false)
                            .message(e.getMessage())
                            .timestamp(LocalDateTime.now())
                            .build());
        }
    }

    // ============================================================
    // UPDATE ORDERS - PUT /api/orders/*
    // ============================================================

    /**
     * @api {put} /api/orders/:id/status Update Order Status
     * @apiName UpdateOrderStatus
     * @apiGroup Orders
     *
     * @apiParam {Number} id Order ID
     * @apiParam {String} status New status
     *
     * @apiSuccess {Object} data Updated order object
     */
    @PutMapping("/{id}/status")
//    @Operation(summary = "Update order status")
    public ResponseEntity<ApiResponse<OrderDTO>> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        try {
            log.info("🔵 [API] PUT /api/orders/{}/status - New status: {}", id, status);

         OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
            Order updatedOrder = orderService.updateOrderStatus(id, orderStatus);

            log.info("✅ [SUCCESS] Order {} status updated to: {}", id, status);

            return ResponseEntity.ok(ApiResponse.<OrderDTO>builder()
                    .success(true)
                    .message("Order status updated successfully")
                    .data(convertEntityToDto(updatedOrder))
                    .timestamp(LocalDateTime.now())
                    .build());

        } catch (Exception e) {
            log.error("❌ [ERROR] {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.<OrderDTO>builder()
                            .success(false)
                            .message(e.getMessage())
                            .timestamp(LocalDateTime.now())
                            .build());
        }
    }

    /**
     * @api {put} /api/orders/:id/payment-status Update Payment Status
     * @apiName UpdatePaymentStatus
     * @apiGroup Orders
     *
     * @apiParam {Number} id Order ID
     * @apiParam {String} status New payment status
     */
    @PutMapping("/{id}/payment-status")
//    @Operation(summary = "Update payment status")
    public ResponseEntity<ApiResponse<OrderDTO>> updatePaymentStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        try {
            log.info("🔵 [API] PUT /api/orders/{}/payment-status - New status: {}", id, status);
            PaymentStatus paymentStatus = PaymentStatus.valueOf(status.toUpperCase());
            Order updatedOrder = orderService.updatePaymentStatus(id, paymentStatus);

            return ResponseEntity.ok(ApiResponse.<OrderDTO>builder()
                    .success(true)
                    .message("Payment status updated successfully")
                    .data(convertEntityToDto(updatedOrder))
                    .timestamp(LocalDateTime.now())
                    .build());

        } catch (Exception e) {
            log.error("❌ [ERROR] {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.<OrderDTO>builder()
                            .success(false)
                            .message(e.getMessage())
                            .timestamp(LocalDateTime.now())
                            .build());
        }
    }

    /**
     * @api {put} /api/orders/:id Update Order Details
     * @apiName UpdateOrder
     * @apiGroup Orders
     *
     * @apiParam {Number} id Order ID
     * @apiBody {Object} Order data to update
     */
    @PutMapping("/{id}")
//    @Operation(summary = "Update order details", description = "Update shipping address, notes, etc.")
    public ResponseEntity<ApiResponse<OrderDTO>> updateOrder(
            @PathVariable Long id,
             @RequestBody OrderDTO updateDTO) {
        try {
            log.info("🔵 [API] PUT /api/orders/{} - Updating order details", id);

            Order updatedOrder = orderService.updateOrder(id, updateDTO);

            return ResponseEntity.ok(ApiResponse.<OrderDTO>builder()
                    .success(true)
                    .message("Order updated successfully")
                    .data(convertEntityToDto(updatedOrder))
                    .timestamp(LocalDateTime.now())
                    .build());

        } catch (Exception e) {
            log.error("❌ [ERROR] {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.<OrderDTO>builder()
                            .success(false)
                            .message(e.getMessage())
                            .timestamp(LocalDateTime.now())
                            .build());
        }
    }

    // ============================================================
    // DELETE ORDER (CANCEL) - DELETE /api/orders/:id
    // ============================================================

    /**
     * @api {delete} /api/orders/:id Cancel Order
     * @apiName CancelOrder
     * @apiGroup Orders
     *
     * @apiParam {Number} id Order ID
     *
     * @apiSuccess {Boolean} success True
     */
    @DeleteMapping("/{id}")
//    @Operation(summary = "Cancel order", description = "Cancels order if in PENDING or CONFIRMED state")
    public ResponseEntity<ApiResponse<String>> cancelOrder(
            @PathVariable Long id) {
        try {
            log.info("🔵 [API] DELETE /api/orders/{} - Cancelling order", id);

            orderService.cancelOrder(id);

            log.info("✅ [SUCCESS] Order {} cancelled", id);

            return ResponseEntity.ok(ApiResponse.<String>builder()
                    .success(true)
                    .message("Order cancelled successfully")
                    .data("Order " + id + " has been cancelled")
                    .timestamp(LocalDateTime.now())
                    .build());

        } catch (Exception e) {
            log.error("❌ [ERROR] {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.<String>builder()
                            .success(false)
                            .message(e.getMessage())
                            .timestamp(LocalDateTime.now())
                            .build());
        }
    }

    // ============================================================
    // SEARCH & FILTER
    // ============================================================

    /**
     * @api {get} /api/orders/search Search Orders
     * @apiName SearchOrders
     * @apiGroup Orders
     *
     * @apiParam {Number} [userId] User ID filter
     * @apiParam {String} [status] Status filter
     * @apiParam {Date} [startDate] Date range start (yyyy-MM-dd)
     * @apiParam {Date} [endDate] Date range end (yyyy-MM-dd)
     */
    @GetMapping("/search")
//    @Operation(summary = "Search orders", description = "Search with multiple filters")
    public ResponseEntity<ApiResponse<List<OrderDTO>>> searchOrders(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            log.info("🔵 [API] GET /api/orders/search - userId: {}, status: {}", userId, status);

        OrderStatus orderStatus = status != null ? OrderStatus.valueOf(status.toUpperCase()) : null;
            List<Order> orders = orderService.searchOrders(userId, orderStatus, startDate, endDate);
            List<OrderDTO> orderDTOs = orders.stream()
                    .map(this::convertEntityToDto)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.<List<OrderDTO>>builder()
                    .success(true)
                    .data(orderDTOs)
                    .timestamp(LocalDateTime.now())
                    .build());

        } catch (Exception e) {
            log.error("❌ [ERROR] {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.<List<OrderDTO>>builder()
                            .success(false)
                            .message(e.getMessage())
                            .timestamp(LocalDateTime.now())
                            .build());
        }
    }

    // ============================================================
    // STATISTICS
    // ============================================================

    /**
     * @api {get} /api/orders/stats/user/:userId Get User Order Statistics
     * @apiName GetUserOrderStats
     * @apiGroup Orders
     *
     * @apiParam {Number} userId User ID
     *
     * @apiSuccess {Object} data Statistics object
     */
    @GetMapping("/stats/user/{userId}")
//    @Operation(summary = "Get user order statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserStats(
            @PathVariable Long userId) {
        try {
            log.info("🔵 [API] GET /api/orders/stats/user/{}", userId);

            OrderStats stats = orderService.getUserOrderStats(userId);

            Map<String, Object> statsMap = Map.of(
                    "totalOrders", stats.getTotalOrders(),
                    "completedOrders", stats.getCompletedOrders(),
                    "pendingOrders", stats.getPendingOrders(),
                    "totalSpent", stats.getTotalSpent()
            );

            return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                    .success(true)
                    .data(statsMap)
                    .timestamp(LocalDateTime.now())
                    .build());

        } catch (Exception e) {
            log.error("❌ [ERROR] {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<Map<String, Object>>builder()
                            .success(false)
                            .message(e.getMessage())
                            .timestamp(LocalDateTime.now())
                            .build());
        }
    }

    // ============================================================
    // HELPER METHODS
    // ============================================================

    private OrderDTO convertEntityToDto(Order order) {
        return OrderDTO.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .items(order.getItems().stream()
                        .map(this::convertItemToDto)
                        .collect(Collectors.toList()))
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().toString())
                .paymentStatus(order.getPaymentStatus().toString())
                .shippingAddress(order.getShippingAddress())
                .billingAddress(order.getBillingAddress())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .completedAt(order.getCompletedAt())
                .build();
    }

    private OrderItemDTO convertItemToDto(OrderItem item) {
        return OrderItemDTO.builder()
                .productId(item.getProductId())
                .productName(item.getProductName())
                .quantity(item.getQuantity())
                .price(item.getUnitPrice())
                .subtotal(item.getSubtotal())
                .build();
    }
}