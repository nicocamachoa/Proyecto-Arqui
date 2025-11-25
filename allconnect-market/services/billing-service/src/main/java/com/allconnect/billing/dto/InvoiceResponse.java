package com.allconnect.billing.dto;

import com.allconnect.billing.model.InvoiceStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceResponse {

    private Long id;
    private String invoiceNumber;
    private Long orderId;
    private Long customerId;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal shippingCost;
    private BigDecimal total;
    private InvoiceStatus status;
    private String customerName;
    private String customerEmail;
    private String billingAddress;
    private String notes;
    private String pdfUrl;
    private LocalDateTime issuedAt;
    private LocalDateTime paidAt;
    private LocalDateTime cancelledAt;
    private List<InvoiceItemResponse> items;
}
