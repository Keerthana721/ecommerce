package org.example.invoiceservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.invoiceservice.common.InvoiceStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
 
@Entity
@Table(name = "invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @Column(name = "order_id", nullable = false)
    private Long orderId;
 
    @Column(name = "invoice_number", unique = true)
    private String invoiceNumber;
 
    @Column(nullable = false)
    private BigDecimal totalAmount;
 
    @Column(name = "invoice_status")
    @Enumerated(EnumType.STRING)
    private InvoiceStatus status = InvoiceStatus.DRAFT;
 
    @Column(name = "issued_date")
    private LocalDateTime issuedDate;
 
    @Column(name = "due_date")
    private LocalDateTime dueDate;
 
    @Column(name = "pdf_path")
    private String pdfPath;
 
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
 
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
 

}