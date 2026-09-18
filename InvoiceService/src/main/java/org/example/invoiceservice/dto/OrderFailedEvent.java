package org.example.invoiceservice.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class OrderFailedEvent {
    private Long orderId;
    private String message;
    public OrderFailedEvent(Long orderId, String message) {
        this.orderId = orderId;
        this.message = message;
    }
}
