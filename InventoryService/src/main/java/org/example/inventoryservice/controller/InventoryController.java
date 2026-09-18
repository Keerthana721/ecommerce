package org.example.inventoryservice.controller;

import lombok.extern.slf4j.Slf4j;
import org.example.inventoryservice.model.Inventory;
import org.example.inventoryservice.repository.InventoryRepository;
import org.example.inventoryservice.service.InventoryService;
import org.example.inventoryservice.shareddto.ApiResponse;
import org.example.inventoryservice.shareddto.InventoryDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/inventory")
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class InventoryController {

    @Autowired
    private InventoryRepository inventoryRepository;

    @PostMapping("/reserve")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_MANAGER')")
    public ResponseEntity<ApiResponse<InventoryDTO>> reserveInventory(
            @RequestBody InventoryDTO inventoryDTO) {

        try {
            Inventory inventory =
                    inventoryRepository.findByProduct_Id(
                            inventoryDTO.getProductId());

            if (inventory == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.<InventoryDTO>builder()
                                .success(false)
                                .message("Product not found")
                                .timestamp(LocalDateTime.now())
                                .build());
            }

            inventory.reserve(inventoryDTO.getQuantity());

            Inventory updated = inventoryRepository.save(inventory);

            return ResponseEntity.ok(
                    ApiResponse.<InventoryDTO>builder()
                            .success(true)
                            .message("Inventory reserved")
                            .data(convertEntityToDto(updated))
                            .timestamp(LocalDateTime.now())
                            .build()
            );

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.<InventoryDTO>builder()
                            .success(false)
                            .message(e.getMessage())
                            .timestamp(LocalDateTime.now())
                            .build());
        }
    }

    @PostMapping("/release")
    public ResponseEntity<ApiResponse<InventoryDTO>> releaseInventory(
            @RequestBody InventoryDTO inventoryDTO) {

        try {
            Inventory inventory =
                    inventoryRepository.findByProduct_Id(
                            inventoryDTO.getProductId());

            if (inventory == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.<InventoryDTO>builder()
                                .success(false)
                                .message("Product not found")
                                .timestamp(LocalDateTime.now())
                                .build());
            }

            inventory.releaseReserve(inventoryDTO.getQuantity());

            Inventory updated = inventoryRepository.save(inventory);

            return ResponseEntity.ok(
                    ApiResponse.<InventoryDTO>builder()
                            .success(true)
                            .message("Inventory released")
                            .data(convertEntityToDto(updated))
                            .timestamp(LocalDateTime.now())
                            .build()
            );

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.<InventoryDTO>builder()
                            .success(false)
                            .message(e.getMessage())
                            .timestamp(LocalDateTime.now())
                            .build());
        }
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<InventoryDTO>> getInventory(
            @PathVariable Long productId) {

        Inventory inventory =
                inventoryRepository.findByProduct_Id(productId);

        if (inventory == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.<InventoryDTO>builder()
                            .success(false)
                            .message("Inventory not found")
                            .timestamp(LocalDateTime.now())
                            .build());
        }

        return ResponseEntity.ok(
                ApiResponse.<InventoryDTO>builder()
                        .success(true)
                        .message("Success")
                        .data(convertEntityToDto(inventory))
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    private InventoryDTO convertEntityToDto(Inventory inventory) {
        return InventoryDTO.builder()
                .id(inventory.getId())
                .productId(inventory.getProductId())
                .quantity(inventory.getQuantity())
                .reservedQuantity(inventory.getReservedQuantity())
                .availableQuantity(inventory.getAvailableQuantity())
                .lastUpdated(inventory.getUpdatedAt())
                .build();
    }
}