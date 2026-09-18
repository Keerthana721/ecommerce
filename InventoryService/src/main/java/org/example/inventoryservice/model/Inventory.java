package org.example.inventoryservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id")
    private Product product;

    private Integer quantity;

    private Integer reservedQuantity = 0;

    private LocalDateTime updatedAt = LocalDateTime.now();

    public Long getProductId() {
        return product.getId();
    }

    public Integer getAvailableQuantity() {
        return quantity - reservedQuantity;
    }

    public void reserve(Integer qty) {
        if (getAvailableQuantity() < qty) {
            throw new RuntimeException("Insufficient stock");
        }
        reservedQuantity += qty;
        updatedAt = LocalDateTime.now();
    }

    public void releaseReserve(Integer qty) {
        reservedQuantity -= qty;

        if (reservedQuantity < 0) {
            reservedQuantity = 0;
        }

        updatedAt = LocalDateTime.now();
    }
}