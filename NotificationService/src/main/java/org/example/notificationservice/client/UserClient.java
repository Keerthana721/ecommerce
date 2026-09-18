package org.example.notificationservice.client;

import org.example.notificationservice.common.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "USER-SERVICE")
public interface UserClient {

    @GetMapping("/users/internal/email")
    ApiResponse getEmailByUserId(@RequestParam("userId") Long userId);
}
