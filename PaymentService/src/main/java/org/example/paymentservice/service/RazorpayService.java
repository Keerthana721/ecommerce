package org.example.paymentservice.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.example.paymentservice.common.PaymentStatus;
import org.example.paymentservice.model.Payment;
import org.example.paymentservice.repository.PaymentRepository;
import org.example.paymentservice.shareddto.PaymentProcessedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class RazorpayService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private KafkaTemplate<String, PaymentProcessedEvent> kafkaTemplate;

    private RazorpayClient razorpayClient;

    @PostConstruct
    public void init() {
        try {
            razorpayClient = new RazorpayClient(keyId, keySecret);
            log.info("Razorpay Client initialized successfully with Key ID: {}", keyId);
        } catch (Exception e) {
            log.error("Failed to initialize Razorpay Client: {}", e.getMessage());
        }
    }

    public Map<String, Object> createOrder(BigDecimal amount, Long orderId) throws Exception {
        log.info("Creating Razorpay order for local order ID: {}, amount: {}", orderId, amount);

        if (razorpayClient == null) {
            throw new IllegalStateException("Razorpay client is not initialized. Please verify credentials.");
        }

        // Amount must be in paise (1 INR = 100 paise)
        int amountInPaise = amount.multiply(new BigDecimal("100")).intValue();

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "order_rcpt_" + orderId + "_" + System.currentTimeMillis());

        Order order = razorpayClient.orders.create(orderRequest);
        String razorpayOrderId = order.get("id");

        // Save a pending payment record
        Payment payment = Payment.builder()
                .orderId(orderId)
                .amount(amount)
                .paymentMethod("RAZORPAY")
                .status(PaymentStatus.PROCESSING)
                .transactionId(razorpayOrderId) // Temporarily store Razorpay Order ID as transaction ID
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        paymentRepository.save(payment);

        Map<String, Object> response = new HashMap<>();
        response.put("razorpayOrderId", razorpayOrderId);
        response.put("amount", amountInPaise);
        response.put("currency", "INR");
        response.put("keyId", keyId);

        return response;
    }

    public boolean verifySignatureAndComplete(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        log.info("Verifying Razorpay signature for order: {}, payment: {}", razorpayOrderId, razorpayPaymentId);

        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", razorpayOrderId);
            options.put("razorpay_payment_id", razorpayPaymentId);
            options.put("razorpay_signature", razorpaySignature);

            boolean isSignatureValid = Utils.verifyPaymentSignature(options, keySecret);
            if (isSignatureValid) {
                log.info("Razorpay signature is valid. Completing payment...");

                // Find payment record by transactionId (which holds the razorpayOrderId)
                Payment payment = paymentRepository.findByTransactionId(razorpayOrderId);
                
                if (payment == null) {
                    // Fallback to find by order ID if stored differently
                    payment = paymentRepository.findAll().stream()
                            .filter(p -> razorpayOrderId.equals(p.getTransactionId()))
                            .findFirst()
                            .orElse(null);
                }

                if (payment != null) {
                    payment.setStatus(PaymentStatus.COMPLETED);
                    payment.setTransactionId(razorpayPaymentId); // Store actual Razorpay Payment ID
                    payment.setUpdatedAt(LocalDateTime.now());
                    paymentRepository.save(payment);

                    // Publish PaymentProcessedEvent to update order status to PAID
                    PaymentProcessedEvent paymentEvent = PaymentProcessedEvent.builder()
                            .orderId(payment.getOrderId())
                            .paymentId(payment.getId())
                            .amount(payment.getAmount().doubleValue())
                            .status("SUCCESS")
                            .processedAt(LocalDateTime.now())
                            .build();

                    kafkaTemplate.send("payment-processed-topic", paymentEvent);
                    log.info("Razorpay payment marked COMPLETED. Event published.");
                    return true;
                } else {
                    log.warn("Payment record not found for Razorpay Order: {}", razorpayOrderId);
                }
            } else {
                log.error("Invalid Razorpay payment signature verification failed!");
            }
        } catch (Exception e) {
            log.error("Exception verifying Razorpay signature: {}", e.getMessage());
        }
        return false;
    }
}
