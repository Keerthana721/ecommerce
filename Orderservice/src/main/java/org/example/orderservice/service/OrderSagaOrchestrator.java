package org.example.orderservice.service;


import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.example.orderservice.common.EventType;
import org.example.orderservice.common.OrderStatus;
import org.example.orderservice.model.Order;
import org.example.orderservice.model.OrderEvent;
import org.example.orderservice.repository.OrderEventRepository;
import org.example.orderservice.repository.OrderRepository;
import org.example.orderservice.shareddto.OrderCreatedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@Slf4j
@Transactional
public class OrderSagaOrchestrator {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderEventRepository orderEventRepository;

    @Autowired
    private KafkaTemplate<String, OrderCreatedEvent> kafkaTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String TOPIC_ORDER_CREATED = "order-created-topic";
    private static final String TOPIC_INVENTORY_RESERVED = "inventory-reserved-topic";
    private static final String TOPIC_PAYMENT_PROCESSED = "payment-processed-topic";
    private static final String TOPIC_INVOICE_GENERATED = "invoice-generated-topic";
    private static final String TOPIC_SHIPMENT_CREATED = "shipment-created-topic";

    public void startOrderSaga(Order order) {
        try {
            log.info("Starting Order Saga for order: {}", order.getId());

            // Step 1: Persist order
            order.setStatus(OrderStatus.PENDING);
            Order savedOrder = orderRepository.save(order);

            // Step 2: Create order event
            OrderEvent event = OrderEvent.builder()
                    .orderId(savedOrder.getId())
                    .eventType(EventType.ORDER_CREATED)
                    .eventData(objectMapper.writeValueAsString(savedOrder))
                    .createdAt(LocalDateTime.now())
                    .build();

            orderEventRepository.save(event);

            // Step 3: Publish OrderCreatedEvent to Kafka
            OrderCreatedEvent orderCreatedEvent = OrderCreatedEvent.builder()
                    .orderId(savedOrder.getId())
                    .userId(savedOrder.getUserId())
                    .items(null) // Will be populated from order items
                    .totalAmount(savedOrder.getTotalAmount())
                    .shippingAddress(savedOrder.getShippingAddress())
                    .createdAt(LocalDateTime.now())
                    .build();

            kafkaTemplate.send(TOPIC_ORDER_CREATED, orderCreatedEvent);
            log.info("Order created event published for order: {}", savedOrder.getId());

        } catch (Exception e) {
            log.error("Error starting order saga: {}", e.getMessage());
            throw new RuntimeException("Failed to start order saga", e);
        }
    }

    public void handleInventoryReserved(OrderCreatedEvent event) {
        try {
            log.info("Handling inventory reserved event for order: {}", event.getOrderId());

            Order order = orderRepository.findById(event.getOrderId())
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            order.setStatus(OrderStatus.CONFIRMED);
            orderRepository.save(order);

            // Create event
            OrderEvent orderEvent = OrderEvent.builder()
                    .orderId(order.getId())
                    .eventType(EventType.INVENTORY_RESERVED)
                    .eventData(objectMapper.writeValueAsString(event))
                    .createdAt(LocalDateTime.now())
                    .build();

            orderEventRepository.save(orderEvent);

            log.info("Inventory reserved for order: {}", order.getId());

        } catch (Exception e) {
            log.error("Error handling inventory reserved: {}", e.getMessage());
            handleCompensation(event.getOrderId(), "Inventory reservation failed");
        }
    }

    public void handlePaymentProcessed(Object paymentEvent) {
        try {
            log.info("Handling payment processed event");
            // Process payment completion
            OrderEvent event = OrderEvent.builder()
                    .eventType(EventType.PAYMENT_PROCESSED)
                    .eventData(objectMapper.writeValueAsString(paymentEvent))
                    .createdAt(LocalDateTime.now())
                    .build();

            orderEventRepository.save(event);

        } catch (Exception e) {
            log.error("Error handling payment processed: {}", e.getMessage());
        }
    }

    public void handleInvoiceGenerated(Object invoiceEvent) {
        try {
            log.info("Handling invoice generated event");
            OrderEvent event = OrderEvent.builder()
                    .eventType(EventType.INVOICE_GENERATED)
                    .eventData(objectMapper.writeValueAsString(invoiceEvent))
                    .createdAt(LocalDateTime.now())
                    .build();

            orderEventRepository.save(event);

        } catch (Exception e) {
            log.error("Error handling invoice generated: {}", e.getMessage());
        }
    }

    public void handleShipmentCreated(Object shipmentEvent) {
        try {
            log.info("Handling shipment created event");
            OrderEvent event = OrderEvent.builder()
                    .eventType(EventType.SHIPMENT_CREATED)
                    .eventData(objectMapper.writeValueAsString(shipmentEvent))
                    .createdAt(LocalDateTime.now())
                    .build();

            orderEventRepository.save(event);

        } catch (Exception e) {
            log.error("Error handling shipment created: {}", e.getMessage());
        }
    }

    private void handleCompensation(Long orderId, String reason) {
        try {
            log.error("Handling compensation for order: {} - Reason: {}", orderId, reason);

            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);

            // Create compensation event
            OrderEvent event = OrderEvent.builder()
                    .orderId(orderId)
                    .eventType(EventType.COMPENSATION_INITIATED)
                    .eventData(reason)
                    .createdAt(LocalDateTime.now())
                    .build();

            orderEventRepository.save(event);

        } catch (Exception e) {
            log.error("Error handling compensation: {}", e.getMessage());
        }
    }
}



