package org.example.orderservice.shareddto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryResponseDto {

    private Long id;

    private Long productId;

    private String productName;

    private Integer quantity;

    private Integer minStockLevel;

    private Integer maxStockLevel;

    private String warehouseLocation;
}