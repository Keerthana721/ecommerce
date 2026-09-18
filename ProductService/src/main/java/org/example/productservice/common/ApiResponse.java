package org.example.productservice.common;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class ApiResponse {
    private Boolean success;
    private String message;
    private Object data;
 
    public ApiResponse(Boolean success, String message) {
        this.success = success;
        this.message = message;
    }
}