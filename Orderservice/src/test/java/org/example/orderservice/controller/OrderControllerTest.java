//package org.example.orderservice.controller;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import org.example.orderservice.model.Order;
//import org.example.orderservice.service.OrderService;
//import org.example.orderservice.shareddto.OrderDTO;
//import org.example.orderservice.shareddto.OrderItemDTO;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.mockito.Mockito;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
//import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
//import org.springframework.http.MediaType;
//import org.springframework.test.context.bean.override.mockito.MockitoBean;
//import org.springframework.test.web.servlet.MockMvc;
//
//import java.math.BigDecimal;
//import java.util.Collections;
//
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.anyList;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
//
//@WebMvcTest(OrderController.class)
//@AutoConfigureMockMvc(addFilters = false)
//public class OrderControllerTest {
//
//    @Autowired
//    private MockMvc mockMvc;
//
//    @MockitoBean
//    private OrderService orderService;
//
//    @Autowired
//    private ObjectMapper objectMapper;
//
//    private Order mockOrder;
//
//    @BeforeEach
//    void setUp() {
//        mockOrder = new Order();
//        mockOrder.setId(1L);
//        mockOrder.setUserId(10L);
//        mockOrder.setTotalAmount(new BigDecimal("150.00"));
//        mockOrder.setShippingAddress("123 Street City");
//        mockOrder.setStatus(org.example.orderservice.common.OrderStatus.PENDING);
//    }
//
//    @Test
//    public void testPlaceOrder_Success() throws Exception {
//        OrderDTO orderDto = new OrderDTO();
//        orderDto.setUserId(10L);
//        orderDto.setTotalAmount(new BigDecimal("150.00"));
//        orderDto.setShippingAddress("123 Street City");
//
//        OrderItemDTO itemDto = new OrderItemDTO();
//        itemDto.setProductId(101L);
//        itemDto.setQuantity(2);
//        itemDto.setPrice(new BigDecimal("75.00"));
//        orderDto.setItems(Collections.singletonList(itemDto));
//
//        Mockito.when(orderService.createOrder(any(Order.class), anyList())).thenReturn(mockOrder);
//
//        mockMvc.perform(post("/orders/place")
//                .contentType(MediaType.APPLICATION_JSON)
//                .content(objectMapper.writeValueAsString(orderDto))
//                .header("X-User-Id", "10"))
//                .andExpect(status().isCreated())
//                .andExpect(jsonPath("$.success").value(true))
//                .andExpect(jsonPath("$.message").value("Order created successfully. Saga orchestration started..."))
//                .andExpect(jsonPath("$.data.id").value(1));
//    }
//}
