package com.allconnect.order.controller;

import com.allconnect.order.dto.*;
import com.allconnect.order.model.*;
import com.allconnect.order.repository.OrderRepository;
import com.allconnect.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin Dashboard APIs")
@Slf4j
public class AdminController {

    private final OrderRepository orderRepository;
    private final OrderService orderService;

    @GetMapping("/orders")
    @Operation(summary = "Get all orders for admin")
    public ResponseEntity<List<AdminOrderResponse>> getAllOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String orderType) {

        List<Order> orders;
        if (status != null && !status.isEmpty()) {
            orders = orderRepository.findByStatus(OrderStatus.valueOf(status));
        } else {
            orders = orderRepository.findAll();
        }

        // Sort by creation date descending
        orders.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));

        List<AdminOrderResponse> response = orders.stream()
                .map(this::mapToAdminOrderResponse)
                .collect(Collectors.toList());

        // Filter by orderType if specified
        if (orderType != null && !orderType.isEmpty()) {
            response = response.stream()
                    .filter(o -> orderType.equals(o.getOrderType()))
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/dashboard/stats")
    @Operation(summary = "Get dashboard statistics")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        List<Order> allOrders = orderRepository.findAll();

        // Calculate totals
        int totalOrders = allOrders.size();
        BigDecimal totalRevenue = allOrders.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .map(Order::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int pendingOrders = (int) allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.CREATED || o.getStatus() == OrderStatus.PENDING)
                .count();

        // Get unique customers
        int totalCustomers = (int) allOrders.stream()
                .map(Order::getCustomerId)
                .distinct()
                .count();

        // Recent orders (last 5)
        List<AdminOrderResponse> recentOrders = allOrders.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .map(this::mapToAdminOrderResponse)
                .collect(Collectors.toList());

        // Sales by day (last 7 days)
        List<DashboardStatsResponse.SalesByDay> salesByDay = calculateSalesByDay(allOrders);

        // Top products
        List<DashboardStatsResponse.TopProduct> topProducts = calculateTopProducts(allOrders);

        DashboardStatsResponse stats = DashboardStatsResponse.builder()
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .totalCustomers(totalCustomers)
                .totalProducts(0) // Will be populated by catalog-service
                .pendingOrders(pendingOrders)
                .lowStockProducts(0) // Will be populated by catalog-service
                .recentOrders(recentOrders)
                .salesByDay(salesByDay)
                .topProducts(topProducts)
                .build();

        return ResponseEntity.ok(stats);
    }

    @PatchMapping("/orders/{orderId}/status")
    @Operation(summary = "Update order status")
    public ResponseEntity<AdminOrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> body) {

        String newStatus = body.get("status");
        orderService.updateOrderStatus(orderId, OrderStatus.valueOf(newStatus));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        return ResponseEntity.ok(mapToAdminOrderResponse(order));
    }

    @PatchMapping("/operations/orders/{orderId}/status")
    @Operation(summary = "Update order status (operations)")
    public ResponseEntity<AdminOrderResponse> updateOrderStatusOperations(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> body) {
        return updateOrderStatus(orderId, body);
    }

    @PatchMapping("/operations/orders/{orderId}/ship")
    @Operation(summary = "Mark order as shipped")
    public ResponseEntity<AdminOrderResponse> markAsShipped(
            @PathVariable Long orderId,
            @RequestBody(required = false) Map<String, String> body) {

        orderService.updateOrderStatus(orderId, OrderStatus.SHIPPED);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        return ResponseEntity.ok(mapToAdminOrderResponse(order));
    }

    @GetMapping("/operations/orders")
    @Operation(summary = "Get orders for operations")
    public ResponseEntity<List<AdminOrderResponse>> getOperationsOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String orderType) {
        return getAllOrders(status, orderType);
    }

    @GetMapping("/operations/shipping/queue")
    @Operation(summary = "Get shipping queue")
    public ResponseEntity<List<AdminOrderResponse>> getShippingQueue() {
        List<Order> orders = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == OrderStatus.CONFIRMED || o.getStatus() == OrderStatus.PROCESSING)
                .sorted((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()))
                .collect(Collectors.toList());

        List<AdminOrderResponse> response = orders.stream()
                .map(this::mapToAdminOrderResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    private AdminOrderResponse mapToAdminOrderResponse(Order order) {
        List<AdminOrderResponse.AdminOrderItemResponse> items = order.getItems().stream()
                .map(item -> AdminOrderResponse.AdminOrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .productType(item.getProductType() != null ? item.getProductType().name() : "PHYSICAL")
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .totalPrice(item.getTotalPrice())
                        .build())
                .collect(Collectors.toList());

        // Determine order type based on items
        String orderType = determineOrderType(order.getItems());

        return AdminOrderResponse.builder()
                .id(order.getId())
                .orderNumber(generateOrderNumber(order.getId()))
                .customerId(order.getCustomerId())
                .customerName("Cliente #" + order.getCustomerId()) // Will be enriched by customer-service
                .customerEmail("cliente" + order.getCustomerId() + "@test.com")
                .status(order.getStatus())
                .orderType(orderType)
                .subtotal(order.getSubtotal())
                .tax(order.getTax())
                .shippingCost(order.getShippingCost())
                .discount(BigDecimal.ZERO)
                .total(order.getTotal())
                .shippingAddress(order.getShippingAddress())
                .paymentMethod(order.getPaymentMethod())
                .items(items)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    private String generateOrderNumber(Long orderId) {
        return String.format("ORD-%d-%06d", LocalDate.now().getYear(), orderId);
    }

    private String determineOrderType(List<OrderItem> items) {
        if (items == null || items.isEmpty()) return "MIXED";

        Set<ProductType> types = items.stream()
                .map(OrderItem::getProductType)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        if (types.size() == 1) {
            return types.iterator().next().name();
        }
        return "MIXED";
    }

    private List<DashboardStatsResponse.SalesByDay> calculateSalesByDay(List<Order> orders) {
        LocalDate today = LocalDate.now();
        List<DashboardStatsResponse.SalesByDay> salesByDay = new ArrayList<>();

        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();

            List<Order> dayOrders = orders.stream()
                    .filter(o -> o.getCreatedAt() != null &&
                            o.getCreatedAt().isAfter(startOfDay) &&
                            o.getCreatedAt().isBefore(endOfDay) &&
                            o.getStatus() != OrderStatus.CANCELLED)
                    .collect(Collectors.toList());

            BigDecimal revenue = dayOrders.stream()
                    .map(Order::getTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            salesByDay.add(DashboardStatsResponse.SalesByDay.builder()
                    .date(date.toString())
                    .revenue(revenue)
                    .orders(dayOrders.size())
                    .build());
        }

        return salesByDay;
    }

    private List<DashboardStatsResponse.TopProduct> calculateTopProducts(List<Order> orders) {
        Map<Long, DashboardStatsResponse.TopProduct> productSales = new HashMap<>();

        for (Order order : orders) {
            if (order.getStatus() == OrderStatus.CANCELLED) continue;

            for (OrderItem item : order.getItems()) {
                Long productId = item.getProductId();

                DashboardStatsResponse.TopProduct existing = productSales.get(productId);
                if (existing == null) {
                    existing = DashboardStatsResponse.TopProduct.builder()
                            .productId(productId)
                            .productName(item.getProductName())
                            .sku("SKU-" + productId)
                            .price(item.getUnitPrice())
                            .sales(0)
                            .build();
                }

                existing.setSales(existing.getSales() + item.getQuantity());
                productSales.put(productId, existing);
            }
        }

        return productSales.values().stream()
                .sorted((a, b) -> b.getSales().compareTo(a.getSales()))
                .limit(5)
                .collect(Collectors.toList());
    }
}
