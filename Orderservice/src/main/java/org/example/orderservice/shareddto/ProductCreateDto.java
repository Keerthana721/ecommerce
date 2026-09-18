package org.example.orderservice.shareddto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class ProductCreateDto {
    private String name;
    private String description;
    private BigDecimal price;
    private String sku;
    private String category;
}
 