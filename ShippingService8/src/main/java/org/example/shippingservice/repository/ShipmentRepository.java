package org.example.shippingservice.repository;

import org.example.shippingservice.model.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
    Shipment findByOrderId(Long orderId);
    Shipment findByTrackingNumber(String trackingNumber);
}