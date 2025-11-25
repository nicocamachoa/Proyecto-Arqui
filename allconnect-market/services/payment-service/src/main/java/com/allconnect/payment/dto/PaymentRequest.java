package com.allconnect.payment.dto;

import com.allconnect.payment.model.PaymentMethod;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {

    @NotNull(message = "Order ID is required")
    private Long orderId;

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Payment method is required")
    private PaymentMethod method;

    // Card details (for card payments)
    private String cardNumber;
    private String cardHolderName;
    private String expiryDate;
    private String cvv;

    // Bank details (for bank transfers)
    private String bankCode;
    private String accountNumber;
}
