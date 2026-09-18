package org.example.invoiceservice.controller;

import lombok.extern.slf4j.Slf4j;
import org.example.invoiceservice.model.Invoice;
import org.example.invoiceservice.repository.InvoiceRepository;
import org.example.invoiceservice.shareddto.ApiResponse;
import org.example.invoiceservice.shareddto.InvoiceDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/invoices")
//@Tag(name = "Invoice Management", description = "Invoice generation and management")
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class InvoiceController {
 
    @Autowired
    private InvoiceRepository invoiceRepository;
 
    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
//    @Operation(summary = "Get invoice by order ID")
    public ResponseEntity<ApiResponse<InvoiceDTO>> getInvoiceByOrderId(@PathVariable Long orderId) {
        try {
            log.info("Fetching invoice for order: {}", orderId);
 
            Invoice invoice = invoiceRepository.findByOrderId(orderId);
            if (invoice == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.<InvoiceDTO>builder()
                                .success(false)
                                .message("Invoice not found for order")
                                .timestamp(LocalDateTime.now())
                                .build());
            }
 
            return ResponseEntity.ok(ApiResponse.<InvoiceDTO>builder()
                    .success(true)
                    .message("Invoice retrieved successfully")
                    .data(convertEntityToDto(invoice))
                    .timestamp(LocalDateTime.now())
                    .build());
 
        } catch (Exception e) {
            log.error("Error fetching invoice: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<InvoiceDTO>builder()
                            .success(false)
                            .message(e.getMessage())
                            .timestamp(LocalDateTime.now())
                            .build());
        }
    }
 
    private InvoiceDTO convertEntityToDto(Invoice invoice) {
        return InvoiceDTO.builder()
                .id(invoice.getId())
                .orderId(invoice.getOrderId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .totalAmount(invoice.getTotalAmount().doubleValue())
                .status(String.valueOf(invoice.getStatus()))
                .issuedDate(invoice.getIssuedDate())
                .dueDate(invoice.getDueDate())
                .build();
    }
}