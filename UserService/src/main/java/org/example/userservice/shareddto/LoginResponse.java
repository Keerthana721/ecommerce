package org.example.userservice.shareddto;

import lombok.AllArgsConstructor;
import lombok.Data;

import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {
    private int id;
    private String token;
    private String message;
    private boolean success;
    private String role;
    private String email;
    private String username;

    public LoginResponse(int id,String token, String message, boolean success) {
        this.id = id;
        this.token = token;
        this.message = message;
        this.success = success;
    }


}


