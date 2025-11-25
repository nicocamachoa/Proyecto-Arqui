package com.allconnect.billing.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceRequest {

    @NotNull(message = "Order ID is required")
    private Long orderId;

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Subtotal is required")
    @Positive(message = "Subtotal must be positive")
    private BigDecimal subtotal;

    @NotNull(message = "Tax is required")
    private BigDecimal tax;

    private BigDecimal shippingCost;

    @NotNull(message = "Total is required")
    @Positive(message = "Total must be positive")
    private BigDecimal total;

    private String customerName;
    private String customerEmail;
    private String billingAddress;
    private String notes;

    private List<InvoiceItemRequest> items;
}
