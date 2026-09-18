package org.example.orderservice.router;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.example.orderservice.shareddto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service", url = "http://user-service:8001")
public interface UserServiceClient {
 
    @GetMapping("/api/users/{id}")
    @CircuitBreaker(name = "userService", fallbackMethod = "getUserByIdFallback")
    @Retry(name = "userService")
    UserDTO getUserById(@PathVariable Long id);
 
    default UserDTO getUserByIdFallback(Long id, Exception ex) {
        return UserDTO.builder()
                .id(id)
                .email("unknown@example.com")
                .build();
    }
}
 
