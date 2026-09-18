package org.example.shippingservice.shareddto;

public class OrderFailedEvent extends ShipmentCreatedEvent {

    private String message;

    public OrderFailedEvent(Long orderId, String message) {
        super(orderId); // call parent constructor
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
}
