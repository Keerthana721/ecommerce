package org.example.orderservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.orderservice.common.EventType;

import java.time.LocalDateTime;

@Entity
@Table(name = "order_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "event_type")
    @Enumerated(EnumType.STRING)
    private EventType eventType;
    @Lob
    private String eventData;



    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}