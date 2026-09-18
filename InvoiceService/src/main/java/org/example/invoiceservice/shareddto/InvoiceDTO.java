package org.example.invoiceservice.shareddto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class InvoiceDTO {
    private Long id;
    private Long orderId;
    private String invoiceNumber;
    private Double totalAmount;
    private String status;
    private LocalDateTime issuedDate;
    private LocalDateTime dueDate;
}