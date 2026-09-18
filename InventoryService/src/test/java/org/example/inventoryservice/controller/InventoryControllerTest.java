package org.example.inventoryservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.inventoryservice.model.Inventory;
import org.example.inventoryservice.repository.InventoryRepository;
import org.example.inventoryservice.shareddto.InventoryDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(InventoryController.class)
@AutoConfigureMockMvc(addFilters = false)
public class InventoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private InventoryRepository inventoryRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Inventory mockInventory;

    @BeforeEach
    void setUp() {
        mockInventory = new Inventory();
        mockInventory.setId(1L);
        mockInventory.setProductId(101L);
        mockInventory.setQuantity(50);
        mockInventory.setReservedQuantity(5);
        mockInventory.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    public void testGetInventory_Success() throws Exception {
        Mockito.when(inventoryRepository.findByProduct_Id(101L)).thenReturn(mockInventory);

        mockMvc.perform(get("/api/inventory/product/101")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Success"))
                .andExpect(jsonPath("$.data.productId").value(101))
                .andExpect(jsonPath("$.data.quantity").value(50))
                .andExpect(jsonPath("$.data.availableQuantity").value(45));
    }

    @Test
    public void testReserveInventory_Success() throws Exception {
        InventoryDTO reserveDto = InventoryDTO.builder()
                .productId(101L)
                .quantity(5)
                .build();

        Mockito.when(inventoryRepository.findByProduct_Id(101L)).thenReturn(mockInventory);
        Mockito.when(inventoryRepository.save(Mockito.any(Inventory.class))).thenReturn(mockInventory);

        mockMvc.perform(post("/api/inventory/reserve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reserveDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Inventory reserved"))
                .andExpect(jsonPath("$.data.reservedQuantity").value(10)); // 5 existing + 5 new
    }
}
