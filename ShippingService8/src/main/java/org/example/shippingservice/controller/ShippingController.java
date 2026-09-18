package org.example.shippingservice.controller;

import lombok.extern.slf4j.Slf4j;
import org.example.shippingservice.model.Shipment;
import org.example.shippingservice.repository.ShipmentRepository;
import org.example.shippingservice.service.ShippingService;
import org.example.shippingservice.shareddto.ApiResponse;
import org.example.shippingservice.shareddto.ShippingDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/shipping")
//@Tag(name = "Shipping Management", description = "Shipment tracking and management")
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class ShippingController {
 
    @Autowired
    private ShipmentRepository shipmentRepository;
 
    @Autowired
    private ShippingService shippingService;
 
    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SHIPPING_MANAGER')")
//    @Operation(summary = "Get shipment by order ID")
    public ResponseEntity<ApiResponse<ShippingDTO>> getShipmentByOrderId(@PathVariable Long orderId) {
        try {
            log.info("Fetching shipment for order: {}", orderId);
 
            Shipment shipment = shipmentRepository.findByOrderId(orderId);
            if (shipment == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.<ShippingDTO>builder()
                                .success(false)
                                .message("Shipment not found for order")
                                .timestamp(LocalDateTime.now())
                                .build());
            }
 
            return ResponseEntity.ok(ApiResponse.<ShippingDTO>builder()
                    .success(true)
                    .message("Shipment retrieved successfully")
                    .data(convertEntityToDto(shipment))
                    .timestamp(LocalDateTime.now())
                    .build());
 
        } catch (Exception e) {
            log.error("Error fetching shipment: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<ShippingDTO>builder()
                            .success(false)
                            .message(e.getMessage())
                            .timestamp(LocalDateTime.now())
                            .build());
        }
    }
 
    @GetMapping("/tracking/{trackingNumber}")
//    @Operation(summary = "Track shipment by tracking number")
    public ResponseEntity<ApiResponse<ShippingDTO>> trackShipment(@PathVariable String trackingNumber) {
        try {
            log.info("Tracking shipment: {}", trackingNumber);
 
            Shipment shipment = shipmentRepository.findByTrackingNumber(trackingNumber);
            if (shipment == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.<ShippingDTO>builder()
                                .success(false)
                                .message("Shipment not found")
                                .timestamp(LocalDateTime.now())
                                .build());
            }
 
            return ResponseEntity.ok(ApiResponse.<ShippingDTO>builder()
                    .success(true)
                    .message("Shipment tracked successfully")
                    .data(convertEntityToDto(shipment))
                    .timestamp(LocalDateTime.now())
                    .build());
 
        } catch (Exception e) {
            log.error("Error tracking shipment: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<ShippingDTO>builder()
                            .success(false)
                            .message(e.getMessage())
                            .timestamp(LocalDateTime.now())
                            .build());
        }
    }
 
    @PutMapping("/{shipmentId}/status")
//    @Operation(summary = "Update shipment status")
    public ResponseEntity<ApiResponse<ShippingDTO>> updateShipmentStatus(
            @PathVariable Long shipmentId,
            @RequestParam String status) {
        try {
            log.info("Updating shipment status: {} to {}", shipmentId, status);
 
            Shipment.ShipmentStatus shipmentStatus = Shipment.ShipmentStatus.valueOf(status.toUpperCase());
            shippingService.updateShipmentStatus(shipmentId, shipmentStatus);
 
            Shipment updated = shipmentRepository.findById(shipmentId)
                    .orElseThrow(() -> new RuntimeException("Shipment not found"));
 
            return ResponseEntity.ok(ApiResponse.<ShippingDTO>builder()
                    .success(true)
                    .message("Shipment status updated successfully")
                    .data(convertEntityToDto(updated))
                    .timestamp(LocalDateTime.now())
                    .build());
 
        } catch (Exception e) {
            log.error("Error updating shipment status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.<ShippingDTO>builder()
                            .success(false)
                            .message(e.getMessage())
                            .timestamp(LocalDateTime.now())
                            .build());
        }
    }
 
    private ShippingDTO convertEntityToDto(Shipment shipment) {
        return ShippingDTO.builder()
                .id(shipment.getId())
                .orderId(shipment.getOrderId())
                .trackingNumber(shipment.getTrackingNumber())
                .carrier(shipment.getCarrier())
                .status(shipment.getStatus().toString())
                .shippingAddress(shipment.getShippingAddress())
                .estimatedDelivery(shipment.getEstimatedDelivery())
                .actualDelivery(shipment.getActualDelivery())
                .build();
    }
}
 