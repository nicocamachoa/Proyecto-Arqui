package com.allconnect.customer.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishlistItemResponse {

    private Long id;
    private Long customerId;
    private Long productId;
    private LocalDateTime addedAt;
}
