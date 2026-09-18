package org.example.productservice.dto;

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
    private Integer quantity;
    private BigDecimal discountPrice;
    private String imageUrl;
}
 