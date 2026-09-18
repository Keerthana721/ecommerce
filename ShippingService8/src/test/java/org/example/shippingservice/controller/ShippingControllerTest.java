package org.example.shippingservice.controller;

import org.example.shippingservice.model.Shipment;
import org.example.shippingservice.repository.ShipmentRepository;
import org.example.shippingservice.service.ShippingService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ShippingController.class)
@AutoConfigureMockMvc(addFilters = false)
public class ShippingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ShipmentRepository shipmentRepository;

    @MockitoBean
    private ShippingService shippingService;

    @Test
    public void testGetShipmentByOrderId_Success() throws Exception {
        Shipment mockShipment = Shipment.builder()
                .id(1L)
                .orderId(10L)
                .trackingNumber("TRK-TEST-999")
                .carrier("FEDEX")
                .status(org.example.shippingservice.common.ShipmentStatus.SHIPPED)
                .estimatedDelivery(LocalDateTime.now().plusDays(3))
                .createdAt(LocalDateTime.now())
                .build();

        Mockito.when(shipmentRepository.findByOrderId(10L)).thenReturn(mockShipment);

        mockMvc.perform(get("/api/shipping/order/10")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Shipment retrieved successfully"))
                .andExpect(jsonPath("$.data.trackingNumber").value("TRK-TEST-999"))
                .andExpect(jsonPath("$.data.status").value("SHIPPED"));
    }
}
