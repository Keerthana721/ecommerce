package org.example.invoiceservice.router;


import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.example.invoiceservice.shareddto.InventoryDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "inventory-service", url = "http://inventory-service:8003")
public interface InventoryServiceClient {

    @PostMapping("/api/inventory/reserve")
    @CircuitBreaker(name = "inventoryService", fallbackMethod = "reserveInventoryFallback")
    @Retry(name = "inventoryService")
    InventoryDTO reserveInventory(@RequestBody InventoryDTO inventoryDTO);

    @PostMapping("/api/inventory/release")
    @CircuitBreaker(name = "inventoryService", fallbackMethod = "releaseInventoryFallback")
    @Retry(name = "inventoryService")
    void releaseInventory(@RequestBody InventoryDTO inventoryDTO);

    default InventoryDTO reserveInventoryFallback(InventoryDTO dto, Exception ex) {
        throw new RuntimeException("Inventory service unavailable: " + ex.getMessage());
    }

    default void releaseInventoryFallback(InventoryDTO dto, Exception ex) {
        throw new RuntimeException("Inventory service unavailable: " + ex.getMessage());
    }
}
