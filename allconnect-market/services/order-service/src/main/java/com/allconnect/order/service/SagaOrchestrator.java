package com.allconnect.order.service;

import com.allconnect.order.client.CatalogClient;
import com.allconnect.order.client.PaymentClient;
import com.allconnect.order.model.*;
import com.allconnect.order.repository.OrderRepository;
import com.allconnect.order.repository.SagaStateRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SagaOrchestrator {

    private final SagaStateRepository sagaStateRepository;
    private final OrderRepository orderRepository;
    private final PaymentClient paymentClient;
    private final CatalogClient catalogClient;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Async
    @Transactional
    public void startSaga(Order order) {
        log.info("Starting saga for order: {}", order.getId());

        // Create saga state
        SagaState sagaState = SagaState.builder()
                .orderId(order.getId())
                .currentStep(SagaStep.CREATED)
                .status(SagaStatus.IN_PROGRESS)
                .build();
        sagaState = sagaStateRepository.save(sagaState);

        try {
            // Step 1: Process Payment
            executePaymentStep(order, sagaState);

            // Step 2: Update Stock (for physical products)
            executeStockStep(order, sagaState);

            // Step 3: Confirm with Provider
            executeProviderStep(order, sagaState);

            // Step 4: Send Notification
            executeNotificationStep(order, sagaState);

            // Step 5: Create Invoice
            executeInvoiceStep(order, sagaState);

            // Complete saga
            completeSaga(order, sagaState);

        } catch (Exception e) {
            log.error("Saga failed for order {}: {}", order.getId(), e.getMessage());
            sagaState.setErrorMessage(e.getMessage());
            sagaState.setStatus(SagaStatus.FAILED);
            sagaStateRepository.save(sagaState);

            // Start compensation
            compensateSaga(order);
        }
    }

    @CircuitBreaker(name = "paymentService", fallbackMethod = "paymentFallback")
    private void executePaymentStep(Order order, SagaState sagaState) {
        log.info("Executing payment step for order: {}", order.getId());
        sagaState.setCurrentStep(SagaStep.PROCESS_PAYMENT);
        sagaStateRepository.save(sagaState);

        order.setStatus(OrderStatus.PAYMENT_PENDING);
        orderRepository.save(order);

        try {
            Map<String, Object> paymentRequest = new HashMap<>();
            paymentRequest.put("orderId", order.getId());
            paymentRequest.put("amount", order.getTotal());
            paymentRequest.put("method", order.getPaymentMethod());
            paymentRequest.put("customerId", order.getCustomerId());

            Map<String, Object> response = paymentClient.processPayment(paymentRequest);

            if ("COMPLETED".equals(response.get("status"))) {
                Long paymentId = ((Number) response.get("id")).longValue();
                order.setPaymentId(paymentId);
                order.setStatus(OrderStatus.PAYMENT_COMPLETED);
                orderRepository.save(order);

                sagaState.setPaymentCompleted(true);
                saveCompensationData(sagaState, "paymentId", paymentId);
                sagaStateRepository.save(sagaState);
                log.info("Payment completed for order: {}", order.getId());
            } else {
                throw new RuntimeException("Payment failed: " + response.get("message"));
            }
        } catch (Exception e) {
            log.warn("Payment service call failed, using mock: {}", e.getMessage());
            // Mock payment for demo
            mockPayment(order, sagaState);
        }
    }

    private void mockPayment(Order order, SagaState sagaState) {
        log.info("Using mock payment for order: {}", order.getId());
        // Simulate 90% success rate
        if (Math.random() < 0.9) {
            order.setPaymentId(System.currentTimeMillis());
            order.setStatus(OrderStatus.PAYMENT_COMPLETED);
            orderRepository.save(order);

            sagaState.setPaymentCompleted(true);
            saveCompensationData(sagaState, "paymentId", order.getPaymentId());
            sagaStateRepository.save(sagaState);
            log.info("Mock payment completed for order: {}", order.getId());
        } else {
            order.setStatus(OrderStatus.PAYMENT_FAILED);
            orderRepository.save(order);
            throw new RuntimeException("Mock payment failed");
        }
    }

    @CircuitBreaker(name = "catalogService", fallbackMethod = "stockFallback")
    private void executeStockStep(Order order, SagaState sagaState) {
        log.info("Executing stock update step for order: {}", order.getId());
        sagaState.setCurrentStep(SagaStep.UPDATE_STOCK);
        sagaStateRepository.save(sagaState);

        try {
            for (OrderItem item : order.getItems()) {
                if (item.getProductType() == ProductType.PHYSICAL) {
                    Map<String, Object> stockRequest = new HashMap<>();
                    stockRequest.put("quantity", item.getQuantity());
                    stockRequest.put("operation", "SUBTRACT");

                    catalogClient.updateStock(item.getProductId(), stockRequest);
                    log.info("Stock updated for product: {}", item.getProductId());
                }
            }
            sagaState.setStockUpdated(true);
            sagaStateRepository.save(sagaState);
        } catch (Exception e) {
            log.warn("Stock update failed, continuing with mock: {}", e.getMessage());
            sagaState.setStockUpdated(true);
            sagaStateRepository.save(sagaState);
        }
    }

    private void executeProviderStep(Order order, SagaState sagaState) {
        log.info("Executing provider confirmation step for order: {}", order.getId());
        sagaState.setCurrentStep(SagaStep.CONFIRM_PROVIDER);
        sagaStateRepository.save(sagaState);

        order.setStatus(OrderStatus.PROVIDER_PENDING);
        orderRepository.save(order);

        // Mock provider confirmation
        try {
            Thread.sleep(500); // Simulate API call
            order.setProviderOrderId("PROV-" + System.currentTimeMillis());
            order.setStatus(OrderStatus.PROVIDER_CONFIRMED);
            orderRepository.save(order);

            sagaState.setProviderConfirmed(true);
            saveCompensationData(sagaState, "providerOrderId", order.getProviderOrderId());
            sagaStateRepository.save(sagaState);
            log.info("Provider confirmed for order: {}", order.getId());
        } catch (Exception e) {
            log.error("Provider confirmation failed: {}", e.getMessage());
            throw new RuntimeException("Provider confirmation failed");
        }
    }

    private void executeNotificationStep(Order order, SagaState sagaState) {
        log.info("Executing notification step for order: {}", order.getId());
        sagaState.setCurrentStep(SagaStep.SEND_NOTIFICATION);
        sagaStateRepository.save(sagaState);

        try {
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "ORDER_CONFIRMATION");
            notification.put("customerId", order.getCustomerId());
            notification.put("orderId", order.getId());
            notification.put("total", order.getTotal());
            notification.put("channel", "EMAIL");

            kafkaTemplate.send("notification-events", notification);
            sagaState.setNotificationSent(true);
            sagaStateRepository.save(sagaState);
            log.info("Notification sent for order: {}", order.getId());
        } catch (Exception e) {
            log.warn("Notification failed: {}", e.getMessage());
            // Don't fail saga for notification failure
            sagaState.setNotificationSent(false);
            sagaStateRepository.save(sagaState);
        }
    }

    private void executeInvoiceStep(Order order, SagaState sagaState) {
        log.info("Executing invoice step for order: {}", order.getId());
        sagaState.setCurrentStep(SagaStep.CREATE_INVOICE);
        sagaStateRepository.save(sagaState);

        try {
            Map<String, Object> invoiceRequest = new HashMap<>();
            invoiceRequest.put("orderId", order.getId());
            invoiceRequest.put("customerId", order.getCustomerId());
            invoiceRequest.put("amount", order.getTotal());
            invoiceRequest.put("tax", order.getTax());

            kafkaTemplate.send("billing-events", invoiceRequest);

            // Mock invoice ID
            order.setInvoiceId(System.currentTimeMillis());
            orderRepository.save(order);

            sagaState.setInvoiceCreated(true);
            saveCompensationData(sagaState, "invoiceId", order.getInvoiceId());
            sagaStateRepository.save(sagaState);
            log.info("Invoice created for order: {}", order.getId());
        } catch (Exception e) {
            log.warn("Invoice creation failed: {}", e.getMessage());
            sagaState.setInvoiceCreated(false);
            sagaStateRepository.save(sagaState);
        }
    }

    private void completeSaga(Order order, SagaState sagaState) {
        log.info("Completing saga for order: {}", order.getId());
        sagaState.setCurrentStep(SagaStep.COMPLETED);
        sagaState.setStatus(SagaStatus.COMPLETED);
        sagaStateRepository.save(sagaState);

        order.setStatus(OrderStatus.COMPLETED);
        orderRepository.save(order);

        // Publish completion event
        Map<String, Object> event = new HashMap<>();
        event.put("eventType", "order.completed");
        event.put("orderId", order.getId());
        event.put("customerId", order.getCustomerId());
        event.put("total", order.getTotal());
        kafkaTemplate.send("order-events", event);

        log.info("Saga completed for order: {}", order.getId());
    }

    @Async
    @Transactional
    public void compensateSaga(Order order) {
        log.info("Starting compensation for order: {}", order.getId());

        SagaState sagaState = sagaStateRepository.findByOrderId(order.getId())
                .orElse(null);

        if (sagaState == null) {
            log.warn("No saga state found for order: {}", order.getId());
            return;
        }

        sagaState.setCurrentStep(SagaStep.COMPENSATING);
        sagaState.setStatus(SagaStatus.COMPENSATING);
        sagaStateRepository.save(sagaState);

        try {
            // Compensate in reverse order
            if (sagaState.getInvoiceCreated()) {
                compensateInvoice(order, sagaState);
            }

            if (sagaState.getNotificationSent()) {
                compensateNotification(order, sagaState);
            }

            if (sagaState.getProviderConfirmed()) {
                compensateProvider(order, sagaState);
            }

            if (sagaState.getStockUpdated()) {
                compensateStock(order, sagaState);
            }

            if (sagaState.getPaymentCompleted()) {
                compensatePayment(order, sagaState);
            }

            sagaState.setStatus(SagaStatus.COMPENSATED);
            sagaStateRepository.save(sagaState);

            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);

            log.info("Compensation completed for order: {}", order.getId());

        } catch (Exception e) {
            log.error("Compensation failed for order {}: {}", order.getId(), e.getMessage());
            sagaState.setStatus(SagaStatus.FAILED);
            sagaState.setErrorMessage("Compensation failed: " + e.getMessage());
            sagaStateRepository.save(sagaState);
        }
    }

    private void compensatePayment(Order order, SagaState sagaState) {
        log.info("Compensating payment for order: {}", order.getId());
        try {
            if (order.getPaymentId() != null) {
                paymentClient.refundPayment(order.getPaymentId());
            }
            order.setStatus(OrderStatus.REFUNDED);
            orderRepository.save(order);
        } catch (Exception e) {
            log.warn("Payment refund failed: {}", e.getMessage());
        }
    }

    private void compensateStock(Order order, SagaState sagaState) {
        log.info("Compensating stock for order: {}", order.getId());
        try {
            for (OrderItem item : order.getItems()) {
                if (item.getProductType() == ProductType.PHYSICAL) {
                    Map<String, Object> stockRequest = new HashMap<>();
                    stockRequest.put("quantity", item.getQuantity());
                    stockRequest.put("operation", "ADD");
                    catalogClient.updateStock(item.getProductId(), stockRequest);
                }
            }
        } catch (Exception e) {
            log.warn("Stock compensation failed: {}", e.getMessage());
        }
    }

    private void compensateProvider(Order order, SagaState sagaState) {
        log.info("Compensating provider for order: {}", order.getId());
        // Mock provider cancellation
        order.setProviderOrderId(null);
        orderRepository.save(order);
    }

    private void compensateNotification(Order order, SagaState sagaState) {
        log.info("Sending cancellation notification for order: {}", order.getId());
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "ORDER_CANCELLED");
        notification.put("customerId", order.getCustomerId());
        notification.put("orderId", order.getId());
        notification.put("channel", "EMAIL");
        kafkaTemplate.send("notification-events", notification);
    }

    private void compensateInvoice(Order order, SagaState sagaState) {
        log.info("Voiding invoice for order: {}", order.getId());
        // Mock invoice void
        order.setInvoiceId(null);
        orderRepository.save(order);
    }

    private void saveCompensationData(SagaState sagaState, String key, Object value) {
        try {
            Map<String, Object> data;
            if (sagaState.getCompensationData() != null) {
                data = objectMapper.readValue(sagaState.getCompensationData(), Map.class);
            } else {
                data = new HashMap<>();
            }
            data.put(key, value);
            sagaState.setCompensationData(objectMapper.writeValueAsString(data));
        } catch (Exception e) {
            log.warn("Failed to save compensation data: {}", e.getMessage());
        }
    }

    // Fallback methods
    private void paymentFallback(Order order, SagaState sagaState, Throwable t) {
        log.warn("Payment service unavailable, using fallback: {}", t.getMessage());
        mockPayment(order, sagaState);
    }

    private void stockFallback(Order order, SagaState sagaState, Throwable t) {
        log.warn("Catalog service unavailable for stock update: {}", t.getMessage());
        sagaState.setStockUpdated(true);
        sagaStateRepository.save(sagaState);
    }
}
