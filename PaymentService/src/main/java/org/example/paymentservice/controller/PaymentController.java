package org.example.paymentservice.controller;

import lombok.extern.slf4j.Slf4j;
import org.example.paymentservice.model.Payment;
import org.example.paymentservice.repository.PaymentRepository;
import org.example.paymentservice.shareddto.ApiResponse;
import org.example.paymentservice.shareddto.PaymentDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

import org.example.paymentservice.common.PaymentStatus;
import org.example.paymentservice.dto.PaymentProcessRequest;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payments")
//@Tag(name = "Payment Management", description = "Payment processing and management")
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class PaymentController {
 
    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private org.example.paymentservice.service.RazorpayService razorpayService;

    @PostMapping({"/process", "/pay"})
    public ResponseEntity<ApiResponse<PaymentDTO>> processPayment(@RequestBody PaymentProcessRequest request) {
        try {
            log.info("Processing mock payment for order: {}, amount: {}", request.getOrderId(), request.getAmount());

            String transactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            Payment payment = Payment.builder()
                    .orderId(request.getOrderId())
                    .amount(request.getAmount() != null ? request.getAmount() : new java.math.BigDecimal("100.00"))
                    .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CREDIT_CARD")
                    .status(PaymentStatus.COMPLETED)
                    .transactionId(transactionId)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            Payment savedPayment = paymentRepository.save(payment);
            log.info("Payment processed successfully: {}", savedPayment.getId());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.<PaymentDTO>builder()
                            .success(true)
                            .message("Payment processed successfully!")
                            .data(convertEntityToDto(savedPayment))
                            .timestamp(LocalDateTime.now())
                            .build());
        } catch (Exception e) {
            log.error("Error processing payment: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.<PaymentDTO>builder()
                            .success(false)
                            .message(e.getMessage())
                            .timestamp(LocalDateTime.now())
                            .build());
        }
    }
 
    @GetMapping("/order/{orderId}")
//    @Operation(summary = "Get payment by order ID")
    public ResponseEntity<ApiResponse<PaymentDTO>> getPaymentByOrderId(@PathVariable Long orderId) {
        try {
            log.info("Fetching payment for order: {}", orderId);
 
            Payment payment = paymentRepository.findByOrderId(orderId);
            if (payment == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.<PaymentDTO>builder()
                                .success(false)
                                .message("Payment not found for order")
                                .timestamp(LocalDateTime.now())
                                .build());
            }
 
            return ResponseEntity.ok(ApiResponse.<PaymentDTO>builder()
                    .success(true)
                    .message("Payment retrieved successfully")
                    .data(convertEntityToDto(payment))
                    .timestamp(LocalDateTime.now())
                    .build());
 
        } catch (Exception e) {
            log.error("Error fetching payment: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<PaymentDTO>builder()
                            .success(false)
                            .message(e.getMessage())
                            .timestamp(LocalDateTime.now())
                            .build());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentDTO>> getPaymentById(@PathVariable Long id) {
        try {
            log.info("Fetching payment by ID: {}", id);
            Payment payment = paymentRepository.findById(id).orElse(null);
            if (payment == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.<PaymentDTO>builder()
                                .success(false)
                                .message("Payment not found")
                                .timestamp(LocalDateTime.now())
                                .build());
            }
            return ResponseEntity.ok(ApiResponse.<PaymentDTO>builder()
                    .success(true)
                    .message("Payment retrieved successfully")
                    .data(convertEntityToDto(payment))
                    .timestamp(LocalDateTime.now())
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<PaymentDTO>builder()
                            .success(false)
                            .message(e.getMessage())
                            .timestamp(LocalDateTime.now())
                            .build());
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentDTO>>> getAllPayments() {
        try {
            List<PaymentDTO> payments = paymentRepository.findAll().stream()
                    .map(this::convertEntityToDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponse.<List<PaymentDTO>>builder()
                    .success(true)
                    .message("All payments retrieved successfully")
                    .data(payments)
                    .timestamp(LocalDateTime.now())
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<List<PaymentDTO>>builder()
                            .success(false)
                            .message(e.getMessage())
                            .timestamp(LocalDateTime.now())
                            .build());
        }
    }

    @PostMapping("/razorpay/create-order")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> createRazorpayOrder(@RequestBody org.example.paymentservice.dto.RazorpayOrderRequest request) {
        try {
            log.info("Creating Razorpay order for internal Order: {}", request.getOrderId());
            java.util.Map<String, Object> orderDetails = razorpayService.createOrder(request.getAmount(), request.getOrderId());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.<java.util.Map<String, Object>>builder()
                            .success(true)
                            .message("Razorpay Order created successfully!")
                            .data(orderDetails)
                            .timestamp(LocalDateTime.now())
                            .build());
        } catch (Exception e) {
            log.error("Error creating Razorpay Order: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.<java.util.Map<String, Object>>builder()
                            .success(false)
                            .message(e.getMessage())
                            .timestamp(LocalDateTime.now())
                            .build());
        }
    }

    @PostMapping("/razorpay/verify")
    public ResponseEntity<ApiResponse<Boolean>> verifyRazorpayPayment(@RequestBody org.example.paymentservice.dto.RazorpayVerifyRequest request) {
        try {
            log.info("Verifying Razorpay payment for Order ID: {}", request.getRazorpayOrderId());
            boolean verified = razorpayService.verifySignatureAndComplete(
                    request.getRazorpayOrderId(),
                    request.getRazorpayPaymentId(),
                    request.getRazorpaySignature()
            );

            if (verified) {
                return ResponseEntity.ok(ApiResponse.<Boolean>builder()
                        .success(true)
                        .message("Razorpay payment verified and completed successfully!")
                        .data(true)
                        .timestamp(LocalDateTime.now())
                        .build());
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.<Boolean>builder()
                        .success(false)
                        .message("Razorpay payment signature verification failed.")
                        .data(false)
                        .timestamp(LocalDateTime.now())
                        .build());
            }
        } catch (Exception e) {
            log.error("Error verifying Razorpay signature: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<Boolean>builder()
                            .success(false)
                            .message(e.getMessage())
                            .timestamp(LocalDateTime.now())
                            .build());
        }
    }
 
    private PaymentDTO convertEntityToDto(Payment payment) {
        return PaymentDTO.builder()
                .id(payment.getId())
                .orderId(payment.getOrderId())
                .amount(payment.getAmount() != null ? payment.getAmount().doubleValue() : 0.0)
                .status(String.valueOf(payment.getStatus()))
                .paymentMethod(payment.getPaymentMethod())
                .transactionId(payment.getTransactionId())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }
}
 