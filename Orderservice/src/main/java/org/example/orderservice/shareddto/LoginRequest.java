package org.example.orderservice.shareddto;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
}