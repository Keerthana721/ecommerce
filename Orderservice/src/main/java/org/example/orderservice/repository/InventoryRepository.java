package org.example.orderservice.repository;

import org.example.orderservice.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByProductId(Long productId);
//    List<Inventory> findByQuantityLessThan(Integer minStockLevel);
    List<Inventory> findByWarehouseLocation(String warehouseLocation);
}