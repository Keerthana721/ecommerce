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
public class ShippingDTO {
    private Long id;
    private Long orderId;
    private String trackingNumber;
    private String carrier;
    private String status;
    private String shippingAddress;
    private LocalDateTime estimatedDelivery;
    private LocalDateTime actualDelivery;
}