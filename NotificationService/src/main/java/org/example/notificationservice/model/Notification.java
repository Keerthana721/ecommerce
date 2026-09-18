package org.example.notificationservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.notificationservice.common.NotificationStatus;
import org.example.notificationservice.common.NotificationType;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @Column(name = "user_id")
    private Long userId;
 
    @Column(name = "email")
    private String email;
 
    @Column(name = "notification_type")
    @Enumerated(EnumType.STRING)
    private NotificationType type;
 
    @Column(name = "subject")
    private String subject;

    @Lob
    private String message;
 
    @Column(name = "notification_status")
    @Enumerated(EnumType.STRING)
    private NotificationStatus status = NotificationStatus.PENDING;
 
    @Column(name = "created_at")
    private LocalDateTime createdAt=LocalDateTime.now() ;
 
    @Column(name = "sent_at")
    private LocalDateTime sentAt;
 

}