package org.example.notificationservice.event;

import lombok.extern.slf4j.Slf4j;
import org.example.notificationservice.common.NotificationStatus;
import org.example.notificationservice.common.NotificationType;
import org.example.notificationservice.model.Notification;
import org.example.notificationservice.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@Slf4j
public class NotificationKafkaEventListener {

    @Autowired
    private NotificationRepository notificationRepository;

    @KafkaListener(topics = {"order-created-topic", "payment-processed-topic"}, groupId = "notification-group")
    public void consumeOrderEvent(String eventData) {
        try {
            log.info("📩 [KAFKA CONSUMER] Received event message from Kafka: {}", eventData);

            Notification notification = Notification.builder()
                    .userId(1L)
                    .type(NotificationType.ORDER_PLACED)
                    .subject("Order Placed Successfully")
                    .message("Order processed through User -> Gateway -> Order -> Product -> Inventory -> Payment pipeline. Event: " + eventData)
                    .status(NotificationStatus.SENT)
                    .createdAt(LocalDateTime.now())
                    .sentAt(LocalDateTime.now())
                    .build();

            Notification savedLog = notificationRepository.save(notification);
            log.info("✅ Saved notification event log to PostgreSQL database with ID: {}", savedLog.getId());
        } catch (Exception e) {
            log.error("❌ Error consuming Kafka event: {}", e.getMessage());
        }
    }
}
