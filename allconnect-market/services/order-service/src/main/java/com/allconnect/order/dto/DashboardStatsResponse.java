package com.allconnect.order.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private Integer totalOrders;
    private BigDecimal totalRevenue;
    private Integer totalCustomers;
    private Integer totalProducts;
    private Integer pendingOrders;
    private Integer lowStockProducts;
    private List<AdminOrderResponse> recentOrders;
    private List<SalesByDay> salesByDay;
    private List<SalesByCategory> salesByCategory;
    private List<TopProduct> topProducts;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalesByDay {
        private String date;
        private BigDecimal revenue;
        private Integer orders;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalesByCategory {
        private String category;
        private BigDecimal revenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopProduct {
        private Long productId;
        private String productName;
        private String sku;
        private BigDecimal price;
        private Integer sales;
    }
}
