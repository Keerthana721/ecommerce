package org.example.notificationservice.event;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class ShipmentCreatedEvent{
   private Long orderId;
    Long userId;
    Long shipmentId;
    String trackingNumber;
    String carrier;
    String shippingAddress;
    String shipmentStatus;
}

