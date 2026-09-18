package org.example.userservice.client;

import org.example.userservice.shareddto.EmailSendRequest;
import org.example.userservice.shareddto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "NOTIFICATION-SERVICE")
public interface NotificationClient {

    @PostMapping("/api/notifications/send-email")
    ApiResponse sendEmail(@RequestBody EmailSendRequest request);
}
