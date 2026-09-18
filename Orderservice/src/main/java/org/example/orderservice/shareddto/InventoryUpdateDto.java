package org.example.orderservice.shareddto;

//import jakarta.validation.constraints.Min;
//import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryUpdateDto {

//    @NotNull(message = "Product Id is required")
    private Long productId;

//    @NotNull(message = "Quantity is required")
//    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantity;

//    @Min(value = 0, message = "Minimum stock level cannot be negative")
    private Integer minStockLevel;

//    @Min(value = 0, message = "Maximum stock level cannot be negative")
    private Integer maxStockLevel;

    private String warehouseLocation;
}