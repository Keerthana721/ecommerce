package org.example.inventoryservice.repository;

import org.example.inventoryservice.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {


    Inventory findByProduct_Id(Long productId);//    List<Inventory> findByQuantityLessThan(Integer minStockLevel);
//    List<Inventory> findByWarehouseLocation(String warehouseLocation);
}