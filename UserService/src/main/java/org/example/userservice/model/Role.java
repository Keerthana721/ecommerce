package org.example.userservice.model;

public enum Role {
    CONSUMER("Consumer - End User / Customer Access"),
    MANAGER("Manager - Intermediate Access"),
    ADMIN("Admin - Full Access");

    private final String description;

    Role(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}