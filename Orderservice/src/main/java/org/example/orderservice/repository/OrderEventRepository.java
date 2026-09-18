package org.example.orderservice.repository;

import org.example.orderservice.common.EventType;
import org.example.orderservice.model.OrderEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderEventRepository extends JpaRepository<OrderEvent, Long> {
//    List<OrderEvent> findByOrderId(Long orderId);
 
    List<OrderEvent> findByOrderIdOrderByCreatedAtDesc(Long orderId);
 
//    List<OrderEvent> findByEventType(EventType eventType);
 
//    @Query("SELECT oe FROM OrderEvent oe WHERE oe.orderId = :orderId AND oe.createdAt BETWEEN :startDate AND :endDate ORDER BY oe.createdAt DESC")
//    List<OrderEvent> findOrderEventsByDateRange(
//            @Param("orderId") Long orderId,
//            @Param("startDate") LocalDateTime startDate,
//            @Param("endDate") LocalDateTime endDate);
}