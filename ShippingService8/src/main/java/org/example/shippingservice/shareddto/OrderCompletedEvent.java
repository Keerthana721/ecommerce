package org.example.shippingservice.shareddto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderCompletedEvent {
    private Long orderId;
    private Long userId;
    private Double totalAmount;
    private LocalDateTime completedAt;
}