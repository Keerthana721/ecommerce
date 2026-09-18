package org.example.invoiceservice.controller;

import org.example.invoiceservice.model.Invoice;
import org.example.invoiceservice.repository.InvoiceRepository;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(InvoiceController.class)
@AutoConfigureMockMvc(addFilters = false)
public class InvoiceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private InvoiceRepository invoiceRepository;

    @Test
    public void testGetInvoiceByOrderId_Success() throws Exception {
        Invoice mockInvoice = new Invoice();
        mockInvoice.setId(1L);
        mockInvoice.setOrderId(50L);
        mockInvoice.setInvoiceNumber("INV-2026-001");
        mockInvoice.setTotalAmount(new BigDecimal("299.99"));
        mockInvoice.setStatus(org.example.invoiceservice.common.InvoiceStatus.PAID);
        mockInvoice.setIssuedDate(LocalDateTime.now());
        mockInvoice.setDueDate(LocalDateTime.now().plusDays(30));

        Mockito.when(invoiceRepository.findByOrderId(50L)).thenReturn(mockInvoice);

        mockMvc.perform(get("/api/invoices/order/50")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Invoice retrieved successfully"))
                .andExpect(jsonPath("$.data.invoiceNumber").value("INV-2026-001"))
                .andExpect(jsonPath("$.data.status").value("PAID"));
    }
}
