package org.example.paymentservice.shareddto;

public class OrderFailedEvent extends
        PaymentProcessedEvent {

    private String message;

    public OrderFailedEvent(Long orderId, String message) {
        super(orderId); // call parent constructor
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
}
