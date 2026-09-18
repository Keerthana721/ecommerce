package org.example.shippingservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
 
import java.time.LocalDateTime;
 
@Entity
@Table(name = "shipments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shipment {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @Column(name = "order_id", nullable = false)
    private Long orderId;
 
    @Column(name = "tracking_number", unique = true)
    private String trackingNumber;
 
    @Column(name = "carrier")
    private String carrier;
 
    @Column(name = "shipment_status")
    @Enumerated(EnumType.STRING)
    private ShipmentStatus status = ShipmentStatus.PENDING;
 
    @Column(name = "shipping_address")
    private String shippingAddress;
 
    @Column(name = "estimated_delivery")
    private LocalDateTime estimatedDelivery;
 
    @Column(name = "actual_delivery")
    private LocalDateTime actualDelivery;
 
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
 
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
 
    public enum ShipmentStatus {
        PENDING, PICKED, SHIPPED, IN_TRANSIT, DELIVERED, CANCELLED
    }
}