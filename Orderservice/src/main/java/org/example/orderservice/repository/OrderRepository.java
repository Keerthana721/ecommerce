package org.example.orderservice.repository;

import feign.Param;
import org.example.orderservice.common.OrderStatus;
import org.example.orderservice.common.PaymentStatus;
import org.example.orderservice.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Find by user
    List<Order> findByUserId(Long userId);

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Find by status
    List<Order> findByStatus(OrderStatus status);

    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);

    // Find by payment status
    List<Order> findByPaymentStatus(PaymentStatus paymentStatus);

    // Complex queries
    @Query("SELECT o FROM Order o WHERE o.userId = :userId AND o.status = :status")
    List<Order> findUserOrdersByStatus(@Param("userId") Long userId, @Param("status") OrderStatus status);

    @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate ORDER BY o.createdAt DESC")
    List<Order> findOrdersByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.userId = :userId AND o.status = :status")
    long countByUserIdAndStatus(@Param("userId") Long userId, @Param("status") OrderStatus status);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.userId = :userId AND o.paymentStatus = :paymentStatus")
    Double sumTotalAmountByUserIdAndPaymentStatus(
            @Param("userId") Long userId,
            @Param("paymentStatus") PaymentStatus paymentStatus);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.userId = :userId ")
    long countByUserId(Long userId);
}
 
