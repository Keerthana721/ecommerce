package org.example.inventoryservice.dto;

import lombok.*;

// Inventory DTOs
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class InventoryUpdateDto {
    private Long productId;
    private Integer quantity;
    private Integer minStockLevel;
    private Integer maxStockLevel;
    private String warehouseLocation;
}