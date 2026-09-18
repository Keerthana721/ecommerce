package org.example.notificationservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderCompletedEvent {

    private Long orderId;
    private Long userId;

    private String customerName;
    private String customerEmail;

    private BigDecimal totalAmount;

    private String paymentId;
    private String invoiceNumber;

    private LocalDateTime orderDate;
    private LocalDateTime deliveredDate;
}