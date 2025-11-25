package com.allconnect.order.dto;

import com.allconnect.order.model.ProductType;
import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {

    private Long id;
    private Long productId;
    private String productName;
    private ProductType productType;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String bookingDate;
    private String bookingTime;
    private String subscriptionStart;
    private String subscriptionEnd;
}
