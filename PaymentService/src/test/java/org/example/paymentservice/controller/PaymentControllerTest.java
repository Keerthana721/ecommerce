package org.example.paymentservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.paymentservice.dto.PaymentProcessRequest;
import org.example.paymentservice.model.Payment;
import org.example.paymentservice.repository.PaymentRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PaymentController.class)
@AutoConfigureMockMvc(addFilters = false)
public class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PaymentRepository paymentRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testProcessPayment_Success() throws Exception {
        PaymentProcessRequest request = new PaymentProcessRequest();
        request.setOrderId(1L);
        request.setAmount(new BigDecimal("150.00"));
        request.setPaymentMethod("CREDIT_CARD");

        Payment mockPayment = Payment.builder()
                .id(1L)
                .orderId(1L)
                .amount(new BigDecimal("150.00"))
                .paymentMethod("CREDIT_CARD")
                .status(org.example.paymentservice.common.PaymentStatus.COMPLETED)
                .transactionId("TXN-12345")
                .createdAt(LocalDateTime.now())
                .build();

        Mockito.when(paymentRepository.save(Mockito.any(Payment.class))).thenReturn(mockPayment);

        mockMvc.perform(post("/api/payments/process")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Payment processed successfully!"))
                .andExpect(jsonPath("$.data.transactionId").value("TXN-12345"))
                .andExpect(jsonPath("$.data.status").value("COMPLETED"));
    }
}
