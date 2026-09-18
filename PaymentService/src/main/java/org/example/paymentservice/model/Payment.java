package org.example.paymentservice.model;

import jakarta.persistence.*;
import lombok.*;
import org.example.paymentservice.common.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class Payment {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @Column(name = "order_id", nullable = false)
    private Long orderId;
 
    @Column(nullable = false)
    private BigDecimal amount;
 
    @Column(name = "payment_status")
    @Enumerated(EnumType.STRING)
    private PaymentStatus status = PaymentStatus.PENDING;
 
    @Column(name = "payment_method")
    private String paymentMethod;
 
    @Column(name = "transaction_id")
    private String transactionId;
 
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
 
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();



}