package org.example.inventoryservice.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class InventoryResponseDto {
    private Long id;
    private Long productId;
    private String productName;
    private Integer quantity;
    private Integer minStockLevel;
    private Integer maxStockLevel;
    private String warehouseLocation;
}