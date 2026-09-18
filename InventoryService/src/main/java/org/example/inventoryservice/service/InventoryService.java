package org.example.inventoryservice.service;

import lombok.extern.slf4j.Slf4j;
import org.example.inventoryservice.model.Inventory;
import org.example.inventoryservice.repository.InventoryRepository;
import org.example.inventoryservice.shareddto.OrderCreatedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@Slf4j
@Transactional
public class InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    public void reserveInventory(OrderCreatedEvent event) {
        try {
            log.info("Reserving inventory for order {}", event.getOrderId());

            event.getItems().forEach(item -> {

                Inventory inventory =
                        inventoryRepository.findByProduct_Id(item.getProductId());

                if (inventory == null) {
                    throw new RuntimeException(
                            "Product not found: " + item.getProductId()
                    );
                }

                inventory.reserve(item.getQuantity());

                inventoryRepository.save(inventory);

                log.info("Reserved {} units for product {}",
                        item.getQuantity(),
                        item.getProductId());
            });

            kafkaTemplate.send("inventory-reserved-topic", event);

        } catch (Exception e) {
            log.error("Inventory reserve failed", e);
            throw e;
        }
    }

    public void releaseInventory(OrderCreatedEvent event) {

        event.getItems().forEach(item -> {

            Inventory inventory =
                    inventoryRepository.findByProduct_Id(item.getProductId());

            if (inventory != null) {
                inventory.releaseReserve(item.getQuantity());
                inventoryRepository.save(inventory);
            }
        });
    }
}