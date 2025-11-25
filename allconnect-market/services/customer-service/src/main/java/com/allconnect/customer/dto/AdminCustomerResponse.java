package com.allconnect.customer.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCustomerResponse {
    private Long id;
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private Integer ordersCount;
    private BigDecimal totalSpent;
    private LocalDateTime createdAt;
    private LocalDateTime lastOrderAt;
}
