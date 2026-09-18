package org.example.orderservice.common;

public enum Role {
    ADMIN("Admin - Full Access"),
    SECOND_LEVEL_USER("Second Level User - Limited Access"),
    THIRD_LEVEL_USER("Third Level User - View Only");

    private final String description;

    Role(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}