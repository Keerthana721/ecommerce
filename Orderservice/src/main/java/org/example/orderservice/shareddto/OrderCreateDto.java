package org.example.orderservice.shareddto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderCreateDto {

//    @NotNull(message = "Product Id is required")
    private Long productId;

//    @NotNull(message = "Quantity is required")
//    @Min(value = 1, message = "Quantity must be greater than 0")
    private Integer quantity;

//    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;
}