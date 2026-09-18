package org.example.orderservice.shareddto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class OrderResponseDto {

    private Long id;

    private Long userId;

    private String userName;

    private Long productId;

    private String productName;

    private Integer quantity;

    private BigDecimal totalPrice;

    private String orderStatus;

    private String shippingAddress;

    private LocalDateTime orderDate;
}