package org.example.orderservice.service;


import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.example.orderservice.model.Inventory;
import org.example.orderservice.model.Product;
import org.example.orderservice.repository.InventoryRepository;
import org.example.orderservice.shareddto.InventoryResponseDto;
import org.example.orderservice.shareddto.InventoryUpdateDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@Transactional
public class InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private ProductService productService;

    public InventoryResponseDto createInventory(InventoryUpdateDto dto) {
        Product product = productService.getProductEntity(dto.getProductId());

        if (inventoryRepository.findByProductId(dto.getProductId()).isPresent()) {
            throw new RuntimeException("Inventory already exists for this product!");
        }

        Inventory inventory = new Inventory();
        inventory.setProduct(product);
        inventory.setQuantity(dto.getQuantity());
        inventory.setMinStockLevel(dto.getMinStockLevel());
        inventory.setMaxStockLevel(dto.getMaxStockLevel());
        inventory.setWarehouseLocation(dto.getWarehouseLocation());
        inventory.setLastRestocked(LocalDateTime.now());
        inventory.setCreatedAt(LocalDateTime.now());

        Inventory savedInventory = inventoryRepository.save(inventory);
        log.info("Inventory created for product: {}", product.getId());
        return convertToDto(savedInventory);
    }

    public InventoryResponseDto getInventoryById(Long id) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Inventory not found with id: " + id));
        return convertToDto(inventory);
    }

    public InventoryResponseDto getInventoryByProductId(Long productId) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new EntityNotFoundException("Inventory not found for product id: " + productId));
        return convertToDto(inventory);
    }

    public List<InventoryResponseDto> getAllInventory() {
        return inventoryRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<InventoryResponseDto> getLowStockItems() {
        return inventoryRepository.findAll().stream()
                .filter(inv -> inv.getQuantity() <= inv.getMinStockLevel())
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<InventoryResponseDto> getInventoryByWarehouse(String warehouseLocation) {
        return inventoryRepository.findByWarehouseLocation(warehouseLocation).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public InventoryResponseDto updateInventory(Long id, InventoryUpdateDto dto) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Inventory not found with id: " + id));

        inventory.setQuantity(dto.getQuantity());
        inventory.setMinStockLevel(dto.getMinStockLevel());
        inventory.setMaxStockLevel(dto.getMaxStockLevel());
        inventory.setWarehouseLocation(dto.getWarehouseLocation());
        inventory.setUpdatedAt(LocalDateTime.now());

        Inventory updatedInventory = inventoryRepository.save(inventory);
        log.info("Inventory updated: {}", id);
        return convertToDto(updatedInventory);
    }

    public InventoryResponseDto updateStock(Long productId, Integer quantity) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new EntityNotFoundException("Inventory not found for product id: " + productId));

        inventory.setQuantity(inventory.getQuantity() + quantity);
        inventory.setLastRestocked(LocalDateTime.now());
        inventory.setUpdatedAt(LocalDateTime.now());

        Inventory updatedInventory = inventoryRepository.save(inventory);
        log.info("Stock updated for product: {}, new quantity: {}", productId, inventory.getQuantity());
        return convertToDto(updatedInventory);
    }

    public boolean hasStock(Long productId, Integer requiredQuantity) {
        return inventoryRepository.findByProductId(productId)
                .map(inv -> inv.getQuantity() >= requiredQuantity)
                .orElse(false);
    }

    public void decreaseStock(Long productId, Integer quantity) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new EntityNotFoundException("Inventory not found for product id: " + productId));

        if (inventory.getQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock for product: " + productId);
        }

        inventory.setQuantity(inventory.getQuantity() - quantity);
        inventory.setUpdatedAt(LocalDateTime.now());
        inventoryRepository.save(inventory);
        log.info("Stock decreased for product: {}, quantity: {}", productId, quantity);
    }

    private InventoryResponseDto convertToDto(Inventory inventory) {
        InventoryResponseDto dto = new InventoryResponseDto();
        dto.setId(inventory.getId());
        dto.setProductId(inventory.getProduct().getId());
        dto.setProductName(inventory.getProduct().getName());
        dto.setQuantity(inventory.getQuantity());
        dto.setMinStockLevel(inventory.getMinStockLevel());
        dto.setMaxStockLevel(inventory.getMaxStockLevel());
        dto.setWarehouseLocation(inventory.getWarehouseLocation());
        return dto;
    }
}