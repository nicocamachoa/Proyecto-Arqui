package com.allconnect.payment.dto;

import com.allconnect.payment.model.PaymentMethod;
import com.allconnect.payment.model.PaymentStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private Long id;
    private Long orderId;
    private Long customerId;
    private BigDecimal amount;
    private PaymentStatus status;
    private PaymentMethod method;
    private String transactionId;
    private String cardLastFour;
    private String cardBrand;
    private String errorMessage;
    private String refundId;
    private BigDecimal refundedAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
