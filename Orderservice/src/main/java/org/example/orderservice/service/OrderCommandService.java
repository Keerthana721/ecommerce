package org.example.orderservice.service;

import lombok.extern.slf4j.Slf4j;
import org.example.orderservice.common.OrderStatus;
import org.example.orderservice.common.PaymentStatus;
import org.example.orderservice.model.Order;
import org.example.orderservice.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Slf4j
@Transactional
public class OrderCommandService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderSagaOrchestrator sagaOrchestrator;

    public Order createOrder(Order order) {
        log.info("Creating order for user: {}", order.getUserId());
        // Start saga orchestration
        sagaOrchestrator.startOrderSaga(order);
        return orderRepository.findById(order.getId())
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public Order updateOrderStatus(Long orderId, OrderStatus newStatus) {
        log.info("Updating order status - ID: {}, Status: {}", orderId, newStatus);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(newStatus);
        return orderRepository.save(order);
    }

    public Order updatePaymentStatus(Long orderId, PaymentStatus paymentStatus) {
        log.info("Updating payment status - ID: {}, Status: {}", orderId, paymentStatus);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setPaymentStatus(paymentStatus);
        return orderRepository.save(order);
    }

    public void cancelOrder(Long orderId) {
        log.info("Cancelling order: {}", orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }
}
