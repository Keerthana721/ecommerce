package org.example.orderservice.common;

public enum EventType {
        ORDER_CREATED,
        INVENTORY_RESERVED,
        INVENTORY_FAILED,
        PAYMENT_PROCESSED,
        PAYMENT_FAILED,
        INVOICE_GENERATED,
        INVOICE_FAILED,
        SHIPMENT_CREATED,
        SHIPMENT_FAILED,
        ORDER_COMPLETED,
        ORDER_FAILED,
        COMPENSATION_INITIATED,
        ORDER_CANCELLED
    }