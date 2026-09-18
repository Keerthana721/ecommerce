package org.example.shippingservice.service;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.example.shippingservice.model.Shipment;
import org.example.shippingservice.repository.ShipmentRepository;
import org.example.shippingservice.shareddto.OrderCreatedEvent;
import org.example.shippingservice.shareddto.OrderFailedEvent;
import org.example.shippingservice.shareddto.ShipmentCreatedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Slf4j
@Transactional
public class ShippingService {

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private KafkaTemplate<String, ShipmentCreatedEvent> kafkaTemplate;

    public void createShipment(OrderCreatedEvent event) {
        try {
            log.info("Creating shipment for order: {}", event.getOrderId());

            // Create shipment record
            String trackingNumber = "TRK_" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();

            Shipment shipment = Shipment.builder()
                    .orderId(event.getOrderId())
                    .trackingNumber(trackingNumber)
                    .carrier("FedEx")
                    .status(Shipment.ShipmentStatus.PICKED)
                    .shippingAddress(event.getShippingAddress())
                    .estimatedDelivery(LocalDateTime.now().plusDays(3))
                    .createdAt(LocalDateTime.now())
                    .build();

            shipmentRepository.save(shipment);

            // Publish ShipmentCreatedEvent
            ShipmentCreatedEvent shipmentEvent = ShipmentCreatedEvent.builder()
                    .shippingId(shipment.getId())
                    .orderId(event.getOrderId())
                    .userId(event.getUserId())
                    .trackingNumber(trackingNumber)
                    .carrier("FedEx")
                    .createdAt(LocalDateTime.now())
                    .build();

            kafkaTemplate.send("shipment-created-topic", shipmentEvent);
            log.info("Shipment created for order: {} with tracking: {}", event.getOrderId(), trackingNumber);

        } catch (Exception e) {
            log.error("Error creating shipment: {}", e.getMessage());
            kafkaTemplate.send("order-failed-topic", new OrderFailedEvent(event.getOrderId(), e.getMessage()));
        }
    }

    public void updateShipmentStatus(Long shipmentId, Shipment.ShipmentStatus status) {
        try {
            log.info("Updating shipment status: {}", shipmentId);

            Shipment shipment = shipmentRepository.findById(shipmentId)
                    .orElseThrow(() -> new RuntimeException("Shipment not found"));

            shipment.setStatus(status);
            shipment.setUpdatedAt(LocalDateTime.now());

            if (status == Shipment.ShipmentStatus.DELIVERED) {
                shipment.setActualDelivery(LocalDateTime.now());
            }

            shipmentRepository.save(shipment);
            log.info("Shipment status updated to: {}", status);

        } catch (Exception e) {
            log.error("Error updating shipment status: {}", e.getMessage());
        }
    }
}