package com.allconnect.order.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@FeignClient(name = "payment-service", url = "${payment.service.url:http://localhost:8094}")
public interface PaymentClient {

    @PostMapping("/api/payments/process")
    Map<String, Object> processPayment(@RequestBody Map<String, Object> request);

    @PostMapping("/api/payments/{paymentId}/refund")
    Map<String, Object> refundPayment(@PathVariable Long paymentId);

    @GetMapping("/api/payments/{paymentId}")
    Map<String, Object> getPayment(@PathVariable Long paymentId);
}
