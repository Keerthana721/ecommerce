package org.example.paymentservice.shareddto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaymentProcessedEvent {
    private Long orderId;
    private Long paymentId;
    private Double amount;
    private String status;
    private LocalDateTime processedAt;

    public PaymentProcessedEvent(Long orderId) {
        this.orderId = orderId;
    }
}