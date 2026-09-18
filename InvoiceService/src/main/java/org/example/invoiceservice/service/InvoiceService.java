package org.example.invoiceservice.service;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.example.invoiceservice.common.InvoiceStatus;
import org.example.invoiceservice.dto.OrderFailedEvent;
import org.example.invoiceservice.model.Invoice;
import org.example.invoiceservice.repository.InvoiceRepository;
import org.example.invoiceservice.shareddto.OrderCreatedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Slf4j
@Transactional
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    public void generateInvoice(OrderCreatedEvent orderEvent) {
        try {
            log.info("Generating invoice for order {}", orderEvent.getOrderId());

            Invoice invoice = createInvoice(orderEvent);

            invoiceRepository.save(invoice);

            generatePDF(invoice, orderEvent);

            kafkaTemplate.send("invoice-generated-topic", orderEvent);

        } catch (Exception e) {
            log.error("Invoice generation failed", e);

            kafkaTemplate.send(
                    "order-failed-topic",
                    new OrderFailedEvent(
                            orderEvent.getOrderId(),
                            e.getMessage()
                    )
            );
        }
    }

    private Invoice createInvoice(OrderCreatedEvent event) {
        String invoiceNumber =
                "INV_" + UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase();

        return Invoice.builder()
                .orderId(event.getOrderId())
                .invoiceNumber(invoiceNumber)
                .totalAmount(BigDecimal.valueOf(event.getTotalAmount()))
                .status(InvoiceStatus.ISSUED)
                .issuedDate(LocalDateTime.now())
                .dueDate(LocalDateTime.now().plusDays(30))
                .createdAt(LocalDateTime.now())
                .build();
    }

    private void generatePDF(Invoice invoice, OrderCreatedEvent event) {
        String path = "/invoices/" + invoice.getInvoiceNumber() + ".pdf";
        invoice.setPdfPath(path);
        invoiceRepository.save(invoice);
    }
}