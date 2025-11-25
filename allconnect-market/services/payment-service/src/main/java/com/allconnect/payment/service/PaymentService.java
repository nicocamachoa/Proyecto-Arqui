package com.allconnect.payment.service;

import com.allconnect.payment.dto.*;
import com.allconnect.payment.model.*;
import com.allconnect.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${payment.mock.success-rate:0.9}")
    private double successRate;

    @Value("${payment.mock.processing-delay-ms:1500}")
    private long processingDelayMs;

    @Transactional
    public PaymentResponse processPayment(PaymentRequest request) {
        log.info("Processing payment for order: {}", request.getOrderId());

        // Create payment record
        Payment payment = Payment.builder()
                .orderId(request.getOrderId())
                .customerId(request.getCustomerId())
                .amount(request.getAmount())
                .method(request.getMethod())
                .status(PaymentStatus.PROCESSING)
                .build();

        // Extract card info if present
        if (request.getCardNumber() != null && request.getCardNumber().length() >= 4) {
            payment.setCardLastFour(request.getCardNumber().substring(request.getCardNumber().length() - 4));
            payment.setCardBrand(detectCardBrand(request.getCardNumber()));
        }

        payment = paymentRepository.save(payment);

        // Simulate payment processing
        try {
            Thread.sleep(processingDelayMs);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Mock payment gateway response (90% success rate)
        boolean success = Math.random() < successRate;

        if (success) {
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            payment.setGatewayResponse("{\"status\":\"approved\",\"code\":\"00\"}");
            log.info("Payment completed successfully for order: {}", request.getOrderId());

            // Publish success event
            publishPaymentEvent("payment.completed", payment);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setErrorMessage("Payment declined by issuer");
            payment.setGatewayResponse("{\"status\":\"declined\",\"code\":\"51\"}");
            log.warn("Payment failed for order: {}", request.getOrderId());

            // Publish failure event
            publishPaymentEvent("payment.failed", payment);
        }

        payment = paymentRepository.save(payment);
        return mapToPaymentResponse(payment);
    }

    public PaymentResponse getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        return mapToPaymentResponse(payment);
    }

    public List<PaymentResponse> getPaymentsByOrder(Long orderId) {
        return paymentRepository.findByOrderId(orderId).stream()
                .map(this::mapToPaymentResponse)
                .collect(Collectors.toList());
    }

    public List<PaymentResponse> getPaymentsByCustomer(Long customerId) {
        return paymentRepository.findByCustomerId(customerId).stream()
                .map(this::mapToPaymentResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public PaymentResponse refundPayment(Long paymentId) {
        log.info("Processing refund for payment: {}", paymentId);

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getStatus() != PaymentStatus.COMPLETED) {
            throw new RuntimeException("Only completed payments can be refunded");
        }

        // Simulate refund processing
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        payment.setStatus(PaymentStatus.REFUNDED);
        payment.setRefundId("REF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        payment.setRefundedAmount(payment.getAmount());
        payment = paymentRepository.save(payment);

        log.info("Refund completed for payment: {}", paymentId);

        // Publish refund event
        publishPaymentEvent("payment.refunded", payment);

        return mapToPaymentResponse(payment);
    }

    private String detectCardBrand(String cardNumber) {
        if (cardNumber == null || cardNumber.isEmpty()) {
            return "UNKNOWN";
        }
        String cleanNumber = cardNumber.replaceAll("\\s", "");
        if (cleanNumber.startsWith("4")) {
            return "VISA";
        } else if (cleanNumber.startsWith("5")) {
            return "MASTERCARD";
        } else if (cleanNumber.startsWith("3")) {
            return "AMEX";
        }
        return "OTHER";
    }

    private PaymentResponse mapToPaymentResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrderId())
                .customerId(payment.getCustomerId())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .method(payment.getMethod())
                .transactionId(payment.getTransactionId())
                .cardLastFour(payment.getCardLastFour())
                .cardBrand(payment.getCardBrand())
                .errorMessage(payment.getErrorMessage())
                .refundId(payment.getRefundId())
                .refundedAmount(payment.getRefundedAmount())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }

    private void publishPaymentEvent(String eventType, Payment payment) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("eventType", eventType);
            event.put("paymentId", payment.getId());
            event.put("orderId", payment.getOrderId());
            event.put("customerId", payment.getCustomerId());
            event.put("amount", payment.getAmount());
            event.put("status", payment.getStatus().name());
            event.put("transactionId", payment.getTransactionId());
            event.put("timestamp", System.currentTimeMillis());

            kafkaTemplate.send("payment-events", event);
            log.info("Published event: {} for payment: {}", eventType, payment.getId());
        } catch (Exception e) {
            log.warn("Failed to publish Kafka event: {}", e.getMessage());
        }
    }
}
