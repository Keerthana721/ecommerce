package org.example.paymentservice.service;

import lombok.extern.slf4j.Slf4j;
import org.example.paymentservice.common.PaymentStatus;
import org.example.paymentservice.model.Payment;
import org.example.paymentservice.repository.PaymentRepository;
import org.example.paymentservice.router.UserServiceClient;
import org.example.paymentservice.shareddto.OrderCreatedEvent;
import org.example.paymentservice.shareddto.OrderFailedEvent;
import org.example.paymentservice.shareddto.PaymentProcessedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
 
import java.math.BigDecimal;
import java.time.LocalDateTime;
 
@Service
@Slf4j
@Transactional
public class PaymentService {
 
    @Autowired
    private PaymentRepository paymentRepository;
 
    @Autowired
    private UserServiceClient userServiceClient;
 
    @Autowired
    private KafkaTemplate<String, PaymentProcessedEvent> kafkaTemplate;
 
    public void processPayment(OrderCreatedEvent event) {
        try {
            log.info("Processing payment for order: {}", event.getOrderId());
 
            // Create payment record
            Payment payment = Payment.builder()
                    .orderId(event.getOrderId())
                    .amount(new BigDecimal(event.getTotalAmount()))
                    .paymentMethod("CREDIT_CARD")
                    .status(PaymentStatus.PROCESSING)
                    .createdAt(LocalDateTime.now())
                    .build();
 
            // Get user details
            userServiceClient.getUserById(event.getUserId());
 
            // Process with payment gateway (Stripe, PayPal, etc.)
            String transactionId = processWithPaymentGateway(payment);
 
            payment.setTransactionId(transactionId);
            payment.setStatus(PaymentStatus.COMPLETED);
            paymentRepository.save(payment);
 
            // Publish PaymentProcessedEvent
            PaymentProcessedEvent paymentEvent = PaymentProcessedEvent.builder()
                    .orderId(event.getOrderId())
                    .paymentId(payment.getId())
                    .amount(payment.getAmount().doubleValue())
                    .status("SUCCESS")
                    .processedAt(LocalDateTime.now())
                    .build();
 
            kafkaTemplate.send("payment-processed-topic", paymentEvent);
            log.info("Payment processed successfully for order: {}", event.getOrderId());
 
        } catch (Exception e) {
            log.error("Error processing payment: {}", e.getMessage());
            // Publish CompensationEvent
            kafkaTemplate.send("order-failed-topic", new OrderFailedEvent(event.getOrderId(), e.getMessage()));
        }
    }
 
    private String processWithPaymentGateway(Payment payment) {
        // Integration with Stripe/PayPal/Square
        // For demo, generate transaction ID
        return "TXN_" + System.currentTimeMillis();
    }
 
    public void refundPayment(Long orderId) {
        try {
            log.info("Refunding payment for order: {}", orderId);
 
            Payment payment = paymentRepository.findByOrderId(orderId);
            if (payment != null && payment.getStatus() == PaymentStatus.COMPLETED) {
                payment.setStatus(PaymentStatus.REFUNDED);
                paymentRepository.save(payment);
                log.info("Payment refunded for order: {}", orderId);
            }
 
        } catch (Exception e) {
            log.error("Error refunding payment: {}", e.getMessage());
        }
    }
}