package org.example.shippingservice.shareddto;
import lombok.*;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
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