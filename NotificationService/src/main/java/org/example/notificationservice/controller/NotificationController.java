package org.example.notificationservice.controller;

import lombok.extern.slf4j.Slf4j;
import org.example.notificationservice.common.ApiResponse;
import org.example.notificationservice.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/notifications")
//@Tag(name = "Notifications", description = "Notification Management")
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {
 
    @Autowired
    private NotificationService notificationService;
 
    @GetMapping("/health")
    @PreAuthorize("hasAnyRole('ADMIN', 'NOTIFICATION_MANAGER')")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Notification Service is running")
                .timestamp(LocalDateTime.now())
                .build());
    }

    @PostMapping("/send-email")
    public ResponseEntity<?> sendCustomEmail(@RequestBody org.example.notificationservice.dto.EmailSendRequest request) {
        notificationService.sendCustomEmail(request.getToEmail(), request.getSubject(), request.getBody());
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Email request received and processed")
                .timestamp(LocalDateTime.now())
                .build());
    }

//    @GetMapping("/health")
//    public ResponseEntity<ApiResponse> health() {
//
//        ApiResponse response = new ApiResponse(
//                true,
//                "Notification Service is running"
//        );
//
//        return ResponseEntity.ok(response);
//    }
}