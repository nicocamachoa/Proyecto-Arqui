package com.allconnect.billing.service;

import com.allconnect.billing.dto.InvoiceRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class BillingEventConsumer {

    private final BillingService billingService;

    @KafkaListener(topics = "billing-events", groupId = "billing-service-group")
    public void handleBillingEvent(Map<String, Object> event) {
        log.info("Received billing event: {}", event);

        try {
            Long orderId = getLongValue(event.get("orderId"));
            Long customerId = getLongValue(event.get("customerId"));
            BigDecimal amount = getBigDecimalValue(event.get("amount"));
            BigDecimal tax = getBigDecimalValue(event.get("tax"));

            InvoiceRequest request = InvoiceRequest.builder()
                    .orderId(orderId)
                    .customerId(customerId)
                    .subtotal(amount.subtract(tax))
                    .tax(tax)
                    .total(amount)
                    .build();

            billingService.createInvoice(request);
            log.info("Invoice created from billing event for order: {}", orderId);

        } catch (Exception e) {
            log.error("Error processing billing event: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "order-events", groupId = "billing-service-group")
    public void handleOrderEvent(Map<String, Object> event) {
        log.info("Received order event for billing: {}", event);

        try {
            String eventType = (String) event.get("eventType");

            if ("order.completed".equals(eventType)) {
                Long orderId = getLongValue(event.get("orderId"));
                Long customerId = getLongValue(event.get("customerId"));
                BigDecimal total = getBigDecimalValue(event.get("total"));

                // Calculate estimated tax (19%)
                BigDecimal taxRate = new BigDecimal("0.19");
                BigDecimal subtotal = total.divide(BigDecimal.ONE.add(taxRate), 2, BigDecimal.ROUND_HALF_UP);
                BigDecimal tax = total.subtract(subtotal);

                InvoiceRequest request = InvoiceRequest.builder()
                        .orderId(orderId)
                        .customerId(customerId)
                        .subtotal(subtotal)
                        .tax(tax)
                        .total(total)
                        .build();

                billingService.createInvoice(request);
                log.info("Invoice auto-created for completed order: {}", orderId);
            }

        } catch (Exception e) {
            log.error("Error processing order event for billing: {}", e.getMessage());
        }
    }

    private Long getLongValue(Object value) {
        if (value == null) return null;
        if (value instanceof Long) return (Long) value;
        if (value instanceof Integer) return ((Integer) value).longValue();
        if (value instanceof Number) return ((Number) value).longValue();
        return Long.parseLong(value.toString());
    }

    private BigDecimal getBigDecimalValue(Object value) {
        if (value == null) return BigDecimal.ZERO;
        if (value instanceof BigDecimal) return (BigDecimal) value;
        if (value instanceof Number) return BigDecimal.valueOf(((Number) value).doubleValue());
        return new BigDecimal(value.toString());
    }
}
