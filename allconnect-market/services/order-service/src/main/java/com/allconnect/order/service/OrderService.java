package com.allconnect.order.service;

import com.allconnect.order.dto.*;
import com.allconnect.order.model.*;
import com.allconnect.order.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final SagaStateRepository sagaStateRepository;
    private final SagaOrchestrator sagaOrchestrator;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final BigDecimal TAX_RATE = new BigDecimal("0.19"); // 19% IVA

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        log.info("Creating order for customer: {}", request.getCustomerId());

        // Calculate totals
        BigDecimal subtotal = BigDecimal.ZERO;
        for (OrderItemRequest item : request.getItems()) {
            BigDecimal itemTotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            subtotal = subtotal.add(itemTotal);
        }

        BigDecimal tax = subtotal.multiply(TAX_RATE);
        BigDecimal shippingCost = calculateShippingCost(request.getItems());
        BigDecimal total = subtotal.add(tax).add(shippingCost);

        // Create order
        Order order = Order.builder()
                .customerId(request.getCustomerId())
                .status(OrderStatus.CREATED)
                .subtotal(subtotal)
                .tax(tax)
                .shippingCost(shippingCost)
                .total(total)
                .shippingAddress(request.getShippingAddress())
                .paymentMethod(request.getPaymentMethod())
                .notes(request.getNotes())
                .build();

        // Add items
        for (OrderItemRequest itemRequest : request.getItems()) {
            OrderItem item = OrderItem.builder()
                    .productId(itemRequest.getProductId())
                    .productName(itemRequest.getProductName())
                    .productType(itemRequest.getProductType())
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(itemRequest.getUnitPrice())
                    .totalPrice(itemRequest.getUnitPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity())))
                    .bookingDate(itemRequest.getBookingDate())
                    .bookingTime(itemRequest.getBookingTime())
                    .build();
            order.addItem(item);
        }

        order = orderRepository.save(order);
        log.info("Order created with ID: {}", order.getId());

        // Start Saga
        sagaOrchestrator.startSaga(order);

        // Publish event
        publishOrderEvent("order.created", order);

        return mapToOrderResponse(order);
    }

    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return mapToOrderResponse(order);
    }

    public List<OrderResponse> getOrdersByCustomer(Long customerId) {
        return orderRepository.findByCustomerId(customerId).stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    public Page<OrderResponse> getOrdersByCustomerPaged(Long customerId, int page, int size) {
        return orderRepository.findByCustomerId(customerId, PageRequest.of(page, size))
                .map(this::mapToOrderResponse);
    }

    public OrderResponse getOrderStatus(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return mapToOrderResponse(order);
    }

    @Transactional
    public OrderResponse cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() == OrderStatus.COMPLETED ||
            order.getStatus() == OrderStatus.CANCELLED ||
            order.getStatus() == OrderStatus.REFUNDED) {
            throw new RuntimeException("Cannot cancel order in status: " + order.getStatus());
        }

        log.info("Cancelling order: {}", id);

        // Start compensation saga
        sagaOrchestrator.compensateSaga(order);

        order.setStatus(OrderStatus.CANCELLED);
        order = orderRepository.save(order);

        // Publish event
        publishOrderEvent("order.cancelled", order);

        return mapToOrderResponse(order);
    }

    @Transactional
    public void updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        orderRepository.save(order);
        log.info("Order {} status updated to: {}", orderId, status);
    }

    @Transactional
    public void updateOrderPayment(Long orderId, Long paymentId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setPaymentId(paymentId);
        orderRepository.save(order);
    }

    @Transactional
    public void updateOrderInvoice(Long orderId, Long invoiceId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setInvoiceId(invoiceId);
        orderRepository.save(order);
    }

    private BigDecimal calculateShippingCost(List<OrderItemRequest> items) {
        boolean hasPhysical = items.stream()
                .anyMatch(item -> item.getProductType() == ProductType.PHYSICAL);
        return hasPhysical ? new BigDecimal("15000") : BigDecimal.ZERO;
    }

    private OrderResponse mapToOrderResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(this::mapToOrderItemResponse)
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .customerId(order.getCustomerId())
                .status(order.getStatus())
                .subtotal(order.getSubtotal())
                .tax(order.getTax())
                .shippingCost(order.getShippingCost())
                .total(order.getTotal())
                .shippingAddress(order.getShippingAddress())
                .paymentMethod(order.getPaymentMethod())
                .paymentId(order.getPaymentId())
                .invoiceId(order.getInvoiceId())
                .providerOrderId(order.getProviderOrderId())
                .notes(order.getNotes())
                .items(items)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    private OrderItemResponse mapToOrderItemResponse(OrderItem item) {
        return OrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProductId())
                .productName(item.getProductName())
                .productType(item.getProductType())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .totalPrice(item.getTotalPrice())
                .bookingDate(item.getBookingDate())
                .bookingTime(item.getBookingTime())
                .subscriptionStart(item.getSubscriptionStart())
                .subscriptionEnd(item.getSubscriptionEnd())
                .build();
    }

    private void publishOrderEvent(String eventType, Order order) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("eventType", eventType);
            event.put("orderId", order.getId());
            event.put("customerId", order.getCustomerId());
            event.put("status", order.getStatus().name());
            event.put("total", order.getTotal());
            event.put("timestamp", System.currentTimeMillis());

            kafkaTemplate.send("order-events", event);
            log.info("Published event: {} for order: {}", eventType, order.getId());
        } catch (Exception e) {
            log.warn("Failed to publish Kafka event: {}", e.getMessage());
        }
    }
}
