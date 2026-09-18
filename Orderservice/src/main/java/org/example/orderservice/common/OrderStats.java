package org.example.orderservice.common;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderStats {
    private long totalOrders;
    private long completedOrders;
    private long pendingOrders;
    private double totalSpent;
}