package org.example.notificationservice.service;


import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.example.notificationservice.common.NotificationStatus;
import org.example.notificationservice.common.NotificationType;
import org.example.notificationservice.event.OrderCompletedEvent;
import org.example.notificationservice.event.ShipmentCreatedEvent;
import org.example.notificationservice.model.Notification;
import org.example.notificationservice.repository.NotificationRepository;
import org.example.notificationservice.client.UserClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Slf4j
@Transactional
public class NotificationService {
 
    @Autowired
    private NotificationRepository notificationRepository;
 
    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private UserClient userClient;

    private String fetchUserEmail(Long userId) {
        if (userId == null) return "noreply@ecommerce.com";
        try {
            org.example.notificationservice.common.ApiResponse response = userClient.getEmailByUserId(userId);
            if (response != null && response.getSuccess() && response.getData() != null) {
                return (String) response.getData();
            }
        } catch (Exception e) {
            log.error("Failed to fetch user email for userId {} via Feign client: {}", userId, e.getMessage());
        }
        return "customer@gmail.com"; // sensible default fallback
    }
 
    @Async
    public void sendShipmentNotification(ShipmentCreatedEvent event) {
        try {
            log.info("Sending shipment notification for order: {}", event.getOrderId());
 
            String subject = "Your Order is on its Way!";
            String message = buildShipmentMessage(event);
            String email = fetchUserEmail(event.getUserId());
 
            Notification notification = Notification.builder()
                    .userId(event.getUserId())
                    .email(email)
                    .type(NotificationType.SHIPMENT_READY)
                    .subject(subject)
                    .message(message)
                    .status(NotificationStatus.PENDING)
                    .createdAt(LocalDateTime.now())
                    .build();
 
            sendEmailNotification(notification);
            sendSMSNotification(event.getUserId(), message);
 
            notification.setStatus(NotificationStatus.SENT);
            notification.setSentAt(LocalDateTime.now());
            notificationRepository.save(notification);
 
            log.info("Shipment notification sent for order: {}", event.getOrderId());
 
        } catch (Exception e) {
            log.error("Error sending shipment notification: {}", e.getMessage());
        }
    }
 
    @Async
    public void sendOrderCompletedNotification(OrderCompletedEvent event) {
        try {
            log.info("Sending order completed notification for order: {}", event.getOrderId());
 
            String subject = "Order Delivered Successfully!";
            String message = buildOrderCompletedMessage(event);
            String email = event.getCustomerEmail();
            if (email == null) {
                email = fetchUserEmail(event.getUserId());
            }
 
            Notification notification = Notification.builder()
                    .userId(event.getUserId())
                    .email(email)
                    .type(NotificationType.ORDER_COMPLETED)
                    .subject(subject)
                    .message(message)
                    .status(NotificationStatus.PENDING)
                    .createdAt(LocalDateTime.now())
                    .build();
 
            sendEmailNotification(notification);
            sendSMSNotification(event.getUserId(), message);
 
            notification.setStatus(NotificationStatus.SENT);
            notification.setSentAt(LocalDateTime.now());
            notificationRepository.save(notification);
 
            log.info("Order completed notification sent for order: {}", event.getOrderId());
 
        } catch (Exception e) {
            log.error("Error sending order completed notification: {}", e.getMessage());
        }
    }
 
    private void sendEmailNotification(Notification notification) {
        try {
            if (mailSender != null) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(notification.getEmail());
                message.setSubject(notification.getSubject());
                message.setText(notification.getMessage());
                message.setFrom("noreply@ecommerce.com");
                
                mailSender.send(message);
                log.info("Email sent to: {}", notification.getEmail());
            }
        } catch (Exception e) {
            log.error("Error sending email: {}", e.getMessage());
        }
    }
 
    private void sendSMSNotification(Long userId, String message) {
        try {
            // Integrate with SMS provider like Twilio
            log.info("SMS notification would be sent for user: {} - Message: {}", userId, message);
        } catch (Exception e) {
            log.error("Error sending SMS: {}", e.getMessage());
        }
    }
 
    private String buildShipmentMessage(ShipmentCreatedEvent event) {
        return String.format(
                "Your order #%d has been shipped!\n" +
                "Tracking Number: %s\n" +
                "Carrier: %s\n" +
                "Estimated Delivery: 3-5 business days\n" +
                "Track your shipment online for real-time updates.",
                event.getOrderId(),
                event.getTrackingNumber(),
                event.getCarrier()
        );
    }
 
    private String buildOrderCompletedMessage(OrderCompletedEvent event) {
        return String.format(
                "Your order #%d has been delivered!\n" +
                "Total Amount: $%.2f\n" +
                "Thank you for your purchase!\n" +
                "If you have any questions, please contact our support team.",
                event.getOrderId(),
                event.getTotalAmount()
        );
    }

    public void sendCustomEmail(String toEmail, String subject, String body) {
        try {
            if (mailSender != null) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(toEmail);
                message.setSubject(subject);
                message.setText(body);
                message.setFrom("noreply@ecommerce.com");
                mailSender.send(message);
                log.info("Custom email sent successfully to: {}", toEmail);
            } else {
                log.warn("[Simulation] MailSender is offline. Custom Email to {}: Subject: {}, Body: {}", toEmail, subject, body);
            }
        } catch (Exception e) {
            log.error("Failed to send custom email to {}: {}", toEmail, e.getMessage());
        }
    }
}