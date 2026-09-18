package org.example.paymentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentProcessRequest {
    private Long orderId;
    private BigDecimal amount;
    private String paymentMethod; // e.g. CREDIT_CARD, UPI, PAYPAL, MOCK
    private String cardNumber;
    private String cvv;
}
