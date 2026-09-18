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
public class ShipmentCreatedEvent {
    private Long shippingId;
    private Long orderId;
    private Long userId;
    private String trackingNumber;
    private String carrier;
    private LocalDateTime createdAt;

    public ShipmentCreatedEvent(Long orderId) {
        this.orderId = orderId;
    }
}