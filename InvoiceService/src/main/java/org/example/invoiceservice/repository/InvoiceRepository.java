package org.example.invoiceservice.repository;

import org.example.invoiceservice.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Invoice findByOrderId(Long orderId);
    Invoice findByInvoiceNumber(String invoiceNumber);
}